import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class RoomService {

  private readonly rooms = new Map<string, Set<string>>();

  joinRoom(client: Socket, roomId: string) {
    client.join(roomId);
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set<string>());
    }
    this.rooms.get(roomId)?.add(client.id); 
  }

  leaveRoom(client: Socket, roomId: string) {
    client.leave(roomId);
    const clientsInRoom = this.rooms.get(roomId);
    if (clientsInRoom) {
      clientsInRoom.delete(client.id);
      if (clientsInRoom.size === 0) {
        this.rooms.delete(roomId); 
      }
    }
  }
  broadcastToRoom(roomId: string, event: string, data: any, senderId: string,client:any) {
    const clientsInRoom = this.rooms.get(roomId);
    if (clientsInRoom) {
      clientsInRoom.forEach(clientId => {
        console.log(clientsInRoom);
        if (clientId !== senderId) { 
          console.log(clientsInRoom);
          client.to(clientId).emit(event, data);
        }
      });
    }
  }
  }
