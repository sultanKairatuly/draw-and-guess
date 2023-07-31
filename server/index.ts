import express from "express";
import router from "./router/router";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import type { Room, User, Participante, RoomUser, Message } from "./types";
import { RoomController } from "./contollers/RoomController";
import bodyParser from "body-parser";
import { Client } from "./mongo";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: "*",
  })
);
const jsonParser = bodyParser.json();
app.use(jsonParser);
const words = [
  "Дом",
  "Собака",
  "Кот",
  "Стол",
  "Окно",
  "Дверь",
  "Книга",
  "Школа",
  "Машина",
  "Цветок",
  "Море",
  "Река",
  "Дерево",
  "Лес",
  "Звезда",
  "Солнце",
  "Луна",
  "Снег",
  "Дождь",
  "Ветер",
  "Небо",
  "Земля",
  "Молоко",
  "Хлеб",
  "Сахар",
  "Вода",
  "Карандаш",
  "Ручка",
  "Бумага",
  "Мяч",
  "Ключ",
  "Компьютер",
  "Телефон",
  "Монета",
  "Соль",
  "Песок",
  "Воздух",
  "Огонь",
  "Чай",
  "Кофе",
  "Яблоко",
  "Груша",
  "Апельсин",
  "Мандарин",
  "Банан",
  "Капуста",
  "Морковь",
  "Картошка",
  "Лук",
  "Помидор",
  "Огурец",
  "Сыр",
  "Масло",
  "Колбаса",
  "Сок",
  "Мед",
  "Яйцо",
  "Рыба",
  "Мясо",
  "Курица",
  "Свинина",
  "Говядина",
  "Салат",
  "Луковица",
  "Парашют",
  "Космос",
  "Гриб",
  "Трава",
  "Цвет",
  "Краска",
  "Жук",
  "Пчела",
  "Крыло",
  "Ухо",
  "Глаз",
  "Рука",
  "Нога",
  "Сердце",
  "Мозг",
  "Рот",
  "Зуб",
  "Лицо",
  "Волос",
  "Кость",
  "Палец",
  "Живот",
  "Голова",
  "Город",
  "Село",
  "Деревня",
  "Парк",
  "Луг",
  "Поле",
  "Линия",
  "Круг",
  "Треугольник",
  "Квадрат",
  "Окружность",
  "Линия",
  "Путь",
  "Камень",
  "Замок",
  "Гора",
  "Долина",
  "Шум",
  "Птица",
  "Зверь",
  "Рыба",
  "Лягушка",
  "Медведь",
  "Волк",
  "Лев",
  "Тигр",
  "Котенок",
  "Щенок",
  "Человек",
  "Друг",
  "Мать",
  "Отец",
  "Сестра",
  "Брат",
  "Дедушка",
  "Бабушка",
  "Учитель",
  "Ученик",
  "Доктор",
  "Пациент",
  "Полицейский",
  "Врач",
  "Автомобиль",
  "Велосипед",
  "Самолет",
  "Корабль",
  "Домашнее животное",
  "Диносавр",
  "Секретарь",
  "Кассир",
  "Пекарь",
  "Портной",
  "Моряк",
  "Пожарник",
  "Бегемот",
  "Крокодил",
  "Змея",
  "Осьминог",
  "Корова",
  "Курица",
  "Петух",
  "Гусь",
  "Утка",
];
export const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
let guessWord = words[getRandomIntInclusive(0, words.length - 1)];
function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}
io.on("connection", (socket) => {
  io.of("/").adapter.on("leave-room", (room, id) => {});

  socket.on("leave", async (room) => {
    socket.leave(room);
    const rooms = await RoomController.getRooms();
    for (let room of rooms) {
      let count = io.sockets.adapter.rooms.get(room.name)?.size ?? 0;

      if (count === 0) {
        await RoomController.deleteRoom(room as unknown as Room);
      }
    }
  });

  socket.on("create-room", async (msg) => {
    try {
      const data: Participante = JSON.parse(msg);
      socket.join(data.room.name);
      const room: Room = {
        name: data.room.name,
        messages: [],
        users: [
          {
            name: data.name,
            avatar: data.avatar,
            id: data.id,
            count: 0,
          },
        ],
      };
      const isDuplicate = await RoomController.isDuplicate(room);
      if (!isDuplicate) {
        await RoomController.createRoom(room);
        io.emit("created-room", msg);
        const rooms = await RoomController.getRooms();
        io.emit("rooms", JSON.stringify(rooms));
        io.to(data.room.name).emit("joined-room", JSON.stringify(msg));
        io.to(data.room.name).emit("guess_word", guessWord);
      } else {
        io.emit("busy");
      }
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("clear", (room) => {
    io.to(room).emit("clear");
  });

  socket.on("join-room", async (msg) => {
    const data: Participante = JSON.parse(msg);
    const room = await Client.client
      .db("main")
      .collection("room")
      .findOne({ name: data.room.name });
    if (room && "users" in room) {
      const candidate = room.users.find((u: RoomUser) => u.name === data.name);
      if (candidate) {
      } else {
        await RoomController.addUser(data.room.name, {
          name: data.name,
          avatar: data.avatar,
          id: data.id,
          count: 0,
        });
      }
    }

    socket.join(data.room.name);
    io.to(data.room.name).emit("joined-room", msg);
    io.to(data.room.name).emit("guess_word", guessWord);
  });

  socket.on("draw", (msg) => {
    const data = JSON.parse(msg);
    socket.broadcast.to(data.room).emit("draw", msg);
  });

  socket.on("finish", (room) => {
    io.to(room).emit("finish");
  });

  socket.on("sendMessage", async (msg) => {
    const data: Message & { room: string; guess: string } = JSON.parse(msg);
    if (data.guess.toLowerCase() === data.content.toLowerCase()) {
      await RoomController.increaseCount(data.room, data.author);
      io.to(data.room).emit("guess", { ...data.author, guess: data.guess });
      guessWord = words[getRandomIntInclusive(0, words.length - 1)];
      io.to(data.room).emit("guess_word", guessWord);
    }
    RoomController.addMessage(data);
    io.to(data.room).emit("message", data.content);
  });
});

app.use("/", router);

server.listen(PORT, () => {
  console.log("Server is listening on port " + PORT);
});
