export interface User {
    id: string;
    name: string;
    picture: string;
    email?: string;
    token?: string;
    action?: string;
    createdAt?: number;
}

export interface UserListElm {
    id: string;
    token: string;
}

export interface Message {
    id: string;
    body: string;
    sentAt: number;
    user?: User;
}    

export interface MessageFCM {
    id: string;
    body: string;
    sentAt: string;
    user?: string;
    action?: string;
}    
