export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  type: 'GROUP' | 'DM';
  wallpaper?: string;
  emoji?: string;
  createdAt: string;
  members?: RoomMember[];
  lastMessage?: Message;
  unreadCount?: number;
}

export interface RoomMember {
  id: string;
  userId: string;
  roomId: string;
  unreadCount: number;
  user: User;
}

export interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'SYSTEM';
  senderId: string;
  roomId: string;
  createdAt: string;
  editedAt?: string;
  sender: User;
  reads?: MessageRead[];
  reactions?: Reaction[];
  tempId?: string;
  isPending?: boolean;
  isFailed?: boolean;
}

export interface MessageRead {
  id: string;
  messageId: string;
  userId: string;
  readAt: string;
}

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  messageId: string;
  user?: User;
}

export interface TypingUser {
  userId: string;
  username: string;
  roomId: string;
}
