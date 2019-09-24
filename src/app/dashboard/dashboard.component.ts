import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { HelperService } from '../services/helper/helper.service';
import { ApiService } from '../services/api/api.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import * as firebase from 'firebase'
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],

})
export class DashboardComponent implements OnInit {
  // @ViewChild(CdkVirtualScrollViewport) viewPort: CdkVirtualScrollViewport;
  // @ViewChild('content') content: ElementRef;

  title:string = 'chatapp';
  showFiller:boolean = false;
  users:any;
  public messages: Array<any> = []
  temp:any;
  showMessages = false;
  message:string = '';


  constructor(private helper: HelperService, private router: Router,
    private _scrollToService: ScrollToService,
    public api: ApiService) { }
  showChat = true;

  ngOnInit() {
    this.getAllUsers()
  }




  getAllUsers() {
    //First we will set the current User with the uid. 
    this.api.setCurrentUser(localStorage.getItem('uid'))
    //fetch all users
    this.api.getUsers().pipe(
      map(actions => {
        return actions.map(a => {
          let data = a.payload.doc.data();
         let id = a.payload.doc.id
          if(!this.api.currentUser.conversations){
            this.api.currentUser.conversations = [];
          }
           let found =this.api.currentUser.conversations.filter(item => item.uid == id);
           if(found){
             console.log('means that user must belong to it.')
             return {...data}
           }
          
        })
      })
    ).subscribe(data => {
      if(data){
        this.temp = data;  
        this.users = this.temp
        this.temp = []
      }else{
        this.users = []
      };
    })
  }





  selectUser(user) {
    console.log('user-selected', user);
    this.api.selectUser(user).subscribe(c => {
      this.messages = this.api.chat.messages;
      console.log('m', c)
    })
  }




  sendMessage() {
    this.message = '';
    this.api.sendMessageg(this.message).then(() => {
      this.message = '';
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







  /* FINAL CODE */
  toggleMessages() {
    this.showMessages = !this.showMessages;
  }


  async selectAUser(user) {
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
        let convo = [];
      let b = await this.api.addConvo(user);
      })

    }
  }



  sendAMessage() {
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
      console.log('sent')
    })
  }


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
