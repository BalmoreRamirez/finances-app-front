import {defineStore} from 'pinia';
import accountsService from "../services/accountsService.js";
import investmentsService from "../services/investmentsService.js";

export const useFinanceStore = defineStore('finance', {
    persist: true,

    state: () => ({
        inversionActual: null,
        cuentas: [],
        pagos: [],
        tiposCuenta: [],
        inversiones: [],
        tiposInversion: [],
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
        categoriasTransaccion: {
            ingreso: [
                {label: 'Salario', value: 'Salario'},
                {label: 'Ventas', value: 'Ventas'},
                {label: 'Freelance', value: 'Freelance'},
                {label: 'Inversiones', value: 'Inversiones'},
                {label: 'Otros', value: 'Otros'}
            ],
            gasto: [
                {label: 'Alimentación', value: 'Alimentación'},
                {label: 'Transporte', value: 'Transporte'},
                {label: 'Vivienda', value: 'Vivienda'},
                {label: 'Entretenimiento', value: 'Entretenimiento'},
                {label: 'Salud', value: 'Salud'},
                {label: 'Educación', value: 'Educación'},
                {label: 'Otros', value: 'Otros'}
            ]
        },
    }),

    getters: {
        balanceGeneral: (state) => {
            const totalCuentas = state.cuentas.reduce((sum, cuenta) => sum + (Number(cuenta.saldo) || 0), 0);
            const totalInversiones = state.inversiones.reduce((sum, inv) => sum + (Number(inv.monto) || 0), 0);
            return totalCuentas + totalInversiones;
        },
        totalInvertido: (state) => state.inversiones.reduce((sum, inv) => sum + (inv.monto || 0), 0),
        totalGanancias: (state) => state.inversiones.reduce((sum, inv) => sum + (inv.ganancia || 0), 0),
        totalInvertidoActivo: (state) => {
            return state.inversiones
                .filter(inv => inv.estado === 'activa')
                .reduce((sum, inv) => sum + (inv.monto || 0), 0);
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
        async fetchAccounts() {
            try {
                const response = await accountsService.getAccounts();
                this.cuentas = response.data.map(cuenta => ({
                    id: cuenta.id,
                    nombre: cuenta.account_name,
                    saldo: parseFloat(cuenta.balance) || 0,
                    tipo: cuenta.account_type?.name || 'Desconocido',
                    accountId: cuenta.id
                }));
            } catch (error) {
                console.error('Error al obtener las cuentas:', error);
            }
        },

        async fetchAccountTypes() {
            try {
                const response = await accountsService.getAccountTypes();
                this.tiposCuenta = response.data.map(type => ({
                    label: type.name,
                    value: type.id
                }));
            } catch (error) {
                console.error('Error al obtener los tipos de cuenta:', error);
            }
        },

        async addCuenta(cuentaData) {
            try {
                await accountsService.createAccount(cuentaData);
                await this.fetchAccounts();
                return true;
            } catch (error) {
                console.error('Error al crear la cuenta:', error);
                return false;
            }
        },

        async updateCuenta(cuentaActualizada) {
            try {
                await accountsService.updateAccount(cuentaActualizada.accountId, cuentaActualizada);
                await this.fetchAccounts();
                return true;
            } catch (error) {
                console.error('Error al actualizar la cuenta:', error);
                return false;
            }
        },

        async deleteCuenta(cuentaId) {
            const isUsed = this.ingresos.some(t => t.cuentaId === cuentaId) ||
                this.gastos.some(t => t.cuentaId === cuentaId) ||
                this.inversiones.some(i => i.cuentaId === cuentaId);
            if (isUsed) {
                alert('No se puede eliminar la cuenta porque tiene transacciones o inversiones asociadas.');
                return;
            }
            try {
                await accountsService.deleteAccount(cuentaId);
                this.cuentas = this.cuentas.filter(c => c.id !== cuentaId);
            } catch (error) {
                console.error('Error al eliminar la cuenta:', error);
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
        async fetchInvestmentTypes() {
            try {
                const response = await investmentsService.getInvestmentTypes();
                this.tiposInversion = response.data.map(type => ({
                    id: type.id,
                    name: type.name,
                    description: type.description,
                    label: type.name.charAt(0).toUpperCase() + type.name.slice(1),
                    value: type.name.toLowerCase()
                }));
            } catch (error) {
                console.error('Error al obtener los tipos de inversión:', error);
                this.tiposInversion = [];
            }
        },

        async fetchInvestments() {
            try {
                const response = await investmentsService.getInvestments();
                this.inversiones = response.data.map(inv => ({
                    id: inv.id,
                    cuentaId: inv.account_id,
                    nombreCuenta: inv.account?.account_name || 'N/A',
                    tipo: inv.investment_type?.name || 'Desconocido',
                    descripcion: inv.investment_name,
                    descripcionDetallada: inv.description,
                    beneficiario: inv.beneficiary,
                    monto: parseFloat(inv.invested_amount) || 0,
                    interes: parseFloat(inv.interest) || 0,
                    ganancia: parseFloat(inv.profit) || 0,
                    montoTotal: parseFloat(inv.total_amount) || 0,
                    fechaInversion: inv.investment_date,
                    fechaVencimiento: inv.due_date,
                    estado: inv.status || 'activo'
                }));
            } catch (error) {
                console.error('Error al obtener las inversiones:', error);
            }
        },

        async fetchInvestmentById(id) {
            this.inversionActual = null;
            try {
                const response = await investmentsService.getInvestmentById(id);
                const inv = response.data;

                if (!inv || !inv.id) {
                    console.error('Respuesta inválida del servidor:', inv);
                    return false;
                }

                const montoInvertido = parseFloat(inv.invested_amount);
                const interes = parseFloat(inv.interest);

                let montoTotal = parseFloat(inv.total_amount);
                if (isNaN(montoTotal)) {
                    montoTotal = montoInvertido + (montoInvertido * (interes / 100));
                }

                let ganancia = parseFloat(inv.profit);
                if (isNaN(ganancia)) {
                    ganancia = montoTotal - montoInvertido;
                }

                this.inversionActual = {
                    id: inv.id,
                    investment_name: inv.investment_name,
                    beneficiary: inv.beneficiary,
                    invested_amount: inv.invested_amount,
                    interest: inv.interest,
                    total_amount: inv.total_amount,
                    profit: inv.profit,
                    investment_date: inv.investment_date,
                    due_date: inv.due_date,
                    status: inv.status,
                    description: inv.description,
                    account: inv.account,
                    investment_type: inv.investment_type,
                    cuentaId: inv.account_id,
                    tipo: inv.investment_type?.name || 'Desconocido',
                    descripcion: inv.investment_name,
                    descripcionDetallada: inv.description,
                    beneficiario: inv.beneficiary,
                    monto: montoInvertido,
                    interes: interes,
                    ganancia: ganancia,
                    montoTotal: montoTotal,
                    fechaInversion: inv.investment_date,
                    fechaVencimiento: inv.due_date,
                    estado: inv.status || 'activo',
                    nombreCuenta: inv.account?.account_name || 'N/A'
                };
                return true;
            } catch (error) {
                console.error(`Error al obtener o procesar la inversión ${id}:`, error);
                this.inversionActual = null;
                return false;
            }
        },

        async addInversion(inversionData) {
            try {
                await investmentsService.createInvestment(inversionData);
                await this.fetchInvestments();
                const cuenta = this.cuentas.find(c => c.id === inversionData.cuentaId);
                if (cuenta) {
                    cuenta.saldo -= inversionData.monto;
                }
                return true;
            } catch (error) {
                console.error('Error al crear la inversión:', error);
                return false;
            }
        },

        async updateInversion(inversionId, inversionData) {
            const payload = {
                account_id: inversionData.cuentaId,
                investment_name: inversionData.descripcion,
                investment_type_id: inversionData.tipoId,
                description: inversionData.descripcionDetallada,
                beneficiary: inversionData.beneficiario,
                invested_amount: inversionData.tipo === 'credito' ? inversionData.monto : inversionData.montoInvertido,
                interest: isNaN(inversionData.interes) ? null : inversionData.interes,
                total_amount: inversionData.montoTotal,
                profit: inversionData.ganancia,
                investment_date: inversionData.fechaInversion,
                due_date: inversionData.fechaVencimiento,
                status: inversionData.estado
            };

            try {
                await investmentsService.updateInvestment(inversionId, payload);
                await this.fetchInvestments();
                await this.fetchAccounts();
                return true;
            } catch (error) {
                console.error('Error al actualizar la inversión:', error);
                return false;
            }
        },

        async deleteInversion(inversionId) {
            try {
                await investmentsService.deleteInvestment(inversionId);
                const index = this.inversiones.findIndex(inv => inv.id === inversionId);
                if (index !== -1) {
                    const inversion = this.inversiones[index];
                    const cuenta = this.cuentas.find(c => c.id === inversion.cuentaId);
                    if (cuenta) {
                        cuenta.saldo += inversion.monto;
                    }
                    this.inversiones.splice(index, 1);
                }
                return true;
            } catch (error) {
                console.error('Error al eliminar la inversión:', error);
                return false;
            }
        },

        // --- ACCIONES DE PAGOS ---
        async fetchPagosPorInversion(investmentId) {
            try {
                const {data: paymentsFromApi} = await investmentsService.getInvestmentPayments(investmentId);
                const payments = Array.isArray(paymentsFromApi) ? paymentsFromApi : [];
                this.pagos = payments.map(pago => ({
                    id: pago.id,
                    creditoId: pago.investment_id,
                    fecha: pago.payment_date || pago.fecha_pago,
                    monto: parseFloat(pago.amount || pago.monto_pago || 0),
                    descripcion: pago.description || pago.descripcion || ''
                }));
            } catch (error) {
                console.error('Error al obtener los pagos de la inversión:', error);
                this.pagos = [];
            }
        },

        async addPago(paymentData) {
            try {
                const { creditoId, ...pagoInfo } = paymentData;
                const pagoPayload = {
                    monto_pago: pagoInfo.amount,
                    fecha_pago: pagoInfo.payment_date,
                    descripcion: pagoInfo.description
                };
                const response = await investmentsService.createPayment(creditoId, pagoPayload);
                const data = response.data;
                const pagoFormateado = {
                    id: data.id,
                    creditoId: data.investment_id || creditoId,
                    fecha: data.payment_date || pagoPayload.fecha_pago,
                    monto: parseFloat(data.amount || data.monto_pago),
                    descripcion: data.description || data.descripcion
                };
                this.pagos.push(pagoFormateado);
                return true;
            } catch (error) {
                console.error('Error al crear pago:', error);
                return false;
            }
        },

        async deletePago(investmentId, paymentId) {
            try {
                await investmentsService.deletePayment(investmentId, paymentId);
                this.pagos = this.pagos.filter(pago => pago.id !== paymentId);
                return true;
            } catch (error) {
                console.error('Error al eliminar pago:', error);
                return false;
            }
        }
    },
});