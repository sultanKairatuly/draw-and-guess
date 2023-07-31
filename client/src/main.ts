import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import axios from "axios";
import PrimaryButton from "@/components/PrimaryButton.vue";
import SecondaryButton from "@/components/SecondaryButton.vue";
import PrimaryInput from "@/components/PrimaryInput.vue";
import { createPinia } from "pinia";
import { socket } from "./socket";

socket.on("connect", () => {
  console.log("connected");
});


axios.defaults.baseURL = "http://localhost:5000";
const app = createApp(App);
const pinia = createPinia();

app.component("PrimaryButton", PrimaryButton);
app.component("SecondaryButton", SecondaryButton);
app.component("PrimaryInput", PrimaryInput);

app.use(router).use(pinia).mount("#app");
