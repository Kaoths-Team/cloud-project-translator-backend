import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { TranslationService } from './translation.service';
import { CLIENT_EVENT, SERVER_EVENT } from '../constants/event.enum';
import {
  JoinRoomDto,
  SpeechToSpeechDto,
  UserJoinedDto,
  UserLeftDto,
} from './translation.dto';
import { ServiceError } from '../errors/service.error';

@WebSocketGateway({ transports: ['websocket'] })
export class TranslationGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly client_lang_map = new Map<string, string | null>();

  constructor(private readonly service: TranslationService) {}

  handleConnection(@ConnectedSocket() client: Socket): any {
    this.client_lang_map.set(client.id, null);
    this.server.to(client.id).emit(SERVER_EVENT.Connected, { id: client.id });
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    this.client_lang_map.delete(client.id);
    this.server
      .to(client.id)
      .emit(SERVER_EVENT.Disconnected, { id: client.id });
  }

  @SubscribeMessage(CLIENT_EVENT.ListRooms)
  async listRooms(@ConnectedSocket() client: Socket) {
    const rooms = this.listServerRooms();
    this.server.to(client.id).emit(SERVER_EVENT.ListRooms, { rooms });
  }

  @SubscribeMessage(CLIENT_EVENT.ListClients)
  listClients(@ConnectedSocket() client: Socket) {
    const roomCode = this.getClientCurrentRoom(client);
    if (!roomCode) {
      this.server
        .to(client.id)
        .emit(SERVER_EVENT.ServiceError, ServiceError.NO_ROOM());
    }
    const clientIds = this.getClientIdsInRoom(roomCode);
    this.server.to(client.id).emit(SERVER_EVENT.ListClients, clientIds);
  }

  @SubscribeMessage(CLIENT_EVENT.JoinRoom)
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomCode, languageCode }: JoinRoomDto,
  ): Promise<void> {
    const existingRoom = this.getClientCurrentRoom(client);
    if (existingRoom) {
      client.leave(existingRoom);
      const dto: UserLeftDto = {
        id: client.id,
        roomCode: existingRoom,
      };
      this.server.to(existingRoom).emit(SERVER_EVENT.UserLeft, dto);
    }
    client.join(roomCode);
    this.client_lang_map.set(client.id, languageCode);
    const dto: UserJoinedDto = {
      id: client.id,
      languageCode,
      roomCode,
    };
    this.server.to(roomCode).emit(SERVER_EVENT.UserJoined, dto);
  }

  @SubscribeMessage(CLIENT_EVENT.LeaveRoom)
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() username,
  ) {
    const roomCode = this.getClientCurrentRoom(client);
    if (roomCode) {
      client.leave(roomCode);
      const dto: UserLeftDto = {
        id: client.id,
        roomCode,
      };
      this.server.to(roomCode).emit(SERVER_EVENT.UserLeft, dto);
    }
  }

  @SubscribeMessage(CLIENT_EVENT.VoiceRequest)
  async speechToSpeech(
    @ConnectedSocket() client: Socket,
    @MessageBody() { audio }: SpeechToSpeechDto,
  ) {
    const roomCode = this.getClientCurrentRoom(client);
    if (!roomCode) {
      this.server
        .to(client.id)
        .emit(SERVER_EVENT.ServiceError, ServiceError.NO_ROOM());
    }
    const fromLang = this.client_lang_map.get(client.id);
    if (!fromLang) {
      this.server
        .to(client.id)
        .emit(
          SERVER_EVENT.ServiceError,
          ServiceError.LANGUAGE_CODE_NOT_FOUND(),
        );
    }
    // STT source audio
    const alternatives = await this.service.speechToText(audio, fromLang);
    const inputText = alternatives[0].transcript;
    // translate to clients except self
    const targetIds = this.getClientIdsInRoom(roomCode).filter(
      (id) => id !== client.id,
    );
    for (const targetId of targetIds) {
      const toLang = this.client_lang_map.get(targetId);
      if (!toLang) continue;
      const translatedText = await this.service.translateText(
        inputText,
        toLang,
      );
      this.service.textToSpeech(translatedText, toLang).then(([content]) => {
        this.server.emit(SERVER_EVENT.VoiceResponse, content);
      });
    }
  }

  /**
   * Private helper functions
   * */
  private getClientCurrentRoom(client: Socket) {
    return Object.keys(client.rooms).filter((room) => room !== client.id)[0];
  }

  private listServerRooms() {
    const clientIds = this.clientIdsSet();
    return Object.keys(this.server.sockets.adapter.rooms).filter(
      (room) => !clientIds.has(room),
    );
  }

  private clientIdsSet() {
    return new Set(this.client_lang_map.keys());
  }

  getClientIdsInRoom(roomCode: string) {
    return Object.keys(this.server.sockets.adapter.rooms[roomCode].sockets);
  }
}
