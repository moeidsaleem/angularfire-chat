import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private afs: AngularFirestore) { }


  public currentUser
  public chat;
  conversationId;
  otherUser;


  createUser(uid, data) {
    return this.afs.doc('users/'+uid).set({
      uid: uid,
      name: data.name,
      email: data.email
    })
  }

  updateUser(id, data) {
    return this.afs.doc('users/' + id).update(data);
  }



  setCurrentUser(uid) {
    localStorage.setItem('uid', uid)
    this.afs.doc('users/' + uid).valueChanges().subscribe(resp => {
      this.currentUser = resp;
    }, err => { console.log('error', err) })
  }

  getCurrentUser() {
    return this.afs.doc('users/' + localStorage.getItem('uid')).valueChanges();
  }


  /* USERS */


  public getUsers() {
    return this.afs.collection<any>('users').snapshotChanges();
  }



 public selectUser(user) {
    // user tapped. 
    if(this.currentUser){
      if(!this.currentUser.conversations){
        this.currentUser.conversations = []
      }
    let find =this.currentUser.conversations.find(item => item.uid == user.uid);
    if (find) {
      //means that already have talked to the user before..
      console.log('found it', find);
     return  this.getChat(find.chatId);




    } else if (!find) {
      //first time talking to the user 
      let chatId = this.afs.createId();
      this.afs.doc('conversations/' + chatId).set({
        timestamp: new Date(),
        senderId: this.currentUser.uid,
        senderName: this.currentUser.name,
        chatId: chatId,
        messages: []
      }).then((data) => {
        this.currentUser.conversations.push({
          uid: user.uid,
          name: user.name,
          chatId: chatId,
          timestamp: new Date()
        })
        this.afs.doc('users/' + this.currentUser.uid).update(this.currentUser);
        //Also updating other user profile
        console.log('userId',user.uid)
        this.afs.doc('users/' + user.uid).valueChanges().subscribe(d => {
          this.otherUser = d;
          console.log('other-user', d)
          if(this.otherUser){

          }
            this.otherUser.conversations.push({
              timestamp: new Date(),
              uid: this.currentUser.uid,
              name: this.currentUser.name,
              chatId: chatId
            });
            this.afs.doc('users/' + user.uid).update(this.otherUser);
        });
      })
    }

         
  }else{
    console.log('c')
  }


  }



  getChat(chatId){
   return this.afs.collection('conversations', ref=> ref.where('chatId','==',chatId)).valueChanges()
  }


sendMessageg(chatId, messages){
  return this.afs.doc('conversations/'+ chatId).update({messages:messages})
}


  sendMessage(message) {
      this.chat.messages.push({
        senderId: this.currentUser.uid,
        content: message,
        senderName: this.currentUser.name,
        timestamp: new Date()
      });
      this.afs.doc('conversations/' + this.conversationId).update({ messages: this.chat.messages });

    }
  

  pushMessage(msg) {

  }



}
