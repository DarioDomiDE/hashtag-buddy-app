import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "tns-core-modules/ui/page";
import { View } from "tns-core-modules/ui/core/view";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { ModalComponent } from './modal/modal.component';
import * as app from "tns-core-modules/application";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as utils from "tns-core-modules/utils/utils";
import { isIOS, isAndroid } from "tns-core-modules/platform";
import * as frame from "tns-core-modules/ui/frame";
import { AppFeedback } from '~/app/models/app-feedback';
import { FeedbackRepository } from '../../services/feedback-repository.service';
import { UserService } from '~/app/storages/user.service';

@Component({
  selector: 'ns-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css'],
  moduleId: module.id,
})
export class FeedbackComponent implements OnInit {

  public email = '';
  public message = '';
  
  constructor(
    private page: Page,
    private router: RouterExtensions,
    private modalService: ModalDialogService, 
    private viewContainerRef: ViewContainerRef,
    private feedbackRepositoryService: FeedbackRepository,
    private userService: UserService,
  ) {
    this.page.actionBarHidden = true;
  }

  ngOnInit() {
  }

  public openMenu(target: View): void {
    this.dismissSoftKeybaord();
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
  }

  public closeMenu(): void {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.closeDrawer();
  }

  public sendFeedback(): void {
    if(this.email === "" && this.message === ""){
      console.log("empty");
      // ToDo Toast -> no data inserted
      return;
    }
    let feedback: AppFeedback = new AppFeedback({
      customerId: this.userService.getUserId(), 
      email: this.email, 
      message: this.message
    });
    this.feedbackRepositoryService.sendAppFeedback(feedback)
    .subscribe(feedback => {
    });
    // this.showModal();  
  }

  private showModal(): void {
    const options: ModalDialogOptions = {
        viewContainerRef: this.viewContainerRef,
        fullscreen: false,
        context: {}
    };
    this.modalService.showModal(ModalComponent, options);
  }

  private dismissSoftKeybaord(): void {
    if (isIOS) {
      frame.topmost().nativeView.endEditing(true);
    }
    if (isAndroid) {
      utils.ad.dismissSoftInput();
    }
  }

  public emailChange(text: string): void {
    this.email = text;
  }

  public messageChange(text: string): void {
    this.message = text;
  }

}
