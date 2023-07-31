import { socket } from "@/socket";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    alias: "/home",
    component: () => import("../views/HomePage.vue"),
    name: "Home",
  },
  {
    path: "/rooms",
    name: "Rooms",
    component: () => import("../views/Rooms.vue"),
  },
  {
    path: "/rooms/:name",
    name: "Room",
    component: () => import("../views/Room.vue"),
  },
];

const router = createRouter({
  routes,
  history: createWebHistory(),
});

export default router;
