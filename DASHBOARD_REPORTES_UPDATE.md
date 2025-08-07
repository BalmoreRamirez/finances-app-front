# Actualización de Dashboard y Reportes

## Cambios Realizados

### 1. DashboardView.vue - Actualizado para usar TransactionStore

**Antes:**
- Usaba `useFinanceStore` con datos estáticos
- Accedía a campos como `fecha`, `monto`, `categoria`
- No cargaba datos del backend

**Ahora:**
- Usa `useTransaccionesStore` con datos del backend
- Accede a campos del backend: `date`/`fecha`, `amount`/`monto`, `category_id`/`categoria`
- Carga datos automáticamente al montar el componente
- Mapea nombres de categorías usando el store de categorías

**Funcionalidades actualizadas:**
- ✅ Cálculo de ingresos y gastos del mes actual
- ✅ Balance general calculado desde transacciones reales
- ✅ Gráficos de categorías con nombres reales del backend
- ✅ Gráfico de flujo de efectivo mensual
- ✅ Compatibilidad con ambos formatos de datos (backend/frontend)

### 2. ReportesView.vue - Actualizado para usar TransactionStore

**Antes:**
- Usaba `useFinanceStore` con lógica incorrecta de balance
- Calculaba balance acumulativo usando `balanceByMonth`

**Ahora:**
- Usa `useTransaccionesStore` con datos reales del backend
- Calcula correctamente ingresos vs gastos por mes
- Carga datos automáticamente al montar el componente
- Mejora la lógica de cálculo de balance histórico

**Funcionalidades actualizadas:**
- ✅ Gráfico de evolución del capital
- ✅ Gráfico de flujo de efectivo mensual
- ✅ Tabla resumen anual con balance mensual correcto
- ✅ Cálculo de balance histórico de años anteriores

### 3. Mejoras en Compatibilidad de Datos

**Acceso dual a campos:**
```javascript
// Soporta tanto formato backend como frontend
const fecha = new Date(item.date || item.fecha);
const monto = Math.abs(item.amount || item.monto || 0);
const categoria = item.category_id || item.categoria;
```

**Mapeo de categorías:**
```javascript
const getCategoryName = (categoryId) => {
  const categoria = categories.value.find(c => c.id === categoryId);
  return categoria?.name || 'Sin categoría';
};
```

### 4. Carga de Datos Automática

**Dashboard:**
```javascript
onMounted(async () => {
  await Promise.all([
    fetchTransactions(),
    fetchAccounts(), 
    fetchCategories()
  ]);
});
```

**Reportes:**
```javascript
onMounted(async () => {
  await fetchTransactions();
});
```

### 5. Cálculos Mejorados

**Balance General (Dashboard):**
```javascript
const balanceGeneral = computed(() => {
  const totalIngresos = (ingresos?.value || []).reduce((sum, i) => sum + Math.abs(i.amount || i.monto || 0), 0);
  const totalGastos = (gastos?.value || []).reduce((sum, g) => sum + Math.abs(g.amount || g.monto || 0), 0);
  return totalIngresos - totalGastos;
});
```

**Balance Histórico (Reportes):**
```javascript
// Calcula balance de años anteriores correctamente
let cumulativeBalance = [...ingresosArr, ...gastosArr]
  .filter(t => {
    const fecha = new Date(t.date || t.fecha);
    return fecha.getFullYear() < currentYear;
  })
  .reduce((acc, t) => {
    const amount = Math.abs(t.amount || t.monto || 0);
    return acc + (t.amount > 0 ? amount : -amount);
  }, 0);
```

## Beneficios de la Actualización

1. **Datos Reales**: Los dashboards ahora muestran datos reales del backend
2. **Sincronización**: Los cambios en transacciones se reflejan inmediatamente
3. **Categorías Dinámicas**: Los nombres de categorías se obtienen del backend
4. **Compatibilidad**: Funciona con datos tanto del backend como del frontend
5. **Performance**: Carga eficiente de datos al montar componentes
6. **Consistencia**: Misma lógica de cálculo en toda la aplicación

## Próximos Pasos

1. ✅ Dashboard actualizado con datos reales
2. ✅ Reportes actualizados con cálculos correctos
3. 🔄 Probar integración completa con backend
4. 🔄 Optimizar carga de datos (caché, lazy loading)
5. 🔄 Agregar filtros de fecha en reportes
6. 🔄 Implementar exportación de reportes
