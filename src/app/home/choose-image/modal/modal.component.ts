import { Component, OnInit } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { RouterExtensions } from 'nativescript-angular/router';

@Component({
  selector: 'ns-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  moduleId: module.id,
})
export class ModalComponent implements OnInit {

  constructor(
    private params: ModalDialogParams,
    private router: RouterExtensions,
    ) {}

  columns;

  ngOnInit() {
    let percent = 0;
    let intervalId = setInterval(() => {
      this.setProgressbarWidth(percent);
      percent++;
      if (percent > 100) {
        clearInterval(intervalId);
      }
    }, 5);
  }

  setProgressbarWidth(percent) {
    this.columns = percent + "*," + (100 - percent) + "*";
  }

  close() {
      this.params.closeCallback();
  }

  uploadImage() {
    this.close();
    setTimeout (() => { 
      this.router.navigate(["/home/loading-hashtags"], {
        transition: {
          name: "FadeIn",
          duration: 500,
          curve: "easeOut"
        }
      });
     }, 200);
    
  }  

}
