import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { ChatService } from '../chat.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, AfterViewChecked {
  chatService = inject(ChatService);
  router = inject(Router);
  inputMessage: string = '';
  messages: any[] = [];
  roomName = sessionStorage.getItem('room');
  loggedInUserName = sessionStorage.getItem('user');
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  ngOnInit(): void {
    this.chatService.messages$.subscribe((messages) => {
      this.messages = messages;
      console.log(this.messages);
    });
  }

  ngAfterViewChecked(): void {
    this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
  }

  sendMessage() {
    this.chatService
      .SendMessage(this.inputMessage)
      .then(() => this.inputMessage = '')
      .catch((error) => console.error(error));
  }
  leaveChat() {
    this.chatService.LeaveRoom()
    .then(() => {
      this.router.navigate(['/welcome']);
      setTimeout(() => {
        location.reload();
      }, 1000);
    })
    .catch((error) => console.error(error));
  }
}
