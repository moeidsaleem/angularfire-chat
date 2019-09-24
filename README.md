# Chatapp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.5.
- AngularFire 


### Function Defination 


Hi 
, The following project consist of these main logics 

- Register ==> Will generate a unique Id against the email provided 
- CreateUser ==> Will create the user against the uid in the firestore db. 
- Login ==> Using the email, firebase Auth will check for the uid and provide it.
- getCurrentUser ==> Against that uid we will fetch the data and save it as currentUser.
- DASHBOARD will be routed 
- It consist of a sidebar for conversations and a chat screen along with add and logout.
- GetAllUsers ==> To start a conversation, press getAllUsers() which will enlist all users
but the logic behind it little complex. We will getAllUsers() but will remove ourself and the 
users which we have already contacted. 
- SelectAUser ==> The user will be selected and now we will create a chatId in the firestore and 
add references to both the loggedIn user profile and the other profile containing each othe uid, name and chatId.
chatId is common in both users. 
- SendMessage ==> Sending a text message will push the message in the messages Array against that chatId. 
- ScrollTo ==> Whenver a message is send, ScrollTo bottom will come in action and will move the screen bottom.
- Logout ==> User can easily log out of the system and localStorage and service will be cleared. 





# Step by step tutorial

#### Setting up Firebase Console

- Firebase create app
- Add a web app to console and copy the configurations
- Enable Firebase Auth email/password 
- Create Firestore db in test-mode


#### Setting up Angular And Angular Material

- Start new project
- Integrate Angular Material with new ( ng add @angular/material )
- Setup basic module integrations by importing resusable components in app.module.ts
- Define components from cli as (Login, signup, dashboard ) component using ng g c ...
- For the demo, its a monolithic (single module app.module), route them in app-routing.ts
- Once all that is ready, time to get started with setting up our Authentication. 

#### Integrating Firebase in Angular

- Add firebase in envirnoment.ts
- Initiailize with AngularFireModule.initializeApp(envirnoment.firebase) 
- Import AngularFireAuthModule and AngularFirestoreModule 
- We are ready to go! 


### Define Services

- Create two services ( api.service.ts - auth.service.ts ) 
- Keep your firebase firestore logic in api.service.ts 
- Keep your firebase authentication logic in auth.service.ts 


### Authentication with email / Login 

- in your auth.service.ts define two functions for login() and signup() 
- In your Login.component.ts, create a UI using Angular Material and reactive Inputs 
- Ensure that values are being sent on pressing the submit functions 
- Inject your service in the login.component.ts and pass email and password into login(email, password)
- Handle the callback as you will get is a unique Identifier (uid) in the localStorage.
- Once that is done, route to dashboard.component.ts 

### Creating a User / Signup 
- in the component setup UI to get name, email & password  and output that in a function.
- In the auth.service.ts the function we write for signup afAuth.auth.createUserWithEmailAndPassword(email,password) will return us uid which we will save in database.
- createUser(uid, data) - With this functions in api.service.ts,  add a user in collection **users** with a node key of  **uid**  and add **data** to it. data containing ( name, email, uid ) of the user.  
- Signup()  - First auth.service.ts will provide a **uid** and we will create a new record in database against it containing the data we took from signup form.
- Save **uid** to localStorage and proceed to Dashboard. 

###### Note - currentUser / chat

- **CurrentUser** is the given instance of our loggedIn user. In order to maintain it, we will keep it in the service to stay consistent throughout. 
- As we have save uid in the localStorage, we will fetch the user data against that uid and maintain it in the *currentUser* in the api.service.ts 
- **chat** is also maintained in the api.service.ts which i will explain later.


### Dashboard Component UI 

- This will contain a chat room UI for sending messages, fetching Users and conversations.
- Import all what you need in the app.module.ts and proceed with developing UI.  
- The example consist of a header (toolbar), sidebar (drawer) and chat interface which will come forward on showMessages == true  
- Sidebar consist of our conversations which are list of people who we have chat with before. A single user conversation instance consist of an element with *uid,name,chatId* 
- Toolbar consist of sidebar toggler, Add new user and log out button.
- The button icon add new user will basically fetch all the users list from the database provided that they abide by the condition that we have not talked to that user before and that user is not us.
- This all happens in the function called getAllUsers() which will fetch them.

### How chat works - Logical description 

- A chat between two users happens by maintaining a common value between two users, which for the scenario is the **chatId** 
- ChatId is the reference to the node in the collection conversations containing all the messages between two users. 
- **message** consist of simple values like ( *senderId, senderName, content* )
- Whenever a user select a user to talk to, trigger operation is exectuted consisting of the following points.
- **Creation of chatId** - A new chatId is generated and in conversation/*chatId* - {chatId:*chatId* , messages:[]} is added. 
- **ChatId user instances** - Now an instance is added in user conversations containing a chatId, unique identiier (uid) of the opposite user and the name of the opposite user. 
- This will now be seen in your sidebar conversation sections maintined in **currentUser.conversations** value. 
- **chat** - in the api.service.ts, you will find an instance of the current chat which will be maintained in this variable.
- After a user has selected another user to chat with, the above operation is executed under the hood and you have showMessages enabled and chat screen is now active. 
- **SendMessage** - your message is simply a string **message** that is passed on to the service where the message is pushed to **chat.messages** and then the chat instance, through the chatId, is updated. 
- **receiveMessage** - Whenever we use valueChanges(), we are currently looking for any change and it will reflect in the chat. 
- **Scrolling** - using the package 'ngx-scroll-to', the logic is that it will go to the very first messages that were pushed in the array with 1second timeout for smooth scrolling. Whenever a user comes this will also trigger. 
- **Conversation Filter** - This is for filtering the user in the conversation tab. 



Well! This is all for today :) Best of luck!! :fire::fire: :construction:




## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.



