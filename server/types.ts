export type User = {
  name: string;
  id: number;
  avatar: string;
};
export type Participante = User & { room: Room };

export type Room = {
  name: string;
  messages: Message[];
  users: RoomUser[];
};

export type Message = {
  author: User;
  content: string;
  id: number;
};
export type RoomUser = User & { count: number };
