import { defineStore } from "pinia";
import { useCuentasStore as useAccountsStore } from "./accountStore.js";
import { useInversionesStore as useInvestmentsStore } from "./investmentStore.js";
import { useTransaccionesStore as useTransactionsStore } from "./transactionStore.js";

export const useFinanceStore = defineStore("finance", {
  getters: {
    // accounts
    accounts: () => useAccountsStore().cuentasOrdenadas || useAccountsStore().cuentas,
    accountForSelect: () => useAccountsStore().accountsForSelect,
    accountTypes: () => useAccountsStore().tiposCuenta,
    // investments
    investments: () => useInvestmentsStore().inversionesOrdenadas || useInvestmentsStore().investments,
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
        (sum, investment) => sum + (Number(investment.principal) || 0),
        0
      );
      return totalAccounts + totalInvestments;
    },
    totalInvested: () =>
      (useInvestmentsStore().investments || []).reduce(
        (sum, investment) => sum + (Number(investment.principal) || 0),
        0
      ),
    totalEarnings: () =>
      (useInvestmentsStore().investments || []).reduce(
        (sum, investment) => sum + (Number(investment.expected_return) || 0),
        0
      ),
    totalActiveInvested: () => {
      const investments = useInvestmentsStore().investments || [];
      const activeInvestments = investments.filter(
        (inv) => inv.status === 'activa' || inv.estado === 'activa'
      );
      return activeInvestments.length;
    },
  },
  actions: {
    fetchAccountsForSelect() {
      return useAccountsStore().fetchAccountsForSelect();
    },
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
