<template>
  <div class="flex flex-col">
    <span class="p-float-label "
          :class="icon_left && icon !=null ? 'p-input-icon-left ' : icon_right && icon !=null ? 'p-input-icon-right': '' ">
        <i :class="'absolute top-4 left-1 px-1 left-3 pi pi-'+icon" v-if="icon"/>
    <InputText :id="item"
               v-model="item"
               :disabled="disabled"
               class="  placeholder-primary-700  w-full hover:border-primary-700  focus:border-primary-700 !bg-transparent "
               :class=" inputClass, icon_left && icon !=null ? 'pl-10' : icon_right && icon !=null ? 'pr-10': '' "
               @input="$emit('update:modelValue', $event.target.value)"/>
    <label class="pl-2 pr-3 align-middle text-[11px] sm:text-[13px] truncate max-w-full"
           :class="props.errors?.length >  0 ? 'text-danger-700' : 'text-primary-700'"
           :for="item">{{ placeholder }}</label>
</span>
    <p class="text-xs text-danger-500 px-2 my-1">
      <span v-for="(error, index) in errors" :key="index" class="block">{{ error.$message }}</span>
    </p>
  </div>
</template>

<script setup>
import 'primeicons/primeicons.css'
import {ref, onMounted, computed, watch, watchEffect} from 'vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password';

const item = ref(null);


const props = defineProps({
  modelValue: {
    type: String,
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
    classes.push('border-primary-700')
  }
  return classes.join(' ')
})


</script>
<style scoped>
.p-float-label input:focus ~ label, .p-float-label input.p-filled ~ label, .p-float-label input:-webkit-autofill ~ label, .p-float-label textarea:focus ~ label, .p-float-label textarea.p-filled ~ label, .p-float-label .p-inputwrapper-focus ~ label, .p-float-label .p-inputwrapper-filled ~ label {
  top: 0.1rem;
  font-size: 12px;
  left: 1.1em;
  background: white;
  padding: 1px;
}

.p-inputtext {
  border-radius: 10px;
}

.error-borde {
  border: 1px solid #DD1C1C !important;
}
</style>
