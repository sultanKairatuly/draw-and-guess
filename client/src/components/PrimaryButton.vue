<template>
  <button class="btn"><slot></slot></button>
</template>

<style scoped>
.btn {
  color: #fff;
  font-weight: 400;
  text-align: center;
  padding: 10px 25px;
  font-size: 17px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  background-color: #67db85;
}

.btn:hover {
  background-color: #6ee88f;
}
</style>
