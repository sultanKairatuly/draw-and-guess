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
  border-radius: 5px;
  cursor: pointer;
  background-color: #5cb9f9;
}

.btn:hover {
  background-color: #6bc3fe;
}
</style>
