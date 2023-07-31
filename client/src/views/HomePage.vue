<template>
  <div class="container">
    <GameContainer
      :isModal="isModal"
      :username="username"
      :pictureIndex="pictureIndex"
      :pictureURL="pictureURL"
      @update:isModal="updateIsModal"
      @update:value="updateValue"
      @update:pictureIndex="updatePictureIndex"
      @connectToRoom="
        setUser({
          name: username,
          id: Math.random() * 100000,
          avatar: pictureURL,
        })
      "
    />
    <CreateModal
      :value="username"
      :isModal="isModal"
      :avatar="pictureURL"
      @update:isModal="updateIsModal"
      @update:value="updateValue"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import GameContainer from "@/components/GameContainer.vue";
import CreateModal from "@/components/CreateModal.vue";
import { useUserStore } from "@/store/user";

const { setUser } = useUserStore();
const isModal = ref(false);
const username = ref("");
const pictureIndex = ref(1);
const pictureURL = computed(() => {
  return `/${pictureIndex.value}.svg`;
});

function updateIsModal(value: boolean) {
  isModal.value = value;
  if (value) {
    const id = Math.random() * 10000;
    setUser({
      name: username.value,
      id,
      avatar: pictureURL.value,
    });
  }
}

function updateValue(e: string) {
  username.value = e;
}

function updatePictureIndex(e: number) {
  pictureIndex.value = e;
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
</style>
