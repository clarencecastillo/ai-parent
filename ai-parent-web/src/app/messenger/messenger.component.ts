import { Component, OnInit } from '@angular/core';
import { Conversation, MessageService, ConversationPreview } from '../message.service';
import { Moment } from 'moment';

@Component({
  selector: 'tcs-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.scss']
})
export class MessengerComponent implements OnInit {

  conversations: ConversationPreview[];
  userAvatarUrl = 'https://avatars0.githubusercontent.com/u/5035728?s=400&u=544ea1899a8854498922c8bce153c83a31182be5&v=4';
  selectedConversation: Conversation;

  input: string;

  constructor(
    private messageService: MessageService
  ) {

    this.initConversations();

    this.messageService.notification.subscribe(async notification => {

      const { conversationId, message } = notification;

      const conversationPreview = this.conversations.find(c => c.id === conversationId);
      conversationPreview.lastMessageContentPreview = message.prefix + message.content;
      conversationPreview.lastMessageTime = message.time;

      this.conversations = [
        conversationPreview,
        ...this.conversations.filter(c => c.id !== conversationId)
      ];

      if (!this.selectedConversation || this.selectedConversation.id !== conversationId) {
        return;
      }

      this.selectedConversation.messages.push(message);

      setTimeout(() => {
        const messageElement = document.querySelector('#' + message.id);
        messageElement.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  ngOnInit(): void {
  }

  async initConversations() {
    this.conversations = await this.messageService.getConversationPreviews();
  }

  timeFormatter(m: Moment) {
    if (m.isSame(new Date(), 'day')) {
      return m.format('HH:mm');
    } else {
      return m.fromNow();
    }
  }

  async sendInput() {
    const content = this.input.trim();
    if (!this.input.trim()) {
      return;
    }

    this.input = "";
    await this.messageService.sendMessage(this.selectedConversation.id, content);
  }

  async selectConversation(id: string) {
    this.selectedConversation = await this.messageService.getStoredConversation(id);
    const lastMessage = this.selectedConversation.messages[this.selectedConversation.messages.length - 1];

    setTimeout(() => {
      const messageElement = document.querySelector('#' + lastMessage.id);
      messageElement.scrollIntoView();
    });

  }

}
