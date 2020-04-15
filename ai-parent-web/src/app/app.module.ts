import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MessengerComponent } from './messenger/messenger.component';
import { MomentModule } from 'ngx-moment';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { HttpClientModule } from '@angular/common/http';
import { NgForage, InstanceFactory, NgForageConfig } from 'ngforage';
import { FormsModule } from '@angular/forms';

const webSocketConfig: SocketIoConfig = {
  url: 'http://localhost:8081'
};

@NgModule({
  declarations: [
    AppComponent,
    MessengerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MomentModule,
    SocketIoModule.forRoot(webSocketConfig),
    HttpClientModule,
    FormsModule
  ],
  providers: [
    {
      provide: NgForage,
      // @ts-ignore
      useFactory: (ngForageConfig: NgForageConfig) => new NgForage({}, new InstanceFactory(ngForageConfig)),
      deps: [NgForageConfig]
    }
  ],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule { }
