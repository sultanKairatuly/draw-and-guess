import { ref } from "vue";
import type { User } from "@/types";

const user = ref<User | null>(null);

export default function useUser() {
  const setUser = (value: User | null) => {
    user.value = value;
  };
  

  return {
    user,
    setUser,
  };
}
