// src/stores/financeStore.js
import {defineStore} from 'pinia';

export const useFinanceStore = defineStore('finance', {
    persist: true,

    state: () => ({
        cuentas: [
            {id: 1, nombre: 'Banco Principal', saldo: 50000},
            {id: 2, nombre: 'Efectivo', saldo: 3000},
        ],
        ingresos: [
            {
                id: 1,
                cuentaId: 1,
                descripcion: 'Salario Mensual - Mayo',
                categoria: 'Salario',
                monto: 35000,
                fecha: '2025-06-20'
            },
        ],
        gastos: [
            {
                id: 1,
                cuentaId: 1,
                descripcion: 'Renta Departamento',
                categoria: 'Vivienda',
                monto: 12000,
                fecha: '2025-06-20'
            },
        ],
        gastosFijos: [
            {id: 'f1', descripcion: 'Renta Mensual', monto: 7500, categoria: 'Vivienda', diaPago: 1},
            {id: 'f2', descripcion: 'Plan Internet/Telefonía', monto: 550, categoria: 'Servicios', diaPago: 15},
            {id: 'f3', descripcion: 'Suscripción Gimnasio', monto: 600, categoria: 'Entretenimiento', diaPago: 5},
            {id: 'f4', descripcion: 'Seguro de Auto', monto: 800, categoria: 'Transporte', diaPago: 20},
        ],
        inversiones: [
            {
                id: 2,
                cuentaId: 1,
                tipo: 'credito',
                descripcion: 'Préstamo personal',
                beneficiario: 'Juan Pérez',
                montoInvertido: 5000,
                interes: 10,
                montoTotal: 5500,
                ganancia: 500,
                fechaInversion: '2024-05-01',
                fechaVencimiento: '2025-06-01',
                estado: 'activa'
            }
        ],
        pagos: [
            // Ahora los pagos deben tener una cuenta de origen para descontar el saldo
            {id: 1, creditoId: 2, cuentaOrigenId: 2, fecha: '2025-06-15', monto: 2000, descripcion: 'Primera cuota'}
        ]
    }),

    getters: {
        // --- GETTERS GENERALES ---
        balanceGeneral: (state) => state.cuentas.reduce((sum, cuenta) => sum + cuenta.saldo, 0),
        totalInvertidoActivo: (state) => state.inversiones
            .filter(inv => inv.estado === 'activa')
            .reduce((sum, inv) => sum + inv.montoInvertido, 0),

        totalGanancias: (state) => state.inversiones
            .reduce((sum, inv) => sum + (inv.ganancia || 0), 0),
        // --- GETTERS PARA REPORTES (con parámetros) ---
        gastosPorCategoria: (state) => (startDate, endDate) => {
            const filtered = state.gastos.filter(g => {
                const fechaGasto = new Date(g.fecha);
                return fechaGasto >= startDate && fechaGasto <= endDate;
            });
            return filtered.reduce((acc, gasto) => {
                acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.monto;
                return acc;
            }, {});
        },
        ingresosPorCategoria: (state) => (startDate, endDate) => {
            const filtered = state.ingresos.filter(i => {
                const fechaIngreso = new Date(i.fecha);
                return fechaIngreso >= startDate && fechaIngreso <= endDate;
            });
            return filtered.reduce((acc, ingreso) => {
                acc[ingreso.categoria] = (acc[ingreso.categoria] || 0) + ingreso.monto;
                return acc;
            }, {});
        },

        // --- GETTERS ESPECÍFICOS ---
        pagosPorCreditoId: (state) => (creditoId) => {
            return state.pagos.filter(p => p.creditoId === creditoId);
        },
        getCuentaById: (state) => (cuentaId) => {
            return state.cuentas.find(c => c.id === cuentaId);
        }
    },

    actions: {
        // --- ACCIONES DE CUENTAS ---
        addCuenta(cuenta) {
            this.cuentas.push({id: Date.now(), ...cuenta, saldo: cuenta.saldo || 0});
        },
        updateCuenta(cuentaActualizada) {
            const index = this.cuentas.findIndex(c => c.id === cuentaActualizada.id);
            if (index !== -1) {
                this.cuentas[index] = cuentaActualizada;
            }
        },
        deleteCuenta(cuentaId) {
            // Lógica de seguridad: no permitir borrar si tiene transacciones asociadas.
            const tieneTransacciones = this.ingresos.some(i => i.cuentaId === cuentaId) ||
                this.gastos.some(g => g.cuentaId === cuentaId) ||
                this.inversiones.some(inv => inv.cuentaId === cuentaId);
            if (tieneTransacciones) {
                alert('No se puede eliminar una cuenta con transacciones asociadas.');
                return;
            }
            this.cuentas = this.cuentas.filter(c => c.id !== cuentaId);
        },

        // --- ACCIONES DE INGRESOS ---
        addIngreso(ingreso) {
            this.ingresos.push({id: Date.now(), ...ingreso});
            const cuenta = this.cuentas.find(c => c.id === ingreso.cuentaId);
            if (cuenta) cuenta.saldo += ingreso.monto;
        },
        updateIngreso(ingresoActualizado) {
            const index = this.ingresos.findIndex(i => i.id === ingresoActualizado.id);
            if (index === -1) return;
            const ingresoOriginal = this.ingresos[index];

            const cuentaOriginal = this.cuentas.find(c => c.id === ingresoOriginal.cuentaId);
            if (cuentaOriginal) cuentaOriginal.saldo -= ingresoOriginal.monto;

            const cuentaNueva = this.cuentas.find(c => c.id === ingresoActualizado.cuentaId);
            if (cuentaNueva) cuentaNueva.saldo += ingresoActualizado.monto;

            this.ingresos[index] = ingresoActualizado;
        },
        deleteIngreso(ingresoId) {
            const index = this.ingresos.findIndex(i => i.id === ingresoId);
            if (index === -1) return;
            const ingreso = this.ingresos[index];
            const cuenta = this.cuentas.find(c => c.id === ingreso.cuentaId);
            if (cuenta) cuenta.saldo -= ingreso.monto;
            this.ingresos.splice(index, 1);
        },

        // --- ACCIONES DE GASTOS ---
        addGasto(gasto) {
            this.gastos.push({id: Date.now(), ...gasto});
            const cuenta = this.cuentas.find(c => c.id === gasto.cuentaId);
            if (cuenta) cuenta.saldo -= gasto.monto;
        },
        updateGasto(gastoActualizado) {
            const index = this.gastos.findIndex(g => g.id === gastoActualizado.id);
            if (index === -1) return;
            const gastoOriginal = this.gastos[index];

            const cuentaOriginal = this.cuentas.find(c => c.id === gastoOriginal.cuentaId);
            if (cuentaOriginal) cuentaOriginal.saldo += gastoOriginal.monto;

            const cuentaNueva = this.cuentas.find(c => c.id === gastoActualizado.cuentaId);
            if (cuentaNueva) cuentaNueva.saldo -= gastoActualizado.monto;

            this.gastos[index] = gastoActualizado;
        },
        deleteGasto(gastoId) {
            const index = this.gastos.findIndex(g => g.id === gastoId);
            if (index === -1) return;
            const gasto = this.gastos[index];
            const cuenta = this.cuentas.find(c => c.id === gasto.cuentaId);
            if (cuenta) cuenta.saldo += gasto.monto;
            this.gastos.splice(index, 1);
        },
        addGastoFijo(gastoFijo) {
            const newId = 'f' + (this.gastosFijos.length + 1);
            this.gastosFijos.push({...gastoFijo, id: newId});
        },

        updateGastoFijo(gastoFijo) {
            const index = this.gastosFijos.findIndex(g => g.id === gastoFijo.id);
            if (index !== -1) {
                this.gastosFijos[index] = {...gastoFijo};
            }
        },

        deleteGastoFijo(id) {
            this.gastosFijos = this.gastosFijos.filter(g => g.id !== id);
        },
        // --- ACCIONES DE INVERSIONES ---
        addInversion(inversion) {
            this.inversiones.push({id: Date.now(), ...inversion});
            const cuenta = this.cuentas.find(c => c.id === inversion.cuentaId);
            if (cuenta) cuenta.saldo -= inversion.montoInvertido;
        },
        updateInversion(inversionActualizada) {
            const index = this.inversiones.findIndex(i => i.id === inversionActualizada.id);
            if (index === -1) return;
            const inversionOriginal = this.inversiones[index];

            const cuentaOriginal = this.cuentas.find(c => c.id === inversionOriginal.cuentaId);
            if (cuentaOriginal) cuentaOriginal.saldo += inversionOriginal.montoInvertido;

            const cuentaNueva = this.cuentas.find(c => c.id === inversionActualizada.cuentaId);
            if (cuentaNueva) cuentaNueva.saldo -= inversionActualizada.montoInvertido;

            this.inversiones[index] = inversionActualizada;
        },
        deleteInversion(inversionId) {
            const index = this.inversiones.findIndex(i => i.id === inversionId);
            if (index === -1) return;
            const inversion = this.inversiones[index];
            // Solo se revierte el saldo si la inversión estaba activa
            if (inversion.estado === 'activa') {
                const cuenta = this.cuentas.find(c => c.id === inversion.cuentaId);
                if (cuenta) cuenta.saldo += inversion.montoInvertido;
            }
            this.inversiones.splice(index, 1);
        },
        finalizarInversion({inversionId, cuentaDestinoId, montoRetorno}) {
            const index = this.inversiones.findIndex(i => i.id === inversionId);
            if (index === -1) return;

            const cuentaDestino = this.cuentas.find(c => c.id === cuentaDestinoId);
            if (!cuentaDestino) return;

            // Ingresar el retorno a la cuenta de destino
            cuentaDestino.saldo += montoRetorno;
            // Actualizar el estado de la inversión
            this.inversiones[index].estado = 'finalizada';
            this.inversiones[index].montoRetorno = montoRetorno; // Guardar el retorno
        },

        // --- ACCIONES DE PAGOS DE CRÉDITOS ---
        addPago(pago) {
            // Un pago es un gasto, por lo que debe salir de una cuenta
            const cuentaOrigen = this.cuentas.find(c => c.id === pago.cuentaOrigenId);
            if (!cuentaOrigen || cuentaOrigen.saldo < pago.monto) {
                alert('Saldo insuficiente en la cuenta de origen.');
                return;
            }
            cuentaOrigen.saldo -= pago.monto;
            this.pagos.push({id: Date.now(), ...pago});
        },
        deletePago(pagoId) {
            const index = this.pagos.findIndex(p => p.id === pagoId);
            if (index === -1) return;
            const pago = this.pagos[index];

            // Reembolsar el monto a la cuenta de origen
            const cuentaOrigen = this.cuentas.find(c => c.id === pago.cuentaOrigenId);
            if (cuentaOrigen) cuentaOrigen.saldo += pago.monto;

            this.pagos.splice(index, 1);
        }
    },
});