export interface User {
    id: number; username: string; email: string;
    firstName: string; lastName: string; avatar: string;
    bio: string; role: string; createdAt: string; active: boolean;
}

export interface Post {
    id: number; text: string; image: string | null;
    authorId: number; authorName: string; avatar: string | null;
    likesAmount: number; commentAmount: number; createdAt: string;
}

export interface Comment {
    id: number; content: string; userId: number;
    username: string; userAvatar: string | null; createdAt: string;
}

export interface Message {
    id: number;
    senderId: number;
    senderName: string;
    senderAvatar: string | null;
    receiverId: number;
    content: string;
    timestamp: string;
    read: boolean;
}