<template>
  <div class="canvas_container">
    <canvas
      id="cvs"
      ref="canvas"
      width="650"
      height="650"
      class="canvas"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
    ></canvas>
    <footer class="footer" v-if="isPainter">
      <div class="colors">
        <div
          :style="{
            'background-color': item,
          }"
          @click="color = item"
          class="color"
          v-for="item in colors"
          :key="item"
          :class="{
            active: item === color,
          }"
        ></div>
      </div>
      <button class="clear" @click="clearCanvas">Очистить</button>
      <div class="widths">
        <div
          @click="lineWidth = width.value"
          class="width"
          v-for="width in widths"
          :style="{
            height: `${width.radius}px`,
            width: `${width.radius}px`,
          }"
          :class="{
            active: lineWidth === width.value,
          }"
        ></div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { socket } from "@/socket";
import axios from "axios";

const color = ref("#000");
const props = defineProps<{
  room: string;
  isPainter: boolean;
  guessWord: string;
}>();
const urlsu = ref("");
const colors = [
  "#000",
  "#FF0000",
  "#FFFF00",
  "#00FF00",
  "#00FFFF",
  "#FF00FF",
  "#808080",
  "#fff",
];
type Width = {
  value: number;
  radius: number;
};
const lineWidth = ref(1);
const widths: Width[] = [
  { value: 1, radius: 10 },
  { value: 3, radius: 13 },
  { value: 6, radius: 16 },
  { value: 10, radius: 20 },
];

let isDrawing = false;
const canvas = ref<null | HTMLCanvasElement>(null);
let ctx: CanvasRenderingContext2D | null = null;

fillCanvas();

async function fillCanvas() {
  const response = await axios.get(`/images/${props.room}.jpg`);
  urlsu.value = response.data;
  const image = new Image();
  image.src = response.data;
  image.onload = () => {
    ctx?.clearRect(
      0,
      0,
      (canvas.value as HTMLCanvasElement).width,
      (canvas.value as HTMLCanvasElement).height
    );
    ctx?.drawImage(
      image,
      0,
      0,
      (canvas.value as HTMLCanvasElement).width,
      (canvas.value as HTMLCanvasElement).height
    );
    ctx?.stroke();
  };
}
onMounted(() => {
  if (canvas.value) ctx = canvas.value.getContext("2d");
});

socket.on("clear", () => {
  console.log(canvas.value);
  ctx?.clearRect(0, 0, 650, 650);
});

socket.on("draw", (msg) => {
  const { x, y, color, width } = JSON.parse(msg);
  if (ctx) {
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }
});

socket.on("finish", () => ctx?.beginPath());

function startDrawing(e: MouseEvent) {
  if (props.isPainter) {
    isDrawing = true;
    const { offsetX, offsetY } = e;
    const target = e.target as HTMLCanvasElement;
    if (ctx && canvas.value && target) {
      ctx.beginPath();
      ctx.lineWidth = lineWidth.value;
      ctx.moveTo(offsetX, offsetY);
    }
  }
}

function draw(e: MouseEvent) {
  if (props.isPainter && isDrawing && canvas.value && ctx) {
    const { offsetX, offsetY } = e;
    console.log(offsetX, offsetY);
    const target = e.target as HTMLCanvasElement;
    if (target) {
      ctx.lineTo(offsetX - target.offsetLeft, offsetY - target.offsetTop);
      ctx.strokeStyle = color.value;
      ctx.stroke();

      socket.emit(
        "draw",
        JSON.stringify({
          x: offsetX - target.offsetLeft,
          y: offsetY - target.offsetTop,
          color: color.value,
          room: props.room,
          width: lineWidth.value,
        })
      );
    }
  }
}

function stopDrawing() {
  if (props.isPainter) {
    isDrawing = false;
    socket.emit("finish", props.room);
    const url = canvas.value?.toDataURL().replace("data:image/png;base64,", "");
    axios.post(`/images/${props.room}`, {
      image: url,
    });
  }
}

function clearCanvas() {
  socket.emit("clear", props.room);
  ctx?.clearRect(0, 0, 650, 650);
  const url = canvas.value?.toDataURL().replace("data:image/png;base64,", "");
  axios.post(`/images/${props.room}`, {
    image: url,
  });
}
</script>

<style>
.canvas {
  width: 100%;
}

.canvas_container {
  position: relative;
  display: flex;
  flex-direction: columns;
  height: 100%;
}

.colors {
  display: flex;
  align-items: center;
  column-gap: 10px;
  top: 20px;
  left: 20px;
}

.color {
  width: 25px;
  cursor: pointer;
  height: 25px;
  border-radius: 50%;
}

.header {
  display: flex;
  align-items: center;
  position: absolute;
  margin: 20px 0 0 20px;
}

.guess_word {
  text-align: center;
  text-transform: uppercase;
  font-size: 22px;
  width: 100%;
}

.clear {
  margin: 0 20px;
}

.active {
  border: 1px solid rgb(38, 25, 25);
  transform: scale(0.9);
  padding: 5px;
  position: relative;
}

.active::before {
  content: "";
  width: 30px;
  height: 30px;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: transparent;
  border: 1px solid #000;
  display: flex;
}

.widths {
  display: flex;
  column-gap: 13px;
  align-items: center;
  margin-top: 10px;
}

.width {
  background-color: #000;
  border-radius: 50%;
  cursor: pointer;
}

.footer {
  display: flex;
  justify-content: space-between;
  position: absolute;
  bottom: 10px;
  width: 100%;
  left: 0;
  background-color: #fff;
  padding: 5px 20px;
  border-top: 1px solid #e5e5e5;
}

.clear {
  background-color: rgb(255, 2, 52);
  border-radius: 10px;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
}
</style>
