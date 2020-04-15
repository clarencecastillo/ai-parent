import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { HttpClient } from '@angular/common/http';
import { Contact } from './contact.service';
import { Observable, Subject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import * as i18n from 'roddeh-i18n';
import * as standardEnglishPersona from '../assets/personas/standard-en.json';
import * as standardChinesePersona from '../assets/personas/standard-zh.json';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private conversations: Map<string, Conversation>;

  private notificationSubject: Subject<Notification>;
  public readonly notification: Observable<Notification>;

  private translations = {
    'en': {
      'chat': i18n.create({ values: standardEnglishPersona.conversation }),
      'report': i18n.create({ values: standardEnglishPersona.report })
    },
    'zh': {
      'chat': i18n.create({ values: standardChinesePersona.conversation }),
      'report': i18n.create({ values: standardChinesePersona.report })
    }
  };

  private SYMBOLS = {
    'yes': '✅',
    'no': '❌'
  };

  constructor(
    private http: HttpClient,
    private socket: Socket
  ) {

    this.notificationSubject = new Subject();
    this.notification = this.notificationSubject.asObservable();
    this.conversations = new Map();

    this.socket.fromEvent('message')
      .subscribe(async (data: string) => {
        const [id, content] = data.split(':');
        const translator = this.translations[this.conversations.get(id).contact.persona];
        const message = await this.receiveMessage(id, translator.chat(content));
        this.notificationSubject.next({
          conversationId: id,
          messageId: message.id
        });
      });
  }

  private generateMessageId() {
    return 'msg' + uuidv4().split('-').join('');
  }

  public getConversations(): Conversation[] {
    return [...this.conversations.values()];
  }

  private async receiveMessage(conversationId: string, content: string) {
    const conversation = this.conversations.get(conversationId);
    if (conversation.messages.length === 0) {
      conversation.messages.push({
        id: this.generateMessageId(),
        content: null,
        time: new Date().valueOf(),
        type: 'date',
        from: null
      },
      {
        id: this.generateMessageId(),
        content: null,
        time: null,
        type: 'warning',
        from: null
      });
    }

    if (content === 'report') {
      content = await this.getReport(conversationId);
    }

    const message = this.addMessage(conversationId, content, 'message', conversation.contact.userName);
    conversation.lastMessageContentPreview = content;
    conversation.lastMessageTime = message.time;
    return message;
  }

  private async getReport(conversationId: string): Promise<string> {
    const translator = this.translations[this.conversations.get(conversationId).contact.persona];
    const data = await this.http.get<Activity[]>(`http://localhost:8000/api/chat/${conversationId}/report`)
      .toPromise();
   
    let report = [`Here's a summary of what you did in school today:`];
    data.forEach(activity => {
      report.push(`\n${this.SYMBOLS[activity.answer]} ${translator.report(activity.name)}:`);
      if (activity.answer === 'no') {
        report.push(`\t<nothing>`);
        return;
      }
      activity.targets.forEach(target => {
        report.push(`\t${this.SYMBOLS[target.answer]} ${translator.report(target.name)}`);
        target.feedbacks.forEach(feedback => {
          report.push(`\t\t${this.SYMBOLS[feedback.answer]} ${translator.report(feedback.name)}`);
        });
      });
    });
    return report.join('\n');
  }

  private addMessage(conversationId: string, content: string, type: MessageType, from: string) {
    const conversation = this.conversations.get(conversationId);
    const message = {
      id: this.generateMessageId(),
      time: new Date().valueOf(),
      content,
      type,
      from
    };
    conversation.messages.push(message);
    return message;
  }

  public async startConversation(contact: Contact): Promise<Conversation> {
    return this.http.post<{ status: string, id: string }>('http://localhost:8000/api/chat', {
      id: contact.id
    }).toPromise().then(res => {
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

export type Notification = {
  conversationId: string;
  messageId: string;
}

export type MessageType = 'message' | 'date' | 'warning';

export type Message = {
  id: string;
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

export type Feedback = {
  name: string;
  answer: string;
}

export type Target = {
  name: string;
  answer: string;
  feedbacks: Feedback[];
}

export type Activity = {
  name: string;
  answer: string;
  targets: Target[];
}
