<template>
  <div class="flex flex-col">
    <span class="p-float-label ">
      <InputNumber :id="item"
                   v-model="item"
                   :disabled="disabled"
                   class="hover:border-primary-700  focus:border-primary-700 !bg-transparent"
                   :class=" inputClass"
                   id="input-number"
                   :minFractionDigits="0"
                   :maxFractionDigits="decimals"
                   locale="en-US"
                   :min="minValue"
                   :max="maxValue"
                   
                   @input="$emit('update:modelValue', $event.value === null ? 0 : props.maxValue && $event.value > props.maxValue ? props.maxValue : $event.value)"/>
    <label class="pl-2 pr-3 align-middle text-[11px] sm:text-[13px] truncate max-w-full"
           :class="props.errors?.length >  0 ? 'text-danger-700' : 'text-primary-700'"
           :for="item">{{ placeholder }}</label>
</span>
    <p class="text-xs text-danger-500 px-2 my-2">
      <span v-for="(error, index) in errors" :key="index" class="block py-1">{{ error.$message }}</span>
    </p>
  </div>
</template>

<script setup>
import 'primeicons/primeicons.css'
import {ref, onMounted, computed, watchEffect} from 'vue'
import InputNumber from 'primevue/inputnumber';

const item = ref(null);


const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
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
  decimals: {
    type: Number,
    default: 0,
  },
  minValue: {
    type: Number,
    default: null,
  },
  maxValue: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

onMounted(() => {
  item.value = props.modelValue
})

watchEffect(() => {
  item.value = props.modelValue;
});

const inputClass = computed(() => {
  const classes = ['input-group--field'];
  if (props.errors?.length > 0) {
    classes.push('error-borde')
  } else {
    classes.push('active-border')
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

.p-inputnumber {
  border-radius: 10px;
}

.error-borde {
  border: 1px solid #DD1C1C;
  border-radius: 10px;

}

.active-border > input {
  border-color: #1C1E4D;;
}
</style>
