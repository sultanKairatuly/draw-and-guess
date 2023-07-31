import { User } from "@/types";
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state() {
    return {
      user:
        JSON.parse(sessionStorage.getItem("user") as string) ||
        (null as User | null),
    };
  },
  actions: {
    setUser(payload: User | null) {
      this.user = payload;
      sessionStorage.setItem("user", JSON.stringify(this.user));
    },
  },
});
