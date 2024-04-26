import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { RoomService } from './chat/room.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ChatGateway,RoomService],
})
export class AppModule {}
