import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private contacts: Contact[] = [
    {
      id: '1',
      avatarUrl: 'https://lh3.googleusercontent.com/proxy/QBOB_NLA2DXvcI9XUHRy2z2uxbDWsZiAxU61lbBdi0LUVFIpGysGRsPQUqZVhLIRoIOE4W1cOljsTtSN_ED2XpA-stMm98jlA3THq2xbNkGo8ZoDbnM',
      userName: 'Lee Hsien Loong'
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
};
