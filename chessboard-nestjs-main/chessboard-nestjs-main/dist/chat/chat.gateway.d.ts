import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
export declare class ChatGateway {
    private readonly chatService;
    rooms: Map<string, string>;
    constructor(chatService: ChatService);
    server: Server;
    handleDisconnect(client: Socket): void;
    play(client: Socket): void;
    move(data: any, client: Socket): void;
    shareProfile(data: any, client: Socket): void;
    gameover(client: Socket): void;
}
