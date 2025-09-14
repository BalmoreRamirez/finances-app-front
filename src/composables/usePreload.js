// composables/usePreload.js
import { ref, onMounted } from 'vue';
import { useFinanceStore } from '../stores/financeStore';
import { useCuentasStore } from '../stores/accountStore';

const isPreloaded = ref(false);
const preloadProgress = ref(0);

export function usePreload() {
  const financeStore = useFinanceStore();
  const cuentasStore = useCuentasStore();

  const preloadCriticalData = async () => {
    if (isPreloaded.value) return;

    const tasks = [
      () => cuentasStore.fetchAccountsForSelect(),
      () => financeStore.fetchInvestmentTypes(),
      () => financeStore.fetchTransactions()
    ];

    let completed = 0;
    
    for (const task of tasks) {
      try {
        await task();
      } catch (error) {
        console.warn('Error preloading data:', error);
      }
      completed++;
      preloadProgress.value = (completed / tasks.length) * 100;
    }

    isPreloaded.value = true;
  };

  return {
    preloadCriticalData,
    isPreloaded,
    preloadProgress
  };
}
