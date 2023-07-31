<template>
  <div class="name">
    <input
      class="name_input"
      :placeholder="props.placeholder"
      :value="props.value"
      @input="(e) => emit('update:value', (e.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "update:value", value: string): void;
}>();
const props = withDefaults(
  defineProps<{
    value: string;
    placeholder?: string;
  }>(),
  {
    placeholder: "",
  }
);
</script>

<style scoped>
.name {
  margin: 30px auto;
}
.name_input {
  width: 100%;
  border-radius: 5px;
  border: 1px solid #c6c6c6;
  font-size: 17px;
  padding: 7px 15px;
  outline: none;
}

.name_input:focus {
  border: 1px solid rgb(17, 132, 255);
}
</style>
