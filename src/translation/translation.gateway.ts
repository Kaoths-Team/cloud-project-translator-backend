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

  constructor(
    private readonly service: TranslationService
  ) {}

  handleConnection(
    @ConnectedSocket() client: Socket,
  ): any {
    console.log('con', client.id)
    this.server.to(client.id).emit('connected', { clientId: client.id });
  }

  handleDisconnect(
    @ConnectedSocket() client: Socket,
  ): void {
  }

  @SubscribeMessage('addRoom')
  async handleAddRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { username, roomName },
  ): Promise<void> {
    const existingRoom = this.getClientCurrentRoom(client);
    console.log('add')
    if (existingRoom) {
      client.leave(existingRoom);
      this.server.to(existingRoom).emit('leftRoom', { room: existingRoom });
    }
    client.join(roomName);
    this.server
      .to(roomName)
      .emit('joined', { username });
  }

  @SubscribeMessage('exitRoom')
  async handleExitRoom(
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
