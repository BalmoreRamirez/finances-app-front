import {defineStore} from 'pinia';
import accountsService from '../services/accountsService';

export const useCuentasStore = defineStore('cuentas', {
    state: () => ({
        cuentas: [],
        tiposCuenta: [],
    }),
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
                    nombre: type.name,
                    value: type.id
                }));
            } catch (error) {
                console.error('Error al obtener los tipos de cuenta:', error);
            }
        },
        async addCuenta(cuentaData) {
            try {
                const payload = {
                    account_name: cuentaData.accountName,
                    balance: cuentaData.balance,
                    account_type_id: cuentaData.accountTypeId,
                };
                await accountsService.createAccount(payload);
                await this.fetchAccounts();
                return true;
            } catch (error) {
                console.error('Error al crear la cuenta:', error);
                return false;
            }
        },
        async updateCuenta(cuentaActualizada) {
            try {
                // Mapear los nombres de los campos al formato que espera el backend
                const payload = {
                    account_name: cuentaActualizada.accountName,
                    balance: cuentaActualizada.balance,
                    account_type_id: cuentaActualizada.accountTypeId,
                };
                await accountsService.updateAccount(cuentaActualizada.accountId, payload);
                await this.fetchAccounts();
                return true;
            } catch (error) {
                console.error('Error al actualizar la cuenta:', error);
                return false;
            }
        },
        async deleteCuenta(cuentaId) {
            try {
                await accountsService.deleteAccount(cuentaId);
                await this.fetchAccounts();
                return true;
            } catch (error) {
                console.error('Error al eliminar la cuenta:', error);
                return false;
            }
        },
    },
});
