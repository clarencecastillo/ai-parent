import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { HttpClient } from '@angular/common/http';
import { Contact, ContactService } from './contact.service';
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

  private readonly PREFIXED_MESSAGES: Message[] = [
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

  private readonly DELAY_TIME = 500;

  constructor(
    private http: HttpClient,
    private socket: Socket,
    private translatorService: TranslatorService,
    private contactService: ContactService,
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

    // this.ngf.clear();
  }

  public async getStoredConversation(id: string): Promise<Conversation> {
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
    conversation.lastMessageContentPreview = message.prefix + message.content;
    conversation.lastMessageTime = message.time;
    await this.storeConversation(conversation);

    this.notificationSubject.next({
      conversationId: conversationId,
      message: message
    });
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

  private async startConversation(id: string) {
    await this.http.post<{ status: string, id: string }>('http://localhost:8000/api/chat', {
      id: id
    }).toPromise();
  }

  private deleteConversation(id: string) {
    return this.http.delete<{ status: string }>(`http://localhost:8000/api/chat/${id}`).toPromise();
  }

  private async buildConversation(contact: Contact): Promise<Conversation> {
    const translator = this.translatorService.getTranslator(contact.persona);
    const namePrompt = translator.general('prompt_name', { name: contact.name });
    const namePromptMessage = this.buildMessage(namePrompt, 'received');

    const conversation = {
      contact,
      name: null,
      id: contact.id,
      messages: [
        ...this.PREFIXED_MESSAGES,
        namePromptMessage
      ],
      lastMessageTime: namePromptMessage.time,
      lastMessageContentPreview: namePromptMessage.content,
      started: false
    };

    await this.storeConversation(conversation);
    return conversation;
  }

  public async getConversation(contact: Contact): Promise<Conversation> {
    const conversation = await this.getStoredConversation(contact.id);

    if (conversation) {
      return conversation;
    }

    return this.buildConversation(contact);
  }

  private async resetConversation(id: string) {
    await this.deleteConversation(id);
    const conversation = await this.getStoredConversation(id);
    conversation.name = null;
    conversation.started = false;
    await this.storeConversation(conversation);
  }

  public async sendMessage(conversationId: string, content: string): Promise<Message> {

    const conversation = await this.ngf.getItem<Conversation>(conversationId);
    const translator = this.translatorService.getTranslator(conversation.contact.persona);
    const message = this.buildMessage(content, 'sent');
    let messageBack: { content: string, prefix: string } = undefined;

    if (!conversation.name) {
      conversation.name = content;
      await this.storeConversation(conversation);
      console.log(`[${conversationId}] name set: ${content}`);

      messageBack = {
        content: translator.general('greet', { name: content }),
        prefix: ''
      };
    }

    content = content.toLocaleLowerCase();
    if (!conversation.started) {
      if (content === 'yes') {
        await this.startConversation(conversationId);
        console.log(`[${conversationId}] conversation started`);

        conversation.started = true;
        await this.storeConversation(conversation);

        this.socket.emit("message", conversationId + ':start');
      }
    } else {
      if (['yes', 'no'].includes(content)) {
        this.socket.emit("message", conversationId + ':' + content);
      } else if (content === 'reset') {
        await this.resetConversation(conversationId);

        const contact = conversation.contact;
        const translator = this.translatorService.getTranslator(contact.persona);
        const namePrompt = translator.general('prompt_name', { name: contact.name });

        messageBack = {
          content: namePrompt,
          prefix: translator.general('reset') + ' '
        };
      } else {

        console.log(`[${conversationId}] invalid reply: ${content}`);
        const lastReceivedMessage = conversation.messages
          .slice().reverse().find(m => m.type === 'message-received');

        messageBack = {
          content: lastReceivedMessage.content,
          prefix: translator.error() + ' '
        };
      }
    }
    
    if (messageBack) {

      // simulate waiting
      setTimeout(() => {
        this.receiveMessage(conversationId, messageBack.content, messageBack.prefix);
      }, this.DELAY_TIME);
    }

    await this.addMessage(conversationId, message);
    return message;
  }

  public async getConversationPreviews(contacts: Contact[] = this.contactService.getContacts()): Promise<ConversationPreview[]> {
    return Promise.all(contacts.map(contact => this.getConversation(contact)
      .then(c => ({
        id: c.id,
        contact: c.contact,
        lastMessageContentPreview: c.lastMessageContentPreview,
        lastMessageTime: c.lastMessageTime
      }))
    ));
  }

}

export type ConversationPreview = {
  id: string;
  contact: Contact;
  lastMessageContentPreview: string;
  lastMessageTime: number;
}

export type Notification = {
  conversationId: string;
  message: Message;
}

export type MessageType = 'message-sent' | 'message-received' | 'date' | 'warning';

export type Message = {
  id: string;
  content: string;
  prefix: string;
  time: number;
  type: MessageType;
}

export type Conversation = ConversationPreview & {
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
