import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { v4 as uuid } from "uuid";
import { ChatService } from "./chat.service";

@WebSocketGateway({ cors: true })
export class ChatGateway {
  rooms: Map<string, string> = new Map();

  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  handleDisconnect(client: Socket) {
    const roomId = this.rooms.get(client.id);
    if (!roomId) return;

    this.server.to(roomId).emit("player_resigned", client.id);
    this.server.sockets.adapter.rooms.delete(roomId);
    this.rooms.delete(roomId);
  }

  @SubscribeMessage("play")
  play(client: Socket) {
    const rooms = Array.from(this.server.sockets.adapter.rooms).filter(
      ([roomId, members]) => members.size === 1 && roomId.startsWith("room:")
    );

    if (rooms.length === 0) {
      const roomId = "room:" + uuid();

      client.join(roomId);
      client.emit("created_room", roomId);
      this.rooms.set(client.id, roomId);

      return;
    }

    const [roomId] = rooms[0];
    client.join(roomId);
    this.rooms.set(client.id, roomId);

    const members = Array.from(this.server.sockets.adapter.rooms.get(roomId))
      .sort()
      .map((member, index) => ({ id: member, isWhite: index === 0 }));

    this.server.to(roomId).emit("joined_room_start_game", { roomId, members });
  }

  @SubscribeMessage("move")
  move(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // const roomId: string | undefined = Array.from(client.rooms).find((room) => room.startsWith("room:"));
    const roomId = this.rooms.get(client.id);
    if (!roomId) return;

    client.to(roomId).emit("move", data);
  }

  @SubscribeMessage("share_profile")
  shareProfile(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // const roomId: string | undefined = Array.from(client.rooms).find((room) => room.startsWith("room:"));
    const roomId = this.rooms.get(client.id);
    if (!roomId) return;

    this.server.to(roomId).emit("share_profile", { id: client.id, data });
  }

  @SubscribeMessage("gameover")
  gameover(@ConnectedSocket() client: Socket) {
    const roomId = this.rooms.get(client.id);
    if (!roomId) return;

    this.server.sockets.adapter.rooms.delete(roomId);
    this.rooms.delete(roomId);
  }
}
