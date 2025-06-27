import {defineStore} from 'pinia';

            export const useFinanceStore = defineStore('finance', {
                persist: true,

                state: () => ({
                    // CORRECCIÓN: Se añade el campo 'tipo' a las cuentas iniciales
                    cuentas: [{
                        id: 1, nombre: 'Banco Principal', saldo: 50000, tipo: 'activo'
                    }, {
                        id: 2, nombre: 'Efectivo', saldo: 3000, tipo: 'activo'
                    },],
                    ingresos: [{
                        id: 1,
                        cuentaId: 1,
                        descripcion: 'Salario Mensual - Mayo',
                        categoria: 'Salario',
                        monto: 35000,
                        fecha: '2025-06-20'
                    },],
                    gastos: [{
                        id: 1,
                        cuentaId: 1,
                        descripcion: 'Renta Departamento',
                        categoria: 'Vivienda',
                        monto: 12000,
                        fecha: '2025-06-20'
                    },],
                    inversiones: [{
                        id: 1,
                        cuentaId: 1,
                        tipo: 'credito',
                        descripcion: 'Préstamo a Juan Pérez',
                        beneficiario: 'Juan Pérez',
                        montoInvertido: 5000,
                        interes: 10,
                        margenGanancia: 0,
                        montoTotal: 5500,
                        ganancia: 500,
                        fechaInversion: '2023-10-01',
                        fechaVencimiento: '2024-10-01',
                        estado: 'activa'
                    }],
                    pagos: [{
                        id: 1,
                        creditoId: 1,
                        fecha: '2024-01-15',
                        monto: 550,
                        descripcion: 'Primer pago'
                    }],
                    categoriasTransaccion: {
                        ingreso: [
                            {label: 'Salario', value: 'Salario'},
                            {label: 'Ventas', value: 'Ventas'},
                            {label: 'Bonificación', value: 'Bonificación'},
                            {label: 'Otro', value: 'Otro'},
                        ],
                        gasto: [
                            {label: 'Alimentación', value: 'Alimentación'},
                            {label: 'Transporte', value: 'Transporte'},
                            {label: 'Vivienda', value: 'Vivienda'},
                            {label: 'Entretenimiento', value: 'Entretenimiento'},
                            {label: 'Salud', value: 'Salud'},
                            {label: 'Servicios', value: 'Servicios'},
                            {label: 'Otro', value: 'Otro'},
                        ]
                    },
                    tiposCuenta: [
                        {label: 'Activo', value: 'activo'},
                        {label: 'Pasivo', value: 'pasivo'}
                    ]
                }),

                getters: {
                    balanceGeneral: (state) => {
                        const totalCuentas = state.cuentas.reduce((sum, cuenta) => sum + (Number(cuenta.saldo) || 0), 0);
                        const totalInversiones = state.inversiones.reduce((sum, inv) => sum + (Number(inv.montoInvertido) || 0), 0);
                        return totalCuentas + totalInversiones;
                    },
                    totalInvertido: (state) => state.inversiones.reduce((sum, inv) => sum + inv.montoInvertido, 0),
                    totalGanancias: (state) => state.inversiones.reduce((sum, inv) => sum + (inv.ganancia || 0), 0),
                    totalInvertidoActivo: (state) => {
                        return state.inversiones
                            .filter(inv => inv.estado === 'activa')
                            .reduce((sum, inv) => sum + inv.montoInvertido, 0);
                    },
                    pagosPorCreditoId: (state) => (creditoId) => {
                        return state.pagos.filter(p => p.creditoId === creditoId);
                    },
                    transacciones: (state) => {
                        const ingresos = state.ingresos.map(i => ({...i, tipo: 'ingreso'}));
                        const gastos = state.gastos.map(g => ({...g, tipo: 'gasto'}));
                        return [...ingresos, ...gastos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                    },
                },

                actions: {
                    // --- ACCIONES DE CUENTAS ---
                    addCuenta(cuentaData) {
                        if (!cuentaData.nombre || !cuentaData.tipo) {
                            alert('El nombre y el tipo de la cuenta son obligatorios.');
                            return;
                        }
                        this.cuentas.push({
                            ...cuentaData, id: Date.now(), saldo: Number(cuentaData.saldo) || 0
                        });
                    },
                    updateCuenta(cuentaActualizada) {
                        const index = this.cuentas.findIndex(c => c.id === cuentaActualizada.id);
                        if (index !== -1) {
                            this.cuentas[index] = {
                                ...this.cuentas[index], ...cuentaActualizada, saldo: Number(cuentaActualizada.saldo) || 0
                            };
                        }
                    },
                    deleteCuenta(cuentaId) {
                        const isUsed = this.ingresos.some(t => t.cuentaId === cuentaId) || this.gastos.some(t => t.cuentaId === cuentaId) || this.inversiones.some(i => i.cuentaId === cuentaId);

                        if (isUsed) {
                            alert('No se puede eliminar la cuenta porque tiene transacciones o inversiones asociadas.');
                            return;
                        }
                        const index = this.cuentas.findIndex(c => c.id === cuentaId);
                        if (index !== -1) {
                            this.cuentas.splice(index, 1);
                        }
                    },

                    // --- ACCIONES DE TRANSACCIONES ---
                    addTransaccion(transaccionData) {
                        const cuenta = this.cuentas.find(c => c.id === transaccionData.cuentaId);
                        if (!cuenta) return;

                        const nuevaTransaccion = {...transaccionData, id: Date.now()};

                        if (transaccionData.tipo === 'ingreso') {
                            cuenta.saldo += nuevaTransaccion.monto;
                            this.ingresos.push(nuevaTransaccion);
                        } else {
                            cuenta.saldo -= nuevaTransaccion.monto;
                            this.gastos.push(nuevaTransaccion);
                        }
                    },

                    updateTransaccion(transaccionActualizada) {
                        const arrayOriginal = transaccionActualizada.tipo === 'ingreso' ? this.ingresos : this.gastos;
                        const index = arrayOriginal.findIndex(t => t.id === transaccionActualizada.id);
                        if (index === -1) return;

                        const transaccionOriginal = arrayOriginal[index];
                        const cuentaOriginal = this.cuentas.find(c => c.id === transaccionOriginal.cuentaId);
                        if (cuentaOriginal) {
                            if (transaccionOriginal.tipo === 'ingreso') {
                                cuentaOriginal.saldo -= transaccionOriginal.monto;
                            } else {
                                cuentaOriginal.saldo += transaccionOriginal.monto;
                            }
                        }

                        const cuentaNueva = this.cuentas.find(c => c.id === transaccionActualizada.cuentaId);
                        if (cuentaNueva) {
                            if (transaccionActualizada.tipo === 'ingreso') {
                                cuentaNueva.saldo += transaccionActualizada.monto;
                            } else {
                                cuentaNueva.saldo -= transaccionActualizada.monto;
                            }
                        }
                        arrayOriginal[index] = transaccionActualizada;
                    },

                    deleteTransaccion(transaccion) {
                        const arrayOriginal = transaccion.tipo === 'ingreso' ? this.ingresos : this.gastos;
                        const index = arrayOriginal.findIndex(t => t.id === transaccion.id);
                        if (index === -1) return;

                        const cuenta = this.cuentas.find(c => c.id === transaccion.cuentaId);
                        if (cuenta) {
                            if (transaccion.tipo === 'ingreso') {
                                cuenta.saldo -= transaccion.monto;
                            } else {
                                cuenta.saldo += transaccion.monto;
                            }
                        }
                        arrayOriginal.splice(index, 1);
                    },

                    // --- ACCIONES DE INVERSIONES ---
                    addInversion(inversionData) {
                        if (!inversionData.cuentaId || !inversionData.montoInvertido || inversionData.montoInvertido <= 0) {
                            alert('Datos de inversión incompletos o inválidos.');
                            return;
                        }
                        const cuenta = this.cuentas.find(c => c.id === inversionData.cuentaId);
                        if (!cuenta || cuenta.saldo < inversionData.montoInvertido) {
                            alert('Cuenta no encontrada o saldo insuficiente.');
                            return;
                        }
                        cuenta.saldo -= inversionData.montoInvertido;
                        this.inversiones.push({...inversionData, id: Date.now()});
                    },

                    updateInversion(inversionActualizada) {
                        if (!inversionActualizada || !inversionActualizada.montoInvertido || inversionActualizada.montoInvertido <= 0) {
                            alert('Datos de inversión para actualizar son inválidos.');
                            return;
                        }
                        const index = this.inversiones.findIndex(inv => inv.id === inversionActualizada.id);
                        if (index === -1) return;

                        const inversionOriginal = this.inversiones[index];
                        const cuentaOriginal = this.cuentas.find(c => c.id === inversionOriginal.cuentaId);
                        const cuentaNueva = this.cuentas.find(c => c.id === inversionActualizada.cuentaId);

                        if (cuentaOriginal) {
                            cuentaOriginal.saldo += inversionOriginal.montoInvertido;
                        }
                        if (cuentaNueva && cuentaNueva.saldo >= inversionActualizada.montoInvertido) {
                            cuentaNueva.saldo -= inversionActualizada.montoInvertido;
                            this.inversiones[index] = {...inversionActualizada};
                        } else {
                            if (cuentaOriginal) cuentaOriginal.saldo -= inversionOriginal.montoInvertido;
                            alert('Saldo insuficiente en la nueva cuenta para la actualización.');
                        }
                    },

                    deleteInversion(inversionId) {
                        const index = this.inversiones.findIndex(inv => inv.id === inversionId);
                        if (index === -1) return;
                        const inversion = this.inversiones[index];
                        const cuenta = this.cuentas.find(c => c.id === inversion.cuentaId);
                        if (cuenta) {
                            cuenta.saldo += inversion.montoInvertido;
                        }
                        if (inversion.tipo === 'credito') {
                            this.pagos = this.pagos.filter(p => p.creditoId !== inversionId);
                        }
                        this.inversiones.splice(index, 1);
                    },

                    // --- ACCIONES DE PAGOS ---
                    addPago(pagoData) {
                        const credito = this.inversiones.find(i => i.id === pagoData.creditoId);
                        if (!credito) return;
                        const cuenta = this.cuentas.find(c => c.id === credito.cuentaId);
                        if (cuenta) {
                            cuenta.saldo += pagoData.monto;
                        }
                        this.pagos.push({id: Date.now(), ...pagoData});
                        const totalPagado = this.pagosPorCreditoId(pagoData.creditoId).reduce((sum, p) => sum + p.monto, 0);
                        if (totalPagado >= credito.montoTotal) {
                            credito.estado = 'pagada';
                        }
                    },

                    deletePago(pagoId) {
                        const index = this.pagos.findIndex(p => p.id === pagoId);
                        if (index === -1) return;
                        const pago = this.pagos[index];
                        const credito = this.inversiones.find(i => i.id === pago.creditoId);
                        if (!credito) return;
                        const cuenta = this.cuentas.find(c => c.id === credito.cuentaId);
                        if (cuenta) {
                            cuenta.saldo -= pago.monto;
                        }
                        if (credito.estado === 'pagada') {
                            credito.estado = 'activa';
                        }
                        this.pagos.splice(index, 1);
                    },
                },
            });