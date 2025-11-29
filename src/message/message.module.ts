import { Module } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
