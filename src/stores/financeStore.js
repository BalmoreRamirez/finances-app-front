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
    }),

    getters: {
        balanceGeneral: (state) => {
            const totalCuentas = state.cuentas.reduce((sum, cuenta) => sum + (Number(cuenta.saldo) || 0), 0);
            const totalInversiones = state.inversiones.reduce((sum, inv) => sum + (Number(inv.monto) || 0), 0);
            return totalCuentas + totalInversiones;
        },
        totalInvertido: (state) => state.inversiones.reduce((sum, inv) => sum + (inv.monto ||0), 0),
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
                // Mapea la respuesta de la API a la estructura que usa el frontend
                this.cuentas = response.data.map(cuenta => ({
                    id: cuenta.accountId,
                    nombre: cuenta.accountName,
                    saldo: parseFloat(cuenta.balance),
                    tipo: cuenta.AccountType.type_name,
                    // Puedes añadir más campos si los necesitas
                    currencySymbol: cuenta.Currency.currency_symbol
                }));
            } catch (error) {
                console.error('Error al obtener las cuentas:', error);
                // Opcional: manejar el error en la UI
            }
        },
        async fetchAccountTypes() {
            try {
                const response = await accountsService.getAccountTypes();
                // Mapea la respuesta al formato { label, value }
                this.tiposCuenta = response.data.map(type => ({
                    label: type.type_name.charAt(0).toUpperCase() + type.type_name.slice(1),
                    value: type.account_type_id
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
            const isUsed = this.ingresos.some(t => t.cuentaId === cuentaId) || this.gastos.some(t => t.cuentaId === cuentaId) || this.inversiones.some(i => i.cuentaId === cuentaId);
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
                    label: type.type_name,
                    value: type.investment_type_id
                }));
            } catch (error) {
                console.error('Error al obtener los tipos de inversión:', error);
                this.tiposInversion = []; // Resetea en caso de error
            }
        },
        async fetchInvestments() {
            try {
                const response = await investmentsService.getInvestments();
                this.inversiones = response.data.map(inv => ({
                    id: inv.investment_id,
                    cuentaId: inv.account_id,
                    descripcion: inv.investment_name,
                    tipo: inv.InvestmentType.type_name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                    beneficiario: inv.beneficiary,
                    monto: parseFloat(inv.invested_amount),
                    interes: parseFloat(inv.interest),
                    montoTotal: parseFloat(inv.total_amount) || 0,
                    ganancia: parseFloat(inv.profit) || 0,
                    fechaInversion: inv.investment_date,
                    fechaVencimiento: inv.due_date,
                    estado: inv.status,
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


                // Validar que la respuesta contiene los datos mínimos necesarios
                if (!inv || !inv.investment_id) {
                    console.error('Respuesta de API inválida para la inversión:', id);
                    this.inversionActual = null;
                    return false;
                }
                const montoInvertido = parseFloat(inv.invested_amount);
                const interes = parseFloat(inv.interest);

                // Cálculo seguro de montoTotal y ganancia, evitando NaN
                let montoTotal = parseFloat(inv.total_amount);
                if (isNaN(montoTotal)) {
                    montoTotal = montoInvertido + (montoInvertido * (interes / 100));
                }

                let ganancia = parseFloat(inv.profit);
                if (isNaN(ganancia)) {
                    ganancia = montoTotal - montoInvertido;
                }

                this.inversionActual = {
                    id: inv.investment_id,
                    cuentaId: inv.account_id,
                    nombreCuenta: inv.Account?.account_name || 'N/A', // Acceso seguro
                    descripcion: inv.investment_name,
                    tipo: inv.InvestmentType?.type_name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || 'desconocido',
                    beneficiario: inv.beneficiary,
                    montoInvertido: montoInvertido,
                    interes: interes,
                    montoTotal: montoTotal,
                    ganancia: ganancia,
                    fechaInversion: inv.investment_date,
                    fechaVencimiento: inv.due_date,
                    estado: inv.status,
                    descripcionDetallada: inv.description,
                };
                return true;
            } catch (error) {
                console.error(`Error al obtener o procesar la inversión ${id}:`, error);
                this.inversionActual = null; // Asegura que el estado quede limpio en caso de error
                return false;
            }
        },
        async addInversion(inversionData) {
            // ... tu lógica existente, pero ahora usando el servicio
            try {
                await investmentsService.createInvestment(inversionData);
                await this.fetchInvestments(); // Recarga las inversiones
                // Lógica para ajustar saldos de cuentas
                const cuenta = this.cuentas.find(c => c.id === inversionData.cuentaId);
                if (cuenta) {
                    cuenta.saldo -= inversionData.montoInvertido;
                }
                return true;
            } catch (error) {
                console.error('Error al crear la inversión:', error);
                return false;
            }
        },
        async updateInversion(inversionData) {
            // ... tu lógica existente, pero ahora usando el servicio
            try {
                await investmentsService.updateInvestment(inversionData.id, inversionData);
                await this.fetchInvestments(); // Recarga para obtener datos actualizados
                // La lógica de saldos puede ser compleja, idealmente el backend la manejaría
                // o se necesitaría una recarga completa de las cuentas.
                await this.fetchAccounts();
                return true;
            } catch (error) {
                console.error('Error al actualizar la inversión:', error);
                return false;
            }
        },
        async deleteInversion(inversionId) {
            // ... tu lógica existente, pero ahora usando el servicio
            try {
                await investmentsService.deleteInvestment(inversionId);
                // Lógica para restaurar saldo y eliminar localmente
                const index = this.inversiones.findIndex(inv => inv.id === inversionId);
                if (index !== -1) {
                    const inversion = this.inversiones[index];
                    const cuenta = this.cuentas.find(c => c.id === inversion.cuentaId);
                    if (cuenta && inversion.estado !== 'finalizada' && inversion.estado !== 'pagada') {
                        // Solo devuelve el dinero si la inversión no se completó
                        cuenta.saldo += inversion.montoInvertido;
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
                const { data: paymentsFromApi } = await investmentsService.getInvestmentPayments(investmentId);
                // Mapea la respuesta del API al formato que usa el frontend
                this.pagos = paymentsFromApi.map(pago => ({
                    id: pago.payment_id,
                    creditoId: pago.investment_id,
                    fecha: pago.fecha_pago,
                    monto: parseFloat(pago.monto_pago),
                    descripcion: pago.descripcion
                }));
            } catch (error) {
                console.error('Error al obtener los pagos de la inversión:', error);
                this.pagos = []; // Limpia los pagos en caso de error
            }
        },
        async addPago(pagoData) {
            try {
                // Mapea los datos del frontend al formato esperado por el backend
                const paymentPayload = {
                    investment_id: pagoData.creditoId,
                    monto_pago: pagoData.monto,
                    fecha_pago: pagoData.fecha,
                    descripcion: pagoData.descripcion
                };

                const {data: nuevoPagoRegistrado} = await investmentsService.createInvestmentPayment(paymentPayload);

                // El backend debería devolver el objeto del pago creado con su ID.
                // Lo mapeamos de nuevo al formato que usa el frontend si es necesario.
                const pagoFormateado = {
                    id: nuevoPagoRegistrado.id, // Asumiendo que el backend devuelve un 'id'
                    creditoId: nuevoPagoRegistrado.investment_id,
                    fecha: nuevoPagoRegistrado.fecha_pago,
                    monto: parseFloat(nuevoPagoRegistrado.monto_pago),
                    descripcion: nuevoPagoRegistrado.descripcion
                };

                // Agrega el nuevo pago al estado local para actualizar la UI al instante.
                this.pagos.push(pagoFormateado);

            } catch (error) {
                console.error('Error al registrar el pago:', error);
                // Aquí podrías manejar el error, por ejemplo, mostrando una notificación global.
                throw error; // Lanza el error para que el componente pueda manejarlo si es necesario.
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