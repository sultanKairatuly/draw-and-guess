<template>
  <div class="modal" v-if="isModal">
    <div class="modal_content">
      <PrimaryInput
        :value="roomname"
        @update:value="updateValue"
        placeholder="Введите имя комнаты"
      />
      <div class="btns">
        <PrimaryButton class="btn" @click="createRoom">Создать</PrimaryButton>
      </div>
      <div class="warning" v-if="warning.length">{{ warning }}</div>
      <button class="close" @click="emit('update:isModal', false)"></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { socket } from "@/socket";
import { warn } from "@/composables/utility";
import type { User } from "@/types";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const router = useRouter();
const props = defineProps<{
  isModal: boolean;
  value: string;
  avatar: string;
}>();

const emit = defineEmits<{
  (e: "update:value", value: string): void;
  (e: "update:isModal", value: boolean): void;
}>();

socket.on("busy", () => {
  warn(warning, "Комната с таким именем уже существует");
});

socket.on("created-room", (msg) => {
  const data: User = JSON.parse(msg);
  if (props.value === data.name) {
    router.push(`/rooms/${roomname.value}`);
  }
});
const roomname = ref("");
const warning = ref("");

function createRoom() {
  if (roomname.value) {
    const participante = {
      name: userStore.user.name,
      id: userStore.user.id,
      room: { name: roomname.value },
      avatar: userStore.user.avatar,
    };
    socket.emit("create-room", JSON.stringify(participante));
  } else {
    warn(warning, "Имя комнаты обязательно");
  }
}

function updateValue(e: string) {
  roomname.value = e;
}
</script>

<style scoped>
.modal {
  position: absolute;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  left: 0;
  background-color: #00000057;
}

.modal_content {
  background-color: #fff;
  padding: 30px;
  position: relative;
  width: 400px;
  height: 400px;
  border-radius: 5px;
  border: 1px solid #e5e5e5;
}

.warning {
  margin-top: 10px;
  color: red;
  padding: 10px;
  border: 1px solid red;
  text-align: center;
}
.close {
  position: absolute;
  right: 15px;
  top: 15px;
  background-color: transparent;
  width: 24px;
  height: 24px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  background-image: url("../assets/cross-medium.svg");
  border: none;
  outline: none;
  cursor: pointer;
}

.close:hover {
  border: none;
}

.btn {
  margin: 0 auto;
}
</style>
