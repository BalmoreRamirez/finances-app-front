// src/stores/financeStore.js
            import {defineStore} from 'pinia';

            export const useFinanceStore = defineStore('finance', {
                persist: true,

                state: () => ({
                    cuentas: [{id: 1, nombre: 'Banco Principal', saldo: 50000}, {id: 2, nombre: 'Efectivo', saldo: 3000},],
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
                        montoTotal: 5500,
                        ganancia: 500,
                        fechaInversion: '2023-10-01',
                        fechaVencimiento: '2024-10-01',
                        estado: 'activa'
                    }],
                    pagos: [{id: 1, creditoId: 1, fecha: '2024-01-15', monto: 550, descripcion: 'Primer pago'}],
                    // ... (resto de tu estado)
                }),

                getters: {
                    // ... (tus getters existentes)
                    totalInvertido: (state) => state.inversiones.reduce((sum, inv) => sum + inv.montoInvertido, 0),
                    totalGanancias: (state) => state.inversiones.reduce((sum, inv) => sum + (inv.ganancia || 0), 0),
                    totalInvertidoActivo: (state) => {
                        return state.inversiones
                            .filter(inv => inv.estado === 'activa')
                            .reduce((sum, inv) => sum + inv.montoInvertido, 0);
                    },
                    pagosPorCreditoId: (state) => (creditoId) => {
                        return state.pagos.filter(p => p.creditoId === creditoId);
                    }
                },

                actions: {
                    // --- ACCIONES DE INVERSIONES (CORREGIDAS) ---

                    addInversion(inversionData) {
                        // VALIDACIÓN: Asegurarse de que los datos esenciales existen y son válidos.
                        if (!inversionData.cuentaId || !inversionData.montoInvertido || inversionData.montoInvertido <= 0) {
                            alert('Datos de inversión incompletos o inválidos. Asegúrate de seleccionar una cuenta y un monto positivo.');
                            return;
                        }

                        const cuenta = this.cuentas.find(c => c.id === inversionData.cuentaId);
                        if (!cuenta) {
                            alert("Error: La cuenta de origen no fue encontrada.");
                            return;
                        }

                        if (cuenta.saldo < inversionData.montoInvertido) {
                            alert('Saldo insuficiente en la cuenta seleccionada.');
                            return;
                        }

                        cuenta.saldo -= inversionData.montoInvertido;

                        const nuevaInversion = {
                            ...inversionData,
                            id: Date.now(), // Asignar un ID único
                        };

                        this.inversiones.push(nuevaInversion);
                    },

                    updateInversion(inversionActualizada) {
                        const index = this.inversiones.findIndex(inv => inv.id === inversionActualizada.id);
                        if (index === -1) return;

                        const inversionOriginal = this.inversiones[index];
                        const montoOriginal = inversionOriginal.montoInvertido;
                        const montoNuevo = inversionActualizada.montoInvertido;
                        const cuentaOriginal = this.cuentas.find(c => c.id === inversionOriginal.cuentaId);
                        const cuentaNueva = this.cuentas.find(c => c.id === inversionActualizada.cuentaId);

                        if (inversionOriginal.cuentaId === inversionActualizada.cuentaId) {
                            if (cuentaOriginal) {
                                cuentaOriginal.saldo += montoOriginal - montoNuevo;
                            }
                        } else {
                            if (cuentaOriginal) {
                                cuentaOriginal.saldo += montoOriginal;
                            }
                            if (cuentaNueva) {
                                cuentaNueva.saldo -= montoNuevo;
                            }
                        }
                        this.inversiones[index] = {...inversionActualizada};
                    },

                    deleteInversion(inversionId) {
                        const index = this.inversiones.findIndex(inv => inv.id === inversionId);
                        if (index === -1) return;

                        const inversion = this.inversiones[index];
                        const cuenta = this.cuentas.find(c => c.id === inversion.cuentaId);
                        if (cuenta) {
                            cuenta.saldo += inversion.montoInvertido;
                        }

                        // CORRECCIÓN: Si es un crédito, eliminar también sus pagos asociados.
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
                        const pagosRealizados = this.pagosPorCreditoId(pagoData.creditoId);
                        const totalPagado = pagosRealizados.reduce((sum, p) => sum + p.monto, 0);
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