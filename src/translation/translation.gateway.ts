import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection, OnGatewayDisconnect
} from "@nestjs/websockets";
import { Socket, Server } from 'socket.io';
import { TranslationService } from "./translation.service";

@WebSocketGateway({ transports: ['websocket'] })
export class TranslationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly clients = {}

  constructor(
    private readonly service: TranslationService
  ) {}

  handleConnection(
    @ConnectedSocket() client: Socket,
  ): any {
    this.server.to(client.id).emit('connected', { clientId: client.id });
  }

  handleDisconnect(
    @ConnectedSocket() client: Socket,
  ): void {
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomCode, languageCode },
  ): Promise<void> {
    const existingRoom = this.getClientCurrentRoom(client);
    if (existingRoom) {
      client.leave(existingRoom);
      this.server.to(existingRoom).emit('leftRoom', { room: existingRoom });
    }
    client.join(roomCode);
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { username, roomCode },
  ): Promise<void> {
    const existingRoom = this.getClientCurrentRoom(client);
    if (existingRoom) {
      client.leave(existingRoom);
      this.server.to(existingRoom).emit('leftRoom', { username, roomCode: existingRoom });
    }
    client.join(roomCode);
    this.server
      .to(roomCode)
      .emit('joined', { username });
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() username,
  ) {
    const roomName = this.getClientCurrentRoom(client);
    if (roomName) {
      client.leave(roomName);
      this.server.to(roomName).emit('exitedRoom', username);
    }
  }

  private getClientCurrentRoom(client: Socket) {
    return Object.keys(client.rooms).filter(room => room !== client.id)[0];
  }
}
