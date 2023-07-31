import express from "express";
import { io } from "../index";
import { RoomController } from "../contollers/RoomController";
import { Room } from "../types";
import fs from "fs";

const router = express.Router();

router.get("/rooms", async (req, res) => {
  const rooms = (await RoomController.getRooms()) as unknown as Room[];

  io.emit(
    "rooms",
    JSON.stringify(
      rooms.map((r) => ({
        ...r,
        count: io.sockets.adapter.rooms.get(r.name)?.size ?? 0,
      }))
    )
  );
  res.end();
});

router.get("/rooms/:room", async (req, res) => {
  const name = req.params.room;
  const room = await RoomController.getRoom(name);
  res.send(room);
});

router.post("/images/:image", (req, res) => {
  try {
    const data = req.body.image;
    fs.writeFileSync(`./files/${req.params.image}.jpg`, `${data}`, "base64");
    res.end();
  } catch (e) {
    console.log(e);
  }
});

router.get("/images/:image", (req, res) => {
  try {
    const url = fs.readFileSync(`./files/${req.params.image}`);
    if (!url) {
      res.send("nf");
    } else {
      const image = "data:image/png;base64," + url.toString("base64");
      res.send(image);
    }
  } catch (e) {}
});

router.get("/rooms/users/:name", async (req, res) => {
  const users = await RoomController.getUsersInRoom(req.params.name);
  res.send(users);
});

export default router;
