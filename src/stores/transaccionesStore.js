import { defineStore } from 'pinia';

export const useTransaccionesStore = defineStore('transacciones', {
  state: () => ({
    ingresos: [],
    gastos: [],
  }),
  getters: {
    transacciones(state) {
      const ingresos = state.ingresos.map(i => ({...i, tipo: 'ingreso'}));
      const gastos = state.gastos.map(g => ({...g, tipo: 'gasto'}));
      return [...ingresos, ...gastos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    },
  },
  actions: {
    addTransaccion(transaccionData) {
      const nuevaTransaccion = {...transaccionData, id: Date.now()};
      if (transaccionData.tipo === 'ingreso') {
        this.ingresos.push(nuevaTransaccion);
      } else {
        this.gastos.push(nuevaTransaccion);
      }
    },
    updateTransaccion(transaccionActualizada) {
      const arrayOriginal = transaccionActualizada.tipo === 'ingreso' ? this.ingresos : this.gastos;
      const index = arrayOriginal.findIndex(t => t.id === transaccionActualizada.id);
      if (index !== -1) {
        arrayOriginal[index] = transaccionActualizada;
      }
    },
    deleteTransaccion(transaccion) {
      const arrayOriginal = transaccion.tipo === 'ingreso' ? this.ingresos : this.gastos;
      const index = arrayOriginal.findIndex(t => t.id === transaccion.id);
      if (index !== -1) {
        arrayOriginal.splice(index, 1);
      }
    },
  },
});

