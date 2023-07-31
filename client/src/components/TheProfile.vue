<template>
  <div class="profile">
    <div class="profile_picture">
      <i
        class="fa-solid fa-chevron-left arrow"
        arrow-left
        @click="decrementPictureIndex"
      ></i>
      <div class="profile_picture-wrapper">
        <img
          class="profile_picture-image"
          :src="props.pictureURL"
          alt="profile picture"
        />
      </div>
      <i
        class="fa-solid arrow fa-chevron-right arrow-right"
        @click="incrementPictureIndex"
      ></i>
    </div>
    <PrimaryInput
      style="width: 230px"
      placeholder="Введите ваше имя"
      :value="props.username"
      @update:value="updateValue"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isModal: boolean;
  username: string;
  pictureIndex: number;
  pictureURL: string;
}>();

const emit = defineEmits<{
  (e: "update:value", value: string): void;
  (e: "update:pictureIndex", value: number): void;
}>();

function decrementPictureIndex() {
  if (props.pictureIndex === 1) {
    emit("update:pictureIndex", 6);
  } else {
    emit("update:pictureIndex", props.pictureIndex - 1);
  }
}

function incrementPictureIndex() {
  if (props.pictureIndex === 6) {
    emit("update:pictureIndex", 1);
  } else {
    emit("update:pictureIndex", props.pictureIndex + 1);
  }
}

function updateValue(e: string) {
  emit("update:value", e);
}
</script>

<style scoped>
.profile {
}
.profile_picture {
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 20px;
}
.arrow {
  font-size: 23px;
  cursor: pointer;
  transition: 0.2s ease-in-out;
  color: rgb(176, 150, 0);
  font-weight: 700;
}

.arrow:hover {
  transform: scale(1.2);
}
.profile_picture-wrapper {
  background-color: #fff;
  border-radius: 100%;
  border: 5px solid rgb(176, 150, 0);
  width: 100px;
  height: 100px;
  overflow: hidden;
}
.profile_picture-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
