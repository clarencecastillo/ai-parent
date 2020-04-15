import { Component, OnInit } from '@angular/core';
import { Conversation, MessageService } from '../message.service';
import { Moment } from 'moment';
import { ContactService, Contact } from '../contact.service';

@Component({
  selector: 'tcs-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.scss']
})
export class MessengerComponent implements OnInit {

  userAvatarUrl = 'https://avatars0.githubusercontent.com/u/5035728?s=400&u=544ea1899a8854498922c8bce153c83a31182be5&v=4';
  conversations: Conversation[] = [];
  selectedConversation: Conversation;

  constructor(
    private messageService: MessageService,
    private contactService: ContactService
  ) {

    this.initConversations(this.contactService.getContacts());

    this.messageService.notification.subscribe(notification => {

      if (!this.selectedConversation) {
        return;
      }

      setTimeout(() => {
        const messageElement = document.querySelector('#' + notification.messageId);
        messageElement.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  ngOnInit(): void {
  }

  async initConversations(contacts: Contact[]) {
    this.conversations = await Promise.all(contacts
      .map(contact => this.messageService.getConversation(contact)));
  }

  timeFormatter(m: Moment) {
    if (m.isSame(new Date(), 'day')) {
      return m.format('HH:mm');
    } else {
      return m.fromNow();
    }
  }

  async send(content: string) {
    const message = await this.messageService.sendMessage(this.selectedConversation.id, content);
    setTimeout(() => {
      const messageElement = document.querySelector('#' + message.id);
      messageElement.scrollIntoView({ behavior: 'smooth' });
    });
  }

  selectConversation(id: string) {
    this.selectedConversation = this.conversations.find(c => c.id === id);
  }

}
