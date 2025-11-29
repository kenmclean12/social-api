import { ConflictException } from '@nestjs/common';
import { Repository, ObjectLiteral } from 'typeorm';

export async function assertUnique<T extends ObjectLiteral>(
  repo: Repository<T>,
  field: keyof T,
  entityName: string,
  value: any,
) {
  const existing = await repo.findOne({
    where: { [field]: value } as any,
  });

  if (existing) {
    const message = `${entityName} with ${String(field)} "${value}" already exists`;
    throw new ConflictException(message);
  }
}
