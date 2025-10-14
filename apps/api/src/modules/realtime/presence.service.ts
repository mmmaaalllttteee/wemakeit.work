import { Injectable } from '@nestjs/common';

export interface User {
  userId: string;
  userName: string;
  connectedAt: Date;
  lastSeen: Date;
}

interface UserPresence extends User {
  orgId: string;
  boards: string[];
  moodboards: string[];
  projects: string[];
}

@Injectable()
export class PresenceService {
  private users: Map<string, UserPresence> = new Map();

  /**
   * User connected to WebSocket
   */
  async userConnected(userId: string, userName: string, orgId: string): Promise<void> {
    this.users.set(userId, {
      userId,
      userName,
      orgId,
      connectedAt: new Date(),
      lastSeen: new Date(),
      boards: [],
      moodboards: [],
      projects: [],
    });
  }

  /**
   * User disconnected from WebSocket
   */
  async userDisconnected(userId: string): Promise<void> {
    this.users.delete(userId);
  }

  /**
   * Update user's last seen timestamp
   */
  updateLastSeen(userId: string): void {
    const user = this.users.get(userId);
    if (user) {
      user.lastSeen = new Date();
    }
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.users.has(userId);
  }

  /**
   * Get all online users in organization
   */
  getOnlineUsers(orgId: string): User[] {
    const users: User[] = [];
    this.users.forEach((user) => {
      if (user.orgId === orgId) {
        users.push({
          userId: user.userId,
          userName: user.userName,
          connectedAt: user.connectedAt,
          lastSeen: user.lastSeen,
        });
      }
    });
    return users;
  }

  // ==================== Board Presence ====================

  /**
   * User joined a board
   */
  async joinBoard(userId: string, boardId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user && !user.boards.includes(boardId)) {
      user.boards.push(boardId);
      user.lastSeen = new Date();
    }
  }

  /**
   * User left a board
   */
  async leaveBoard(userId: string, boardId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.boards = user.boards.filter((id) => id !== boardId);
      user.lastSeen = new Date();
    }
  }

  /**
   * Get all users currently viewing a board
   */
  async getBoardUsers(boardId: string): Promise<User[]> {
    const users: User[] = [];
    this.users.forEach((user) => {
      if (user.boards.includes(boardId)) {
        users.push({
          userId: user.userId,
          userName: user.userName,
          connectedAt: user.connectedAt,
          lastSeen: user.lastSeen,
        });
      }
    });
    return users;
  }

  // ==================== Moodboard Presence ====================

  /**
   * User joined a moodboard
   */
  async joinMoodboard(userId: string, moodboardId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user && !user.moodboards.includes(moodboardId)) {
      user.moodboards.push(moodboardId);
      user.lastSeen = new Date();
    }
  }

  /**
   * User left a moodboard
   */
  async leaveMoodboard(userId: string, moodboardId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.moodboards = user.moodboards.filter((id) => id !== moodboardId);
      user.lastSeen = new Date();
    }
  }

  /**
   * Get all users currently viewing a moodboard
   */
  async getMoodboardUsers(moodboardId: string): Promise<User[]> {
    const users: User[] = [];
    this.users.forEach((user) => {
      if (user.moodboards.includes(moodboardId)) {
        users.push({
          userId: user.userId,
          userName: user.userName,
          connectedAt: user.connectedAt,
          lastSeen: user.lastSeen,
        });
      }
    });
    return users;
  }

  // ==================== Project Presence ====================

  /**
   * Get all users currently in a project
   */
  async getProjectUsers(projectId: string): Promise<User[]> {
    const users: User[] = [];
    this.users.forEach((user) => {
      if (user.projects.includes(projectId)) {
        users.push({
          userId: user.userId,
          userName: user.userName,
          connectedAt: user.connectedAt,
          lastSeen: user.lastSeen,
        });
      }
    });
    return users;
  }

  /**
   * Get presence statistics
   */
  getStats(): {
    totalUsers: number;
    usersByOrg: Record<string, number>;
    activeBoards: number;
    activeMoodboards: number;
  } {
    const usersByOrg: Record<string, number> = {};
    const activeBoards = new Set<string>();
    const activeMoodboards = new Set<string>();

    this.users.forEach((user) => {
      usersByOrg[user.orgId] = (usersByOrg[user.orgId] || 0) + 1;
      user.boards.forEach((boardId) => activeBoards.add(boardId));
      user.moodboards.forEach((moodboardId) => activeMoodboards.add(moodboardId));
    });

    return {
      totalUsers: this.users.size,
      usersByOrg,
      activeBoards: activeBoards.size,
      activeMoodboards: activeMoodboards.size,
    };
  }
}
