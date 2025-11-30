import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsNumber, IsEnum } from 'class-validator';

export enum AlterParticipantType {
  ADD = 'add',
  REMOVE = 'remove',
}

export class AlterParticipantsDto {
  @IsNumber()
  @ApiProperty({ example: 1 })
  initiatorId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @ApiProperty({ example: [2, 3] })
  recipientIds: number[];

  @IsEnum(AlterParticipantType)
  @ApiProperty({
    enum: AlterParticipantType,
    description: 'Add or remove participants',
  })
  alterType: AlterParticipantType;
}
