import { defineStore } from 'pinia';
import { useCuentasStore } from './cuentasStore';
import { useInversionesStore } from './inversionesStore';
import { useTransaccionesStore } from './transaccionesStore';

export const useFinanceStore = defineStore('finance', {
  getters: {
    cuentas: () => useCuentasStore().cuentas,
    tiposCuenta: () => useCuentasStore().tiposCuenta,
    inversiones: () => useInversionesStore().inversiones,
    tiposInversion: () => useInversionesStore().tiposInversion,
    pagos: () => useInversionesStore().pagos,
    ingresos: () => useTransaccionesStore().ingresos,
    gastos: () => useTransaccionesStore().gastos,
    transacciones: () => useTransaccionesStore().transacciones,
    balanceGeneral: (state) => {
      const cuentas = useCuentasStore().cuentas;
      const inversiones = useInversionesStore().inversiones;
      const totalCuentas = cuentas.reduce((sum, cuenta) => sum + (Number(cuenta.saldo) || 0), 0);
      const totalInversiones = inversiones.reduce((sum, inv) => sum + (Number(inv.monto) || 0), 0);
      return totalCuentas + totalInversiones;
    },
    totalInvertido: () => useInversionesStore().inversiones.reduce((sum, inv) => sum + (inv.monto || 0), 0),
    totalGanancias: () => useInversionesStore().inversiones.reduce((sum, inv) => sum + (inv.ganancia || 0), 0),
    totalInvertidoActivo: () => {
      return useInversionesStore().inversiones
        .filter(inv => inv.estado === 'activa')
        .reduce((sum, inv) => sum + (inv.monto || 0), 0);
    },
  },
  actions: {
    // Cuentas
    fetchAccounts() { return useCuentasStore().fetchAccounts(); },
    fetchAccountTypes() { return useCuentasStore().fetchAccountTypes(); },
    addCuenta(data) { return useCuentasStore().addCuenta(data); },
    updateCuenta(data) { return useCuentasStore().updateCuenta(data); },
    deleteCuenta(id) { return useCuentasStore().deleteCuenta(id); },
    // Inversiones
    fetchInversiones() { return useInversionesStore().fetchInversiones(); },
    fetchTiposInversion() { return useInversionesStore().fetchTiposInversion(); },
    addInversion(data) { return useInversionesStore().addInversion(data); },
    updateInversion(id, data) { return useInversionesStore().updateInversion(id, data); },
    deleteInversion(id) { return useInversionesStore().deleteInversion(id); },
    // Transacciones
    addTransaccion(data) { return useTransaccionesStore().addTransaccion(data); },
    updateTransaccion(data) { return useTransaccionesStore().updateTransaccion(data); },
    deleteTransaccion(data) { return useTransaccionesStore().deleteTransaccion(data); },
  },
});