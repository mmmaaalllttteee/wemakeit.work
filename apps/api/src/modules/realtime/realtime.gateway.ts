import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards } from '@nestjs/common';
import { PresenceService, User } from './presence.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userName?: string;
  orgId?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly presenceService: PresenceService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract auth token from handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      // TODO: Validate JWT token and extract user info
      // For now, we'll assume token validation is done elsewhere
      // In production, decode JWT here: const decoded = this.jwtService.verify(token);

      // Mock user info (in production, extract from JWT)
      client.userId = 'user-id'; // decoded.userId
      client.userName = 'User'; // decoded.name
      client.orgId = 'org-id'; // decoded.orgId

      console.log(`Client connected: ${client.id} (User: ${client.userId})`);

      // Join user's organization room
      if (client.orgId) {
        client.join(`org:${client.orgId}`);
      }

      // Notify presence
      await this.presenceService.userConnected(client.userId, client.userName, client.orgId);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      console.log(`Client disconnected: ${client.id} (User: ${client.userId})`);
      await this.presenceService.userDisconnected(client.userId);

      // Broadcast user left
      this.server.to(`org:${client.orgId}`).emit('user:left', {
        userId: client.userId,
        userName: client.userName,
      });
    }
  }

  // ==================== Project/Board Rooms ====================

  @SubscribeMessage('join:project')
  async handleJoinProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { projectId: string },
  ): Promise<{ success: boolean; users: User[] }> {
    const room = `project:${data.projectId}`;
    client.join(room);

    // Get current users in project
    const users = await this.presenceService.getProjectUsers(data.projectId);

    // Notify others
    client.to(room).emit('user:joined:project', {
      userId: client.userId,
      userName: client.userName,
      projectId: data.projectId,
    });

    return { success: true, users };
  }

  @SubscribeMessage('leave:project')
  handleLeaveProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { projectId: string },
  ) {
    const room = `project:${data.projectId}`;
    client.leave(room);

    client.to(room).emit('user:left:project', {
      userId: client.userId,
      userName: client.userName,
      projectId: data.projectId,
    });

    return { success: true };
  }

  @SubscribeMessage('join:board')
  async handleJoinBoard(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { boardId: string },
  ): Promise<{ success: boolean; users: User[] }> {
    const room = `board:${data.boardId}`;
    client.join(room);

    await this.presenceService.joinBoard(client.userId, data.boardId);

    const users = await this.presenceService.getBoardUsers(data.boardId);

    client.to(room).emit('user:joined:board', {
      userId: client.userId,
      userName: client.userName,
      boardId: data.boardId,
    });

    return { success: true, users };
  }

  @SubscribeMessage('leave:board')
  async handleLeaveBoard(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { boardId: string },
  ) {
    const room = `board:${data.boardId}`;
    client.leave(room);

    await this.presenceService.leaveBoard(client.userId, data.boardId);

    client.to(room).emit('user:left:board', {
      userId: client.userId,
      userName: client.userName,
      boardId: data.boardId,
    });

    return { success: true };
  }

  // ==================== Board Updates ====================

  @SubscribeMessage('task:update')
  handleTaskUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { boardId: string; taskId: string; updates: any },
  ) {
    const room = `board:${data.boardId}`;

    client.to(room).emit('task:updated', {
      taskId: data.taskId,
      updates: data.updates,
      userId: client.userId,
      userName: client.userName,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @SubscribeMessage('task:move')
  handleTaskMove(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      boardId: string;
      taskId: string;
      fromColumnId: string;
      toColumnId: string;
      position: number;
    },
  ) {
    const room = `board:${data.boardId}`;

    client.to(room).emit('task:moved', {
      taskId: data.taskId,
      fromColumnId: data.fromColumnId,
      toColumnId: data.toColumnId,
      position: data.position,
      userId: client.userId,
      userName: client.userName,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @SubscribeMessage('task:create')
  handleTaskCreate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { boardId: string; task: any },
  ) {
    const room = `board:${data.boardId}`;

    client.to(room).emit('task:created', {
      task: data.task,
      userId: client.userId,
      userName: client.userName,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @SubscribeMessage('task:delete')
  handleTaskDelete(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { boardId: string; taskId: string },
  ) {
    const room = `board:${data.boardId}`;

    client.to(room).emit('task:deleted', {
      taskId: data.taskId,
      userId: client.userId,
      userName: client.userName,
      timestamp: new Date(),
    });

    return { success: true };
  }

  // ==================== Moodboard Collaboration ====================

  @SubscribeMessage('join:moodboard')
  async handleJoinMoodboard(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { moodboardId: string },
  ): Promise<{ success: boolean; users: User[] }> {
    const room = `moodboard:${data.moodboardId}`;
    client.join(room);

    await this.presenceService.joinMoodboard(client.userId, data.moodboardId);

    const users = await this.presenceService.getMoodboardUsers(data.moodboardId);

    client.to(room).emit('user:joined:moodboard', {
      userId: client.userId,
      userName: client.userName,
      moodboardId: data.moodboardId,
    });

    return { success: true, users };
  }

  @SubscribeMessage('leave:moodboard')
  async handleLeaveMoodboard(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { moodboardId: string },
  ) {
    const room = `moodboard:${data.moodboardId}`;
    client.leave(room);

    await this.presenceService.leaveMoodboard(client.userId, data.moodboardId);

    client.to(room).emit('user:left:moodboard', {
      userId: client.userId,
      userName: client.userName,
      moodboardId: data.moodboardId,
    });

    return { success: true };
  }

  @SubscribeMessage('cursor:move')
  handleCursorMove(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { moodboardId: string; x: number; y: number },
  ) {
    const room = `moodboard:${data.moodboardId}`;

    client.to(room).emit('cursor:moved', {
      userId: client.userId,
      userName: client.userName,
      x: data.x,
      y: data.y,
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('item:update')
  handleItemUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { moodboardId: string; itemId: string; updates: any },
  ) {
    const room = `moodboard:${data.moodboardId}`;

    client.to(room).emit('item:updated', {
      itemId: data.itemId,
      updates: data.updates,
      userId: client.userId,
      userName: client.userName,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @SubscribeMessage('item:lock')
  handleItemLock(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { moodboardId: string; itemId: string },
  ) {
    const room = `moodboard:${data.moodboardId}`;

    client.to(room).emit('item:locked', {
      itemId: data.itemId,
      userId: client.userId,
      userName: client.userName,
    });

    return { success: true };
  }

  @SubscribeMessage('item:unlock')
  handleItemUnlock(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { moodboardId: string; itemId: string },
  ) {
    const room = `moodboard:${data.moodboardId}`;

    client.to(room).emit('item:unlocked', {
      itemId: data.itemId,
      userId: client.userId,
      userName: client.userName,
    });

    return { success: true };
  }

  // ==================== Typing Indicators ====================

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { resourceType: string; resourceId: string },
  ) {
    const room = `${data.resourceType}:${data.resourceId}`;

    client.to(room).emit('user:typing:start', {
      userId: client.userId,
      userName: client.userName,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { resourceType: string; resourceId: string },
  ) {
    const room = `${data.resourceType}:${data.resourceId}`;

    client.to(room).emit('user:typing:stop', {
      userId: client.userId,
      userName: client.userName,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
    });
  }

  // ==================== Public Methods for Other Services ====================

  /**
   * Broadcast notification to specific user
   */
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  /**
   * Broadcast event to organization
   */
  broadcastToOrganization(orgId: string, event: string, data: any) {
    this.server.to(`org:${orgId}`).emit(event, data);
  }

  /**
   * Broadcast event to project
   */
  broadcastToProject(projectId: string, event: string, data: any) {
    this.server.to(`project:${projectId}`).emit(event, data);
  }

  /**
   * Broadcast event to board
   */
  broadcastToBoard(boardId: string, event: string, data: any) {
    this.server.to(`board:${boardId}`).emit(event, data);
  }
}
