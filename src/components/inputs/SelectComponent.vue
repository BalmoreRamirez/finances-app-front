<template>
  <div class="flex flex-col w-full">
    <span class="p-float-label ">
      <Dropdown filter
                v-model="item"
                :disabled="disabled"
                :options="values"
                class="  placeholder-primary-700  !w-full hover:border-primary-700  focus:border-primary-700  !bg-transparent !py-[1px] !rounded-[12px]"
                :class=" inputClass"
                optionDisabled="disabled"
                @update:modelValue="$emit('update:modelValue', item)" :optionLabel="optionLabel"
                :optionValue="optionValue"
                :placeholder="placeholder"
                empty-filter-message="No se encontró el dato"
                @change="emitirCambio"
      />
      <label class="pl-2 text-[11px] sm:text-[13px] z-20"
             :class="props.errors?.length >  0 ? 'text-danger-700' : 'text-primary-700'" :for="item">
      {{ placeholder }}
    </label>
</span>
    <p v-if="props.errors?.length > 0" class="text-xs text-danger-500 px-2 my-1">
      <span v-for="(error, index) in errors" :key="index" class="block">{{ error.$message }}</span>
    </p>
  </div>
</template>

<script setup>
import 'primeicons/primeicons.css'
import {ref, onMounted, computed, watchEffect} from 'vue'
import Dropdown from 'primevue/dropdown';

import MultiSelect from 'primevue/multiselect';

const item = ref();
const values = ref([]);


const props = defineProps({
  modelValue: {
    type: Object,
  },
  items: {
    type: Array,
    default: []
  },
  selectLimit: {
    type: Number,
    default: 1,
  },
  optionLabel: {
    type: String,
    default: '',
  },
  optionValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  icon_left: {
    type: Boolean,
    default: false,
  },
  icon_right: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  errors: {
    type: Array,
    default: [],
  },
})

const emit = defineEmits(['update:modelValue'])

onMounted(() => {
  item.value = props.modelValue
  values.value = props.items
})
const emitirCambio = (value) => {
  emit("change", value)
    //emit('update:modelValue', item)
}

watchEffect(() => {
  item.value = props.modelValue
  values.value = props.items
});
const inputClass = computed(() => {
  const classes = ['input-group--field'];
  if (props.errors?.length > 0) {
    classes.push('error-borde')
  } else {
    classes.push('border-primary-700')
  }
  return classes.join(' ')
})


</script>
<style>
.p-float-label input:focus ~ label, .p-float-label input.p-filled ~ label, .p-float-label input:-webkit-autofill ~ label, .p-float-label textarea:focus ~ label, .p-float-label textarea.p-filled ~ label, .p-float-label .p-inputwrapper-focus ~ label, .p-float-label .p-inputwrapper-filled ~ label {
  top: 0.1rem;
  font-size: 12px;
  left: 1.1em;
  background: white;
  padding: 1px;
}

.p-dropdown {
  border-radius: 10px;
  width: 100% !important;
}

.error-borde {
  border: 1px solid #DD1C1C !important;
}

</style>

