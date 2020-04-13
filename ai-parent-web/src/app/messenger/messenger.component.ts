import { Component, OnInit } from '@angular/core';
import { Conversation, MessageService, Message } from '../message.service';
import { Moment } from 'moment';
import { ContactService } from '../contact.service';

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
    this.contactService.getContacts().forEach(async contact => {
      const conversation = await this.messageService.startConversation(contact);
      this.conversations.push(conversation);
    });
  }

  ngOnInit(): void {
  }

  timeFormatter(m: Moment) {
    if (m.isSame(new Date(), 'day')) {
      return m.format('HH:mm');
    } else {
      return m.fromNow();
    }
  }

  send(message: string) {
    this.messageService.sendMessage(this.selectedConversation.id, message);
  }

  selectConversation(id: string) {
    this.selectedConversation = this.conversations.find(c => c.id === id);
  }

}
