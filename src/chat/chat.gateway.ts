
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from "./room.service";

@WebSocketGateway()
export class ChatGateway implements OnGatewayDisconnect {
  constructor(private readonly roomService: RoomService) {}
  @WebSocketServer() server: Server;
  private connections = new Map<string, Socket>();

  handleDisconnect(client: Socket) {
    this.connections.forEach((socket, userId) => {
      if (socket === client) {
        this.connections.delete(userId);
        console.log(`Client disconnected: ${userId}`);
      }
    });
  }

  @SubscribeMessage('login')
  handleLogin(client: Socket, userId: string) {
    console.log(`Client logged in: ${userId}`);
    this.connections.set(userId, client);
    console.log('Current connections:', this.connections);
  }

  @SubscribeMessage('privateMessage')
  handlePrivateMessage(client: Socket, data: { senderId: string; receiverId: string; message: string }) {
    const { senderId, receiverId, message } = data;
    console.log('Received private message:', JSON.stringify(data));

    try {
      const receiverSocket = this.connections.get(receiverId);
      if (receiverSocket) {
        receiverSocket.emit('privateMessage', { senderId, message });
      } else {
        console.log(`User ${receiverId} is not online`);
      }
    } catch (error) {
      console.error('Error handling private message:', error);
    }
  }
  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, roomId: string) {
    console.log(`Client ${client.id} joined room ${roomId}`);
    
    this.roomService.joinRoom(client, roomId);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, roomId: string) {
    this.roomService.leaveRoom(client, roomId);
  }


@SubscribeMessage('sendMessageToRoom')
handleMessageToRoom(client: Socket, data: { roomId: string; message: string }) {
  const { roomId, message } = data;
  this.roomService.broadcastToRoom(roomId, 'newMessage', { sender: client.id, message },client.id, client);
}

}
