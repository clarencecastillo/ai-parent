import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { HttpClient } from '@angular/common/http';
import { Contact } from './contact.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private conversations: Map<string, Conversation>;

  constructor(
    private http: HttpClient,
    private socket: Socket
  ) {

    this.conversations = new Map();

    this.socket.fromEvent('message')
      .subscribe((data: string) => {
        const [id, message] = data.split(':');
        this.receiveMessage(id, message);
      });
  }

  public getConversations(): Conversation[] {
    return [...this.conversations.values()];
  }

  private receiveMessage(conversationId: string, content: string) {
    const conversation = this.conversations.get(conversationId);
    if (conversation.messages.length === 0) {
      conversation.messages.push({
        content: null,
        time: new Date().valueOf(),
        type: 'date',
        from: null
      },
      {
        content: null,
        time: null,
        type: 'warning',
        from: null
      });
    }

    const message = this.addMessage(conversationId, content, 'message', conversation.contact.userName);
    conversation.lastMessageContentPreview = content;
    conversation.lastMessageTime = message.time;
  }

  private addMessage(conversationId: string, content: string, type: MessageType, from: string) {
    const conversation = this.conversations.get(conversationId);
    const message = {
      time: new Date().valueOf(),
      content,
      type,
      from
    };
    conversation.messages.push(message);
    return message;
  }

  public async startConversation(contact: Contact): Promise<Conversation> {
    return this.http.post<{ status: string, id: string }>('http://localhost:8000/api/chat', {})
      .toPromise().then(res => {
        const id = res.id;

        this.socket.emit('message', id + ':start');
        const conversation = {
          id,
          contact,
          messages: [],
          lastMessageTime: null,
          lastMessageContentPreview: null
        };
        this.conversations.set(id, conversation);
        return conversation;
      });
  }

  public sendMessage(conversationId: string, message: string) {
    this.socket.emit("message", conversationId + ':' + message);
    this.addMessage(conversationId, message, 'message', null);
  }
}

export type MessageType = 'message' | 'date' | 'warning';

export type Message = {
  content: string;
  time: number;
  type: MessageType;
  from: string;
}

export type Conversation = {
  id: string;
  contact: Contact;
  lastMessageContentPreview: string;
  lastMessageTime: number;
  messages: Message[];
}
