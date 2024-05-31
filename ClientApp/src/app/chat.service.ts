import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public connection: signalR.HubConnection = new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:5000/chat')
    .configureLogging(signalR.LogLevel.Information)
    .build();

  public messages$ = new BehaviorSubject<any>([]);
  public connectedUsers$ = new BehaviorSubject<any>([]);
  public messages: any[] = [];
  public users: string[] = [];

  constructor() {
    this.StartConnection();
    this.connection.on('ReceiveMessage', (user:string, message: string, messageTime: string) => { // ReceiveMessage is the name of the method in the ChatHub class (to chach the message from the server)
      this.messages = [...this.messages, {user, message, messageTime}];
      this.messages$.next(this.messages);
    });
    this.connection.on('ConnectedUsers', (users: string[]) => { // listed to the event ConnectedUsers from backend
      this.connectedUsers$.next(users);
    });
   }


  public async StartConnection(){
    try{
      await this.connection.start();
      console.log("Connection is established");
    }
    catch(error){
      console.error(error);
      setTimeout(() => this.StartConnection(), 5000);
    }
  }

  public async JoinRoom(user: string, room: string){
    try{
      await this.connection.invoke('JoinRoom', {user, room});
    }
    catch(error){
      console.error(error);
    }
  }

  public async SendMessage(message: string){
    try{
      await this.connection.invoke('SendMessage', message);
    }
    catch(error){
      console.error(error);
    }
  }

  public async LeaveRoom(){
    try{
      await this.connection.stop();
    }
    catch(error){
      console.error(error);
    }
  }
}
