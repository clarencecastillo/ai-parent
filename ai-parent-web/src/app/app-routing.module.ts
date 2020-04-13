import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MessengerComponent } from './messenger/messenger.component';


const routes: Routes = [
  {
    path: '**',
    component: MessengerComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
