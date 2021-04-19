export enum CLIENT_EVENT {
  JoinRoom = 'JoinRoom',
  LeaveRoom = 'LeaveRoom',
  ListRooms = 'ListRooms',
  ListClients = 'ListClients',
  VoiceRequest = 'VoiceRequest',
}

export enum SERVER_EVENT {
  Connected = 'Connected',
  Disconnected = 'Disconnected',
  ServiceError = 'ServiceError',
  UserJoined = 'UserJoined',
  UserLeft = 'UserLeft',
  ListRooms = 'ListRooms',
  ListClients = 'ListClients',
  VoiceResponse = 'VoiceResponse',
}
