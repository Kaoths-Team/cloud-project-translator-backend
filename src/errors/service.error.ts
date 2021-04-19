import { ERROR_CODE, ERROR_MESSAGE } from '../constants/error.enum';

export class ServiceError {
  public readonly code: number;
  public readonly message: string;

  constructor(statusCode: number, message: string) {
    this.code = statusCode;
    this.message = message;
  }

  public static NO_ROOM() {
    return new ServiceError(ERROR_CODE.NO_ROOM, ERROR_MESSAGE.NO_ROOM);
  }

  public static LANGUAGE_CODE_NOT_FOUND() {
    return new ServiceError(
      ERROR_CODE.LANGUAGE_CODE_NOT_FOUND,
      ERROR_MESSAGE.LANGUAGE_CODE_NOT_FOUND,
    );
  }
}
