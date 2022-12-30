"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const uuid_1 = require("uuid");
const chat_service_1 = require("./chat.service");
let ChatGateway = class ChatGateway {
    constructor(chatService) {
        this.chatService = chatService;
        this.rooms = new Map();
    }
    handleDisconnect(client) {
        const roomId = this.rooms.get(client.id);
        if (!roomId)
            return;
        this.server.to(roomId).emit("player_resigned", client.id);
        this.server.sockets.adapter.rooms.delete(roomId);
        this.rooms.delete(roomId);
    }
    play(client) {
        const rooms = Array.from(this.server.sockets.adapter.rooms).filter(([roomId, members]) => members.size === 1 && roomId.startsWith("room:"));
        if (rooms.length === 0) {
            const roomId = "room:" + (0, uuid_1.v4)();
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
    move(data, client) {
        const roomId = this.rooms.get(client.id);
        if (!roomId)
            return;
        client.to(roomId).emit("move", data);
    }
    shareProfile(data, client) {
        const roomId = this.rooms.get(client.id);
        if (!roomId)
            return;
        this.server.to(roomId).emit("share_profile", { id: client.id, data });
    }
    gameover(client) {
        const roomId = this.rooms.get(client.id);
        if (!roomId)
            return;
        this.server.sockets.adapter.rooms.delete(roomId);
        this.rooms.delete(roomId);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("play"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "play", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("move"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "move", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("share_profile"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "shareProfile", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("gameover"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "gameover", null);
ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true }),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map