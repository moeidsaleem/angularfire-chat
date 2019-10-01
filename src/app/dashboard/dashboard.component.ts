import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { HelperService } from '../services/helper/helper.service';
import { ApiService } from '../services/api/api.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as firebase from 'firebase'
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],

})
export class DashboardComponent implements OnInit {


  title: string = 'chatapp';

  showFiller: boolean = false; //sidebar -toggler
  users: Array<any>; // users list.
  public messages: Array<any> = [] // messages array/
  temp: any; // for handling temporory data from observables.
  showMessages = false; //Toggle to select a conversation.
  message: string = ''; // the  message to be sent

  userFilter ={name:''};

  constructor(
    private helper: HelperService,
     private router: Router,
    private _scrollToService: ScrollToService,
    public api: ApiService) { }
  showChat = true;

  ngOnInit() {
    this.getAllUsers() // start by populating the users list.
  }




  // Run at the start to populate the list.
  getAllUsers() {
    this.api.setCurrentUser(localStorage.getItem('uid')) //setting up the uid in the service for easy access.
    this.api.getUsers().pipe(
      map(actions => {
        return actions.map(a => {
          let data = a.payload.doc.data();
          let id = a.payload.doc.id;
          return {...data}
        })
      })
    ).subscribe(data => {
      console.log('data', data)
        this.users = data.filter((item)=>{
          let find = this.api.currentUser.conversations.find(el => el.uid == item.uid);
          if(!find){
            return item;
          }     
        })        
  })
}


  open(list) {
    this.helper.openDialog(list)

  }


  logoutModal(c) {
    this.helper.openDialog(c)
  }

  logout() {
    this.api.clearData()
    this.router.navigate(['/login']).then(() => this.helper.closeModal())
  }


  closeModal() {
    this.helper.closeModal()
  }







  /* Main Code Logic */
  toggleMessages() {
    this.showMessages = !this.showMessages;
  }


  //Selecting A User from the list (onclick)  to talk
  async selectUser(user) {
    try {
      this.helper.closeModal()
    } catch (e) { console.log(e) }

    if (this.api.currentUser.conversations == undefined) {
      //means user has no conversations.
      this.api.currentUser.conversations = [];
    }
    let convo = [...this.api.currentUser.conversations]; //spread operators for ensuring type Array.
    let find = convo.find(item => item.uid == user.uid); // Check If Its the same person who user has talked to before,
    if (find) { // Conversation Found 
      this.api.getChat(find.chatId).subscribe(m => {
        this.temp = m;
        // set the service values
        this.api.chat = this.temp[0];
        this.messages = this.api.chat.messages == undefined ? [] : this.api.chat.messages
        this.showMessages = true;
        setTimeout(() => {
          this.triggerScrollTo() //scroll to bottom
        }, 1000);
        return
      })
    } else {
      /* User is talking to someone for the very first time. */
      this.api.addNewChat().then(async () => { // This will create a chatId Instance. 
       // Now we will let both the users know of the following chatId reference
        let b = await this.api.addConvo(user); //passing other user info
      })

    }
  }

  /* Sending a  Message */
  sendMessage() {
    // If message string is empty
    if (this.message == '') {
      alert('Enter message');
      return
    }
    //set the message object 
    let msg = {
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
    this.api.pushNewMessage(this.messages).then(() => {
      console.log('sent');
    })
  }

  //Scroll to the bottom 
  public triggerScrollTo() {
    const config: ScrollToConfigOptions = {
      target: 'destination'
    };
    this._scrollToService.scrollTo(config);
  }

  // Firebase Server Timestamp
  get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }




}
