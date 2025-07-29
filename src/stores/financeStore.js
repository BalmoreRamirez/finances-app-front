import { defineStore } from "pinia";
import { useCuentasStore as useAccountsStore } from "./accountStore.js";
import { useInversionesStore as useInvestmentsStore } from "./investmentStore.js";
import { useTransaccionesStore as useTransactionsStore } from "./transactionStore.js";

export const useFinanceStore = defineStore("finance", {
  getters: {
    // accounts
    accounts: () => useAccountsStore().cuentas,
    accountTypes: () => useAccountsStore().tiposCuenta,
    // investments
    investments: () => useInvestmentsStore().investments,
    investmentTypes: () => useInvestmentsStore().typesInvestment,
    // -----
    payments: () => useInvestmentsStore().payments,
    incomes: () => useTransactionsStore().ingresos,
    expenses: () => useTransactionsStore().gastos,
    transactions: () => useTransactionsStore().transacciones,
    generalBalance: (state) => {
      const accounts = useAccountsStore().cuentas || [];
      const investments = useInvestmentsStore().investments || [];
      const totalAccounts = accounts.reduce(
        (sum, account) => sum + (Number(account.saldo) || 0),
        0
      );
      const totalInvestments = investments.reduce(
        (sum, investment) => sum + (Number(investment.monto) || 0),
        0
      );
      return totalAccounts + totalInvestments;
    },
    totalInvested: () =>
      (useInvestmentsStore().investments || []).reduce(
        (sum, investment) => sum + (investment.monto || 0),
        0
      ),
    totalEarnings: () =>
      (useInvestmentsStore().investments || []).reduce(
        (sum, investment) => sum + (investment.ganancia || 0),
        0
      ),
    totalActiveInvested: () => {
      const investments = useInvestmentsStore().investments || [];
      return investments.filter((investment) => investment.estado === "activa")
        .reduce((sum, investment) => sum + (investment.monto || 0), 0);
    },
  },
  actions: {
    // accounts
    fetchAccounts() {
      return useAccountsStore().fetchAccounts();
    },
    fetchAccountTypes() {
      return useAccountsStore().fetchAccountTypes();
    },
    addCuenta(data) {
      return useAccountsStore().addCuenta(data);
    },
    updateCuenta(data) {
      return useAccountsStore().updateCuenta(data);
    },
    deleteCuenta(id) {
      return useAccountsStore().deleteCuenta(id);
    },
    // investments
    fetchInvestments() {
      return useInvestmentsStore().fetchInvestments();
    },
    fetchInvestmentTypes() {
      return useInvestmentsStore().fetchInvestmentTypes();
    },
    addInvestment(data) {
      return useInvestmentsStore().addInvestment(data);
    },
    updateInvestment(id, data) {
      return useInvestmentsStore().updateInvestment(id, data);
    },
    deleteInvestment(id) {
      return useInvestmentsStore().deleteInvestment(id);
    },
    // Transacciones
    addTransaccion(data) {
      return useTransactionsStore().addTransaccion(data);
    },
    updateTransaccion(data) {
      return useTransactionsStore().updateTransaccion(data);
    },
    deleteTransaccion(data) {
      return useTransactionsStore().deleteTransaccion(data);
    },
  },
});
