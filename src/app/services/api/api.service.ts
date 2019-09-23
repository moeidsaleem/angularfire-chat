import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { map, take,  } from 'rxjs/operators';
import { Observable, forkJoin } from 'rxjs';

export interface Chat{
  chatId:any,
  messages: Array<Message>
}

export interface Message{
  senderId:string,
  senderName:string,
  content:string, 
  timestamp?: Date
}
export interface UserConvo{
  uid:string,
  name:string,
  chatId:string,
  timestamp?:Date
}
export interface User{
  uid:string,
  name:string,
  email:string,   
  conversations?:Array<any>
}




@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private afs: AngularFirestore) { }


  private temp:any;
  public currentUser:User;
  public otherUser;
  public messages =[];
  public chat :Chat ={
    chatId:'',
    messages:[]
   }
  conversationId;



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
      this.temp = resp;
      this.currentUser =this.temp;
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
      console.log('finding....')
    let find =this.currentUser.conversations.find(item => item.uid == user.uid);
    if (find) {
      //means that already have talked to the user before..
      console.log('found it', find);
     return  this.getChat(find.chatId);




    } else if (!find) {
      console.log('not-found')
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


sendMessageg(message){
  console.log('msg', message);
  console.log('chat', this.chat);
  if(this.chat.chatId){
    console.log('chat is selected');
    this.chat.messages.push(message);
    console.log('send-chat', this.chat)
    return this.afs.doc('conversations/'+ this.chat.chatId).update(this.chat)

  }else{
    console.log('Please select a Chat');
  }
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






  /* FINAL CODE */


  refreshCurrentUser(){
    this.afs.collection('users/'+ localStorage.getItem('uid')).valueChanges().subscribe(data=>{
         this.temp = data;
         this.currentUser = this.temp;
    })
  }



  async addConvo(user){
    //data to be added.
    let userMsg ={name:user.name, uid: user.uid,chatId: this.chat.chatId}
    let otherMsg={name:this.currentUser.name, uid: this.currentUser.uid, chatId:this.chat.chatId}
    //first set both references.  
    let myReference = this.afs.doc('users/'+ this.currentUser.uid);
    let otherReference = this.afs.doc('users/'+ user.uid);

    // Updating my profile 
  myReference.get().subscribe(d=>{
          let c=d.data()
          console.log('c',c);
          if(!c.conversations){
            c.conversations = [];
          }
          c.conversations.push(userMsg);
         return myReference.update({conversations: c.conversations})
      })
      // Updating Other User Profile
      otherReference.get().subscribe(d=>{
        let c=d.data()
        console.log('c',c);
        if(!c.conversations){
          c.conversations = [];
        }
        c.conversations.push(otherMsg);
       return otherReference.update({conversations: c.conversations})
    })

  // otherReference.get().subscribe(d=>{
  //     let c=d.data().conversations.push({name:this.currentUser.name, uid: this.currentUser.uid, chatId:this.chat.chatId});
  //    return myReference.update({conversations: c})
  // })




  }


  convoMaker(user){

  }
  addConvoToUser(uid, user:User){
    let convo= [];
    if(!user.uid){
      console.log('addconvo-no user id found', user)
      return
    }
    let c ={
      name: user.name,
      uid: user.uid,
      chatId: this.chat.chatId
    }


    // user.conversations.push(c)
if(!user.conversations || user.conversations.length <=0){
  user.conversations =[];
}

user.conversations.push(c);

return this.afs.doc('users/'+uid).update({conversations:user.conversations})
  }


  addNewChat(){
    const chatId =this.afs.createId();

    console.log('chatID----', chatId)
      return this.afs.doc('conversations/'+ chatId).set({
        chatId: chatId,
        messages:[]
      }).then(()=> {
        this.chat = {
          chatId:chatId,
           messages:[]
        }
      })
 
  }

  pushNewMessage(list){
    console.log('this-chat-x-x-x-x-x-x-', this.chat)
    return this.afs.doc('conversations/'+this.chat.chatId).update(
      {messages: list}
    )
  }


  updateChat(chat){
    return this.afs.doc('conversations/' + chat.chatId).update(chat)
  }

  getCurrentChat(chatId){
    console.log('get')
    return this.afs.doc('conversations/'+chatId).valueChanges()
  }


  clearData(){
    localStorage.clear();
    this.messages =[]
    this.currentUser = {
      conversations:[],
      name:'',
      email:'',
      uid:''
    }
    this.chat = null;
    this.temp = null;
 
  }


}
