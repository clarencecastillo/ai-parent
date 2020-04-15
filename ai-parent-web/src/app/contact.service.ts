import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private contacts: Contact[] = [
    {
      id: 'leehsienloong',
      avatarUrl: '../assets/images/contacts/leehsienloong.jpeg',
      userName: 'Lee Hsien Loong 🇸🇬🇸🇬🇸🇬',
      persona: 'en'
    },
    {
      id: 'xijinping',
      avatarUrl: '../assets/images/contacts/xijinping.jpg',
      userName: 'Xi Jinping🇨🇳',
      persona: 'zh'
    }
  ];

  constructor() { }

  public getContacts(): Readonly<Contact[]> {
    return this.contacts;
  }
}

export type Contact = {
  id: string;
  avatarUrl: string;
  userName: string;
  persona: string;
};
