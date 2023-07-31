import { Message, Participante, Room, RoomUser, User } from "../types";
import { Client } from "../mongo";
import { io } from "../index";

const { client, database, roomCollection } = Client;
export class RoomController {
  static db = client.db(database);
  static users: number[] = [];
  static async createRoom(room: Room) {
    await this.db.collection(roomCollection).insertOne(room);
  }

  static async isDuplicate(room: Room) {
    const rooms = this.db.collection(roomCollection).find({});
    let flag = false;
    for await (const item of rooms) {
      if (item.name === room.name) {
        flag = true;
      }
    }
    return flag;
  }

  static async addUser(name: string, user: RoomUser) {
    if (this.users.includes(user.id)) {
      return;
    } else {
      this.users.push(user.id);
      await this.db.collection(roomCollection).updateOne(
        { name },
        {
          $push: {
            users: user,
          },
        }
      );
    }
  }

  static async addMessage(message: Message & { room: string }) {
    await this.db.collection(roomCollection).updateOne(
      { name: message.room },
      {
        $push: {
          messages: message,
        },
      }
    );
  }

  static async getRooms() {
    const rooms = (await this.db
      .collection(roomCollection)
      .find({})
      .toArray()) as unknown as Room[];
    const data = rooms.map((r) => ({
      ...r,
      count: io.sockets.adapter.rooms.get(r.name)?.size ?? 0,
    }));
    return data;
  }

  static async deleteRoom({ name }: Room) {
    await this.db.collection(roomCollection).deleteOne({ name });
  }

  static async getRoom(name: string) {
    const room = await this.db.collection(roomCollection).findOne({ name });
    return room;
  }

  static async getUsersInRoom(name: string) {
    const room = await this.getRoom(name);
    if (room) {
      return room.users;
    } else {
      return [];
    }
  }

  static async increaseCount(name: string, user: User) {
    console.log("USER", user);
    await this.db.collection(roomCollection).updateOne(
      { "users.id": user.id },
      {
        $inc: {
          "users.$.count": 1,
        },
      }
    );
  }
}
