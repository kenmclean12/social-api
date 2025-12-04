import { plainToInstance } from 'class-transformer';

export function convertToResponseDto<T>(
  dto: new (...args: any[]) => T,
  data: any,
): T {
  return plainToInstance(dto, data, { excludeExtraneousValues: true });
}
