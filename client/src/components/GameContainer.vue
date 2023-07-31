<template>
  <div class="game_container">
    <TheProfile
      :isModal="props.isModal"
      :username="props.username"
      :pictureIndex="props.pictureIndex"
      :pictureURL="props.pictureURL"
      @update:value="updateValue"
      @update:pictureIndex="updatePictureIndex"
    />
    <div class="btns">
      <PrimaryButton @click="openModal">Создать игру</PrimaryButton>
      <SecondaryButton @click="connectToRoom"
        >Подключиться к игре</SecondaryButton
      >
    </div>
    <div class="warning" v-if="warning">
      {{ warning }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import TheProfile from "./TheProfile.vue";
import { warn } from "@/composables/utility";
import { ref } from "vue";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const props = defineProps<{
  isModal: boolean;
  username: string;
  pictureIndex: number;
  pictureURL: string;
}>();

const emit = defineEmits<{
  (e: "update:isModal", value: boolean): void;
  (e: "update:value", value: string): void;
  (e: "update:pictureIndex", value: number): void;
  (e: "connectToRoom"): void;
}>();

const warning = ref("");
const router = useRouter();

function connectToRoom() {
  emit("connectToRoom");
  if (userStore.user?.name) {
    router.push("/rooms");
  } else {
    warn(warning, "Имя обязательно");
  }
}

function openModal() {
  if (props.username) {
    emit("update:isModal", true);
  } else {
    warn(warning, "Имя обязательно");
  }
}

function updateValue(e: string) {
  emit("update:value", e);
}

function updatePictureIndex(e: number) {
  emit("update:pictureIndex", e);
}
</script>

<style scoped>
.game_container {
  width: 400px;
  height: 400px;
  background-color: #fff;
  border-radius: 5px;
  -webkit-box-shadow: 0px 0px 14px -3px rgba(34, 60, 80, 0.2);
  -moz-box-shadow: 0px 0px 14px -3px rgba(34, 60, 80, 0.2);
  box-shadow: 0px 0px 14px -3px rgba(34, 60, 80, 0.2);
  padding: 20px;
  background-repeat: no-repeat;
  background-image: url("../../public/bg.png");
  background-position: center;
  background-size: cover;
}

.btns {
  margin: 40px auto;
}
.warning {
  margin-top: 10px;
  color: red;
  padding: 10px;
  border: 1px solid red;
  text-align: center;
}
.btn {
  display: block;
  margin: 10px auto;
}
</style>
