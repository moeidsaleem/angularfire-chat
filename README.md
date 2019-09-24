# Chatapp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.5.
- AngularFire 


### Details 


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





## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
