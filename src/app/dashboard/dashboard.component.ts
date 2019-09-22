import { Component, OnInit } from '@angular/core';
import { HelperService } from '../services/helper/helper.service';
import { ApiService } from '../services/api/api.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  title = 'chatapp';
  showFiller = false;
  users;
  messages=[];

  constructor(private helper:HelperService, private router:Router,
     public api:ApiService) { }
  showChat=true;
  ngOnInit() {

this.getAllUsers()
  }



  getAllUsers(){
    console.log('uid', localStorage.getItem('uid'))
    this.api.setCurrentUser(localStorage.getItem('uid'))
    this.api.getUsers().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    ).subscribe(data=>{
      this.users = data;
    })





  }



  getDate(d){
    return new Date(d).toLocaleDateString()
  }
  selectUser(user){
    console.log('user-selected',user );
    this.api.selectUser(user).subscribe(c=>{
      this.messages = this.api.chat.messages;
      console.log('m', c)
    })
  }



  message = '';

sendMessage(){
this.messages.push(this.message)
  this.api.sendMessageg(this.api.chat.chatId, this.messages).then(()=>{
    this.message ='';
  })

}

open(list){
  this.helper.openDialog(list)

}


logoutModal(c){
  this.helper.openDialog(c)
}

logout(){
  this.router.navigate(['/login']).then(()=> this.helper.closeModal())
}


closeModal(){
  this.helper.closeModal()
}



}
