<template>
  <div class="container">
    <div class="game_container">
      <Loader v-if="!room && !guessWord" />
      <div class="left">
        <div class="painter_corner">
          <div class="painter_picture-wrapper">
            <img :src="painter?.avatar" class="painter_picture" />
          </div>
          <div class="name">{{ painter?.name }}</div>
        </div>
        <div class="header" v-if="isPainter">
          <div class="guess_word" v-if="guessWord">
            {{ guessWord }}
          </div>
          <div class="loading-animation" v-else>
            <div class="dot dot-1"></div>
            <div class="dot dot-2"></div>
            <div class="dot dot-3"></div>
          </div>
        </div>

        <Canvas
          :guessWord="guessWord"
          :isPainter="isPainter"
          :room="(route.params.name as string)"
        />
        <div class="guess_modal" v-if="isGuessPopup">
          <div class="guess_modal-content">
            <h3 class="title">
              <div class="modal_word">{{ guessWord }}</div>
              <div class="painter">
                <i class="fa-solid fa-paintbrush"></i> {{ painter?.name }}
              </div>
              <div class="guesser">
                <i class="fa-solid fa-trophy"></i> {{ guesser?.name }}
              </div>
            </h3>
          </div>
        </div>
        <div class="guess_modal over-modal" v-if="isOver">
          <div class="guess_modal-content">
            <div
              style="
                display: flex;
                flex-direction: column;
                row-gap: 15px;
                align-items: center;
              "
            >
              <h1 class="title">Игра окончена!</h1>
              <div class="title">Победил игрок {{ winner?.name }}</div>
              <PrimaryButton @click="router.push('/')"
                >Вернуться на главную</PrimaryButton
              >
            </div>
          </div>
        </div>
      </div>
      <div class="right" v-if="room">
        <div class="users_table">
          <div class="round">{{ round }} раунд из {{ maxRound }}</div>
          <div class="user" v-for="user in usersTop" :key="user.id">
            <div class="user_head">
              <div class="user_image-container">
                <img :src="user.avatar" class="message_item user_image" />
              </div>
              <div class="user_item user_name">
                {{ user.name }}
              </div>
            </div>
            <div class="coins">
              <div class="coins_count">{{ user.count }}</div>
              <i class="fa-solid fa-coins coins_image"></i>
            </div>
          </div>
        </div>
        <div class="chat">
          <div
            class="messages"
            :class="{
              pb: !isPainter,
            }"
          >
            <div
              class="message"
              v-for="message in room.messages"
              :key="message.id"
            >
              <div class="message_avatar-container">
                <img
                  :src="message.author.avatar"
                  class="message_item messaage_image"
                />
              </div>

              <div class="message_item message_name">
                {{ message.author.name }}
              </div>
              <div class="message_item message_content">
                {{ message.content }}
              </div>
            </div>
          </div>

          <input
            @keydown="handleInputKeyDown"
            v-model="msg"
            type="text"
            v-if="!isPainter"
            placeholder="Введите слово"
            class="chat_input"
          />
          <button v-if="msg.length" class="send" @click="sendMessage">
            <i class="fa-solid fa-arrow-right send_icon"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { socket } from "@/socket";
import { useRoute, onBeforeRouteLeave } from "vue-router";
import { ref, computed } from "vue";
import { useUserStore } from "@/store/user";
import type { Message, Room, User, RoomUser } from "@/types";
import axios from "axios";
import Loader from "@/components/Loader.vue";
import Canvas from "@/components/Canvas.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const guessWord = ref("");
const guesser = ref<User | null>(null);
const isGuessPopup = ref(false);
const round = ref(Number(localStorage.getItem("round")) || 15);
const maxRound = 15;
onBeforeRouteLeave(() => {
  socket.emit("leave", route.params.name);
});

const loading = ref(false);
const room = ref<Room | null>(null);
const userStore = useUserStore();
const msg = ref<string>("");
const route = useRoute();
const painterIdx = ref(0);
const isOver = ref(false);
const painter = computed(() => {
  return room.value?.users[painterIdx.value];
});
const winner = computed<null | RoomUser>(() => {
  let max = 0;
  let wnr: RoomUser | null = null;
  room.value?.users.forEach((u) => {
    if (u.count > max) {
      max = u.count;
      wnr = u;
    }
  });
  return wnr;
});
const isPainter = computed(() => userStore.user.id === painter?.value?.id);
const usersTop = computed(() =>
  [...room.value!.users].sort((a, b) => b.count - a.count)
);
socket.emit(
  "join-room",
  JSON.stringify({
    ...userStore.user,
    room: { name: route.params.name },
  })
);

socket.on("guess_word", (msg) => {
  setTimeout(() => {
    guessWord.value = msg;
  }, 5000);
});

socket.on("message", async () => {
  const response = await axios.get<Room>(`/rooms/${route.params.name}`);
  room.value = response.data;
});

socket.on("guess", (user: User & { guess: string }) => {
  guesser.value = { ...user };
  isGuessPopup.value = true;
  delay(() => (isGuessPopup.value = false));
  if (round.value === maxRound) {
    delay(() => (isGuessPopup.value = false))
      .then(() => {
        console.log("sjsjjsjsj");
        isOver.value = true;
      })
      .catch(console.log);
  } else {
    round.value++;
    localStorage.setItem("round", round.value.toString());
    choosePainter();
  }
  socket.emit("clear", route.params.name);
});

socket.on("joined-room", () => {
  fetchRoom(false);
});

function delay(callback: (...args: any[]) => any, delay = 5000) {
  return new Promise<void>((res) => {
    setTimeout(() => {
      callback();
      console.log("resolved");
      res();
    }, delay);
  });
}

function choosePainter() {
  if (room.value && painterIdx.value === room.value?.users.length - 1) {
    painterIdx.value = 0;
  } else {
    painterIdx.value++;
  }
}

function handleInputKeyDown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    sendMessage();
  }
}

function sendMessage() {
  const newMessage: Message & { room: string; guess: string } = {
    author: userStore.user,
    id: Math.random() * 10000,
    content: msg.value,
    room: route.params.name as string,
    guess: guessWord.value,
  };
  socket.emit("sendMessage", JSON.stringify(newMessage));
  msg.value = "";
}
fetchRoom();
async function fetchRoom(l = true) {
  loading.value = l;
  try {
    const response = await axios.get(`/rooms/${route.params.name}`);
    room.value = response.data;
  } catch (e) {
    console.log(e);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #acb6f5;
  height: 100vh;
  overflow: hidden;
  width: 100vw;
}

.game_container {
  background-color: #fff;
  border-radius: 10px;
  width: 80vw;
  position: relative;
  height: 80vh;
  overflow: hidden;
  -webkit-box-shadow: 0px 0px 14px -3px rgba(34, 60, 80, 0.2);
  -moz-box-shadow: 0px 0px 14px -3px rgba(34, 60, 80, 0.2);
  box-shadow: 0px 0px 14px -3px rgba(34, 60, 80, 0.2);
  display: flex;
}

.left {
  width: 75%;
  position: relative;
}

.guess_modal {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: #f2f2f2c7;
  display: flex;
  justify-content: center;
  align-items: center;
}
.guess_modal-content {
  width: 70%;
  height: 70%;
  background-color: transparent;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.guss {
  color: goldenrod;
  font-weight: 500;
  font-size: 25px;
}
.title {
  font-size: 20px;
}
.canvas {
  width: 100%;
  height: 100%;
}
.right {
  width: 25%;
  display: flex;
  flex-direction: column;
  border-left: 2px solid #dfdfdf;
}
.users_table {
  height: 25%;
  overflow-y: scroll;
  background-color: #c09df5;
}
.chat {
  height: 75%;
  position: relative;
  display: flex;
  flex-direction: column;
  border-top: 1px solid #e5e5e5;
}

.messages {
  padding: 10px;
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  overflow-y: scroll;
  height: 100%;
  justify-content: flex-end;
}

.pb {
  padding-bottom: 60px;
}
.message {
  align-items: center;
  display: flex;
  column-gap: 10px;
}
.message_item {
}
.user_name {
  color: #fff;
  font-weight: 500;
  font-size: 16px;
}
.user_image-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #fff;
  margin-right: 10px;
  border: 3px solid goldenrod;
}
.user_image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.message_name {
  color: goldenrod;
  font-weight: 500;
  font-size: 18px;
}
.message_content {
  font-size: 16px;
}
.chat_input {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px 5px;
  font-size: 17px;
  border: none;
  border-top: 1px solid #e5e5e5;
  outline: none;
}

.user {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 10px;
}

.user_head {
  display: flex;
  align-items: center;
}

.coins {
  display: flex;
  align-items: center;
}
.coins_count {
  font-weight: 500;
  color: #fff;
  margin-right: 5px;
}

.header {
  width: 100%;
}

.send {
  background-color: #5cb9f9;
  width: 30px;
  height: 30px;
  position: absolute;
  bottom: 5px;
  border-radius: 5px;
  border: none;
  right: 10px;
  z-index: 100;
  cursor: pointer;
}

.send_icon {
  color: #fff;
  font-size: 17px;
}
.fa-solid {
}
.fa-coins {
  color: gold;
  font-size: 17px;
}

.round {
  font-size: 16px;
  color: #fff;
  font-weight: 400;
  text-align: center;
  margin: 10px 0;
}

.guess_word {
  font-size: 18px;
  text-align: center;
  font-weight: 400;
  position: absolute;
  top: 10px;
  width: 100%;
  display: block;
}

.guss {
  margin-bottom: 10px;
  text-align: center;
  font-size: 25px;
}

.subtitle {
  font-size: 30px;
}

.word {
  background-color: gold;
  font-size: 32px;
  font-weight: 500;
  text-transform: uppercase;
}

.loading-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px;
  position: absolute;
  top: 10px;
  width: 100%;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 4px;
  border-radius: 50%;
  background-color: #000;
  opacity: 0;
}

@keyframes loading {
  0%,
  80%,
  100% {
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
}

.dot-1 {
  animation: loading 1.4s infinite ease-in-out;
}

.dot-2 {
  animation: loading 1.4s infinite ease-in-out 0.2s;
}

.dot-3 {
  animation: loading 1.4s infinite ease-in-out 0.4s;
}

.title {
}
.modal_word {
  font-size: 45px;
  text-align: center;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.painter {
  font-size: 20px;
  margin-left: 5px;
  margin-bottom: 10px;
}
.fa-solid {
  font-size: 25px;
}
.fa-paintbrush {
  color: rgb(0, 140, 255);
}
.guesser {
  font-size: 20px;
  margin-left: 5px;
}
.fa-trophy {
  color: gold;
}

.painter_corner {
  display: flex;
  column-gap: 10px;
  align-items: center;
  position: absolute;
  top: 10px;
  left: 10px;
}
.painter_picture-wrapper {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid indigo;
}
.painter_picture {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.name {
  font-size: 18px;
}
</style>
