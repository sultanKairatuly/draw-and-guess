export type Room = {
  name: string;
  messages: Message[];
  users: RoomUser[];
};

export type User = {
  name: string;
  id: number;
  avatar: string;
};

export type RoomUser = User & { count: number };

export type Message = {
  author: User;
  content: string;
  id: number;
};
