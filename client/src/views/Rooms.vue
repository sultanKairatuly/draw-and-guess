<template>
  <div class="container">
    <div class="rooms">
      <h2 class="rooms_title">Комнаты</h2>
      <div class="rooms_content">
        <div class="room" v-for="room in rooms" :key="room.name">
          <div class="room_item">
            <div class="room_item-title">Имя комнаты</div>
            <div class="room_item-value">{{ room.name }}</div>
          </div>
          <div class="room_item">
            <div class="room_item-title">Онлайн комнаты</div>
            <div class="room_item-value">{{ room.count }} / 5</div>
          </div>
          <div class="room_item">
            <SecondaryButton @click="joinRoom(room)"
              >Подключиться</SecondaryButton
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import { useRouter } from "vue-router";
import type { Room } from "../types";
import { socket } from "@/socket";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const router = useRouter();
const rooms = ref<(Room & { count: number })[]>([]);

socket.on("rooms", (msg) => {
  const data = JSON.parse(msg);
  rooms.value = data;
});

(async function fetchRooms() {
  axios.get("/rooms");

})();

function joinRoom(room: Room) {
  socket.emit("join-room", JSON.stringify({ ...userStore.user, room }));
  router.push(`/rooms/${room.name}`);
}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #acb6f5;
  height: 100vh;
  width: 100vw;
}

.rooms {
  background-color: #fff;
  height: 75vh;
  width: 75vw;
  border-radius: 10px;
  -webkit-box-shadow: 0px 0px 14px -3px rgba(34, 60, 80, 0.2);
  -moz-box-shadow: 0px 0px 14px -3px rgba(34, 60, 80, 0.2);
  box-shadow: 0px 0px 14px -3px rgba(34, 60, 80, 0.2);
}

.rooms_title {
  font-size: 30px;
  text-align: center;
  margin: 30px;
}
.room {
  display: flex;
  column-gap: 30px;
  padding: 10px;
  border: 1px solid #e5e5e5;
  justify-content: space-around;
  transition: 0.2s ease-in-out;
}

.room_item-title {
  margin-bottom: 5px;
  font-size: 17px;
}

.name {
  font-size: 18px;
}
.participantes {
}
</style>
