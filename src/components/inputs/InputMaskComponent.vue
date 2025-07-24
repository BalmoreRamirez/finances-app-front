<template>
  <div class="flex flex-col">
    <span class="p-float-label "
          :class="icon_left && icon !=null ? 'p-input-icon-left' : icon_right && icon !=null ? 'p-input-icon-right': '' ">
        <i :class="'pi pi-'+icon" v-if="icon"/>
          <InputMask id="item" v-model="item" :disabled="disabled" :mask="mask"
                     class="  placeholder-primary-700  w-full hover:border-primary-700  focus:border-primary-700 !bg-transparent"
                     :class=" inputClass, icon_left && icon !=null ? 'pl-10' : icon_right && icon !=null ? 'pr-10': '' "
                     @update:modelValue="$emit('update:modelValue', item)"
          />
    <label class="pl-2 text-[11px] sm:text-[13px]" :class="props.errors?.length >  0 ? 'text-danger-700' : 'text-primary-700'"
           :for="item">{{ placeholder }}</label>
</span>
    <p v-if="props.errors?.length > 0" class="text-xs text-danger-500 px-2">
      <span v-for="(error, index) in errors" :key="index" class="block py-1">{{ error.$message }}</span>
    </p>
  </div>
</template>

<script setup>
import 'primeicons/primeicons.css'
import {ref, onMounted, computed, watchEffect} from 'vue'
import InputMask from 'primevue/inputmask';

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
  mask: {
    type: String,
    default: '99999999-9',
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
