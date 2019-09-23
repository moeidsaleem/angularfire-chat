import { Component, OnInit, OnDestroy } from '@angular/core';
import { HelperService } from '../services/helper/helper.service';
import { ApiService } from '../services/api/api.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import * as firebase from 'firebase'
// import undefined = require('firebase/empty-import');


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit,OnDestroy {
  title = 'chatapp';
  showFiller = false;
  users;
  public messages :Array<any> = []
  temp;
  showMessages= false;

  constructor(private helper:HelperService, private router:Router,
     public api:ApiService) { }
  showChat=true;
  ngOnInit() {

this.getAllUsers()
  }

/// Firebase Server Timestamp
get timestamp() {
  return firebase.firestore.FieldValue.serverTimestamp();
}

  getAllUsers(){
    console.log('uid', localStorage.getItem('uid'))
    this.api.setCurrentUser(localStorage.getItem('uid'))
    this.api.getUsers().pipe(
      map(actions => {
        return actions.map(a => {
          let data = a.payload.doc.data();
         // const id = a.payload.doc.id;
          //remove for conversations
          if(this.api.currentUser && 
            this.api.currentUser.conversations && this.api.currentUser.conversations.length > 0){
              let r= this.api.currentUser.conversations.filter(item=> item.uid == data.uid);
              if(r){
                //means we already have chatted with the guy, 
               return 
              }
          }


            return { ...data}
        });
      })
    ).subscribe(data=>{
      this.temp = data;
      console.log('temp-data', data)
   try{
    let index = this.temp.findIndex(i => i.uid == this.api.currentUser.uid);
    delete this.temp[index]
   }catch(e){console.log(e)}
      console.log('users==>>>>', this.temp)
      this.users = this.temp;
    })





  }



  getDate(d){
    let x=  new Date(d).toString();
    console.log('x')
    return x;
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
this.message = '';
  this.api.sendMessageg(this.message).then(()=>{
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
  this.api.clearData()
  this.router.navigate(['/login']).then(()=> this.helper.closeModal())
}


closeModal(){
  this.helper.closeModal()
}







/* FINAL CODE */
toggleMessages(){
  this.showMessages = !this.showMessages;
}


selectAUser(user){
try{
  this.helper.closeModal()
} catch(e){ console.log(e)}
console.log('Selecting a user')
  if(this.api.currentUser.conversations == undefined){
    this.api.currentUser.conversations = [];
    console.log('no currentUser.conversations')
  }
  console.log('currentUser',this.api.currentUser)
  let convo= [...this.api.currentUser.conversations];
  console.log('CONVO----------------', convo);
  let find = convo.find(item => item.uid == user.uid);
  if(find){
    console.log('chat found',find);
    this.api.getChat(find.chatId).subscribe(m=>{
      this.temp =m;
      this.api.chat = this.temp[0];
      console.log('values', this.api.chat);
      this.messages = this.api.chat.messages == undefined ? [] : this.api.chat.messages
      console.log('api.chat', this.messages)
      this.showMessages = true;

      return 

    })
    // this.api.chat = this.api.getCurrentChat(user.chatId)
  }else{
    console.log('adding-a-new-chat-since not found');
    this.api.addNewChat().then(()=>{
      this.api.addConvoToUser(user.uid, this.api.currentUser).then(()=>{
        this.api.addConvoToUser(this.api.currentUser.uid, user).then(()=>{

        })
        // this.api.getCurrentUser()

      })
    })
   
  }
}

sendAMessage(){
  console.log('ye chala sendamessage', this.message)
  if(this.message == ''){
    alert('Enter message');
    return
  }

  //push to local messages 
  let msg={
    senderId: this.api.currentUser.uid,
    senderName: this.api.currentUser.name,
    timestamp: new Date(),
    content: this.message
  };

  //empty message
  this.message = '';
 
  //update 
  this.messages.push(msg);
  console.log('list', this.messages);

  this.api.pushNewMessage(this.messages).then(()=>{
    console.log('sent')

  })


  
}


ngOnDestroy(){
  this.api.currentUser = null;
  this.users = null;
  // this.api.currentUser.name = '';
}

}
