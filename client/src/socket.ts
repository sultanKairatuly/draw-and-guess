import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
  connected: true,
});

const URL = "http://localhost:5000";

export const socket = io(URL);

socket.on("disconnect", () => {
  state.connected = false;
});
