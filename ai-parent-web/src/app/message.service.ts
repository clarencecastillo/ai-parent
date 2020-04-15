import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { HttpClient } from '@angular/common/http';
import { Contact } from './contact.service';
import { Observable, Subject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { TranslatorService, Translator } from './translator.service';
import { NgForage } from 'ngforage';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private notificationSubject: Subject<Notification>;
  public readonly notification: Observable<Notification>;

  private prefixedMessages: Message[] = [
    {
      id: 'date-alert',
      prefix: '',
      content: null,
      time: new Date().valueOf(),
      type: 'date'
    },
    {
      id: 'warning-alert',
      prefix: '',
      content: null,
      time: null,
      type: 'warning'
    }
  ];

  private SYMBOLS = {
    'yes': '✅',
    'no': '❌'
  };

  constructor(
    private http: HttpClient,
    private socket: Socket,
    private translatorService: TranslatorService,
    private ngf: NgForage
  ) {

    this.notificationSubject = new Subject();
    this.notification = this.notificationSubject.asObservable();

    this.socket.fromEvent('message')
      .subscribe(async (data: string) => {
        let [id, content, replyTo] = data.split(':');

        console.log(`[${id}] received: ${content}`);

        const contact = await this.getStoredConversation(id).then(c => c.contact);
        const translator = this.translatorService.getTranslator(contact.persona);

        let prefix = '';
        if (content === 'report') {
          content = await this.getReport(id, translator);
        } else {

          if (['yes', 'no'].includes(replyTo)) {
            prefix = translator.connector() + ' ';
          }

          content = translator.chat(content);
        }

        this.receiveMessage(id, content, prefix);
      });
  }

  private async getStoredConversation(id: string): Promise<Conversation> {
    return this.ngf.getItem<Conversation>(id);
  }

  private async storeConversation(conversation: Conversation) {
    await this.ngf.setItem<Conversation>(conversation.id, conversation);
  }

  private generateMessageId() {
    return 'msg' + uuidv4().split('-').join('');
  }

  private async receiveMessage(conversationId: string, content: string, prefix: string = '') {

    const message = this.buildMessage(content, 'received', prefix);
    this.addMessage(conversationId, message);

    this.notificationSubject.next({
      conversationId: conversationId,
      messageId: message.id
    });
  }

  private async getReport(conversationId: string, translator: Translator): Promise<string> {

    const data = await this.http.get<Activity[]>(`http://localhost:8000/api/chat/${conversationId}/report`)
      .toPromise();

    let report = [translator.general('summary')];
    data.forEach(activity => {
      report.push(`\n${this.SYMBOLS[activity.answer]} ${translator.report(activity.name)}:`);

      if (activity.answer === 'no') {
        report.push(`\t<${translator.general('nothing')}>`);
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

  private async addMessage(conversationId: string, message: Message) {
    const conversation = await this.getStoredConversation(conversationId);
    conversation.messages.push(message);
    conversation.lastMessageContentPreview = message.content;
    conversation.lastMessageTime = message.time;

    await this.storeConversation(conversation);
  }

  private buildMessage(content: string, type: 'received' | 'sent', prefix: string = ''): Message {
    return {
      id: this.generateMessageId(),
      prefix: prefix,
      content: content,
      time: new Date().valueOf(),
      type: type === 'received' ? 'message-received' : 'message-sent'
    };
  }

  public async getConversation(contact: Contact): Promise<Conversation> {
    const conversation = await this.getStoredConversation(contact.id);

    if (conversation) {
      return conversation;
    }

    return this.http.post<{ status: string, id: string }>('http://localhost:8000/api/chat', {
      id: contact.id
    }).toPromise().then(async res => {

      const translator = this.translatorService.getTranslator(contact.persona);
      const namePrompt = translator.general('prompt_name', { name: contact.name });
      const namePromptMessage = this.buildMessage(namePrompt, 'received');

      const conversation = {
        contact,
        name: null,
        id: contact.id,
        messages: [
          ...this.prefixedMessages,
          namePromptMessage
        ],
        lastMessageTime: namePromptMessage.time,
        lastMessageContentPreview: namePromptMessage.content,
        started: false
      };

      await this.storeConversation(conversation);
      return conversation;
    });
  }

  public async sendMessage(conversationId: string, content: string): Promise<Message> {
    const conversation = await this.ngf.getItem<Conversation>(conversationId);

    const translator = this.translatorService.getTranslator(conversation.contact.persona);

    const message = this.buildMessage(content, 'sent');
    this.addMessage(conversationId, message);

    if (!conversation.name) {
      conversation.name = content;
      console.log(`[${conversationId}] name set: ${content}`);
      const greeting = translator.general('greet', { name: content });
      this.receiveMessage(conversationId, greeting);
      return message;
    }

    if (!conversation.started) {

      if (content !== 'yes') {
        return message;
      }

      content = 'start';
      conversation.started = true;
      console.log(`[${conversationId}] conversation started`);
    } else if (!['yes', 'no'].includes(content)) {
      console.log(`[${conversationId}] invalid reply: ${content}`);

      const lastReceivedMessage = conversation.messages
        .slice().reverse().find(m => m.type === 'message-received');

      this.receiveMessage(conversationId, lastReceivedMessage.content, translator.error() + ' ');
      return message;
    }

    this.socket.emit("message", conversationId + ':' + content);
    return message;
  }

}

export type Notification = {
  conversationId: string;
  messageId: string;
}

export type MessageType = 'message-sent' | 'message-received' | 'date' | 'warning';

export type Message = {
  id: string;
  content: string;
  prefix: string;
  time: number;
  type: MessageType;
}

export type Conversation = {
  id: string;
  contact: Contact;
  lastMessageContentPreview: string;
  lastMessageTime: number;
  messages: Message[];
  name: string;
  started: boolean;
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
