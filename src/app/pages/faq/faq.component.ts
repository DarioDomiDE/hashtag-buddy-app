import { Component, OnInit, ViewContainerRef, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page';
import * as app from 'tns-core-modules/application';
import { RadSideDrawer } from 'nativescript-ui-sidedrawer';
import { TipsAndTricks } from '~/app/models/tips-and-tricks';
import { localize } from 'nativescript-localize/angular';
import * as frame from 'tns-core-modules/ui/frame';
import { disableIosSwipe } from '~/app/shared/status-bar-util';
import { ModalDialogOptions, ModalDialogService } from 'nativescript-angular/modal-dialog';
import { ModalComponent } from '~/app/shared/modal/modal.component';
import { UserService } from '~/app/storages/user.service';
import { Subscription } from 'rxjs';
import { StoreService } from '~/app/storages/store.service';
import { PLANS } from '~/app/data/plans';
import { isIOS } from 'tns-core-modules/platform';

@Component({
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  moduleId: module.id,
})
export class FaqComponent implements OnInit, OnDestroy {

  @ViewChild('scrollView', { read: ElementRef, static: false }) public scrollView: ElementRef;
  public faqs: TipsAndTricks[];
  public current: number = -1;
  public hasTipsTricksUnlocked: boolean;
  public headerHeight: number = 0;
  public headerTop: number = 0;
  public isIOS: boolean;
  private price: string = '1,09 €';
  private purchaseSuccessfulSub: Subscription;

  constructor(
    private readonly page: Page,
    private readonly modalService: ModalDialogService,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly storeService: StoreService,
    private readonly userService: UserService,
  ) {
    this.page.actionBarHidden = true;
    this.isIOS = isIOS;
    disableIosSwipe(this.page, frame);
    this.calcHeader();
  }

  public ngOnInit(): void {
    this.faqs = [];
    const maxItem = 11;
    const lockedNumbers = [4, 5, 7, 8, 10, 11];
    for (let i = 1; i <= maxItem; i++) {
      const faq = new TipsAndTricks({
        expand: false,
        title: localize(`faq_${i}_headline`),
        content: localize(`faq_${i}_desc`),
        locked: !!lockedNumbers.find(x => x === i) ? true : false,
      });
      this.faqs.push(faq);
    }

    this.hasTipsTricksUnlocked = this.userService.hasTipsTricksUnlocked();

    this.purchaseSuccessfulSub = this.storeService.onPurchasedSuccessful.subscribe(() => {
      this.hasTipsTricksUnlocked = true;
    });

    this.price = PLANS.find(x => x.id === 'tipstricks').priceShort;
  }

  public ngOnDestroy(): void {
    if (!!this.purchaseSuccessfulSub) {
      this.purchaseSuccessfulSub.unsubscribe();
    }
  }

  public expandToggle(index: number): void {
    this.toogle(index, this.faqs[index]);
  }

  public openModal(): void {
    const faq = this.faqs[this.current];
    if (this.isTextCensored(faq) && !this.hasTipsTricksUnlocked) {
      this.openUnlockModal(faq);
    }
  }

  public openMenu(): void {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
  }

  public getText(faq: TipsAndTricks): string {
    if (faq.locked && !this.hasTipsTricksUnlocked) {
      return faq.content.substring(0, 250) + '...';
    } else if (!faq.locked && !this.hasTipsTricksUnlocked) {
      const index = faq.content.indexOf('\n\n');
      const additionalLength = 50;
      return index !== -1 && faq.content.length >= index + additionalLength ? faq.content.substring(0, index + additionalLength) + '...' : faq.content;
    } else {
      return faq.content;
    }
  }

  public isTextCensored(faq: TipsAndTricks): boolean {
    return faq.locked || faq.content.indexOf('\n\n') !== -1;
  }

  private toogle(index: number, entry: TipsAndTricks): void {
    if (index === this.current) {
      entry.expand = !entry.expand;
      this.current = -1;
    } else {
      if (this.current !== -1) {
        this.faqs[this.current].expand = false;
      }
      entry.expand = true;
      this.current = index;
      this.scrollToIndex(index);
    }
  }

  private scrollToIndex(index: number): void {
    const posY = 63 * index;
    setTimeout.bind(this)(() => {
      this.scrollView.nativeElement.scrollToVerticalOffset(posY, false);
    }, 1);
  }

  private openUnlockModal(faq: TipsAndTricks): void {
    const okFunc = () => {
      console.log('openUnlockModal');
      const item = 'tipstricks';
      this.storeService.onBuyProduct.emit(item);
    };
    const desc = localize('faq_buy_desc', this.price);
    const buttonOk = localize('faq_buy2') + ' ' + this.price;
    const options: ModalDialogOptions = {
      viewContainerRef: this.viewContainerRef,
      fullscreen: false,
      context: {
        icon: 'cart',
        headline: 'faq_buy_headline2',
        desc: desc,
        buttonOk: buttonOk,
        buttonCancel: 'btn_later',
        okFunc: okFunc
      }
    };
    this.modalService.showModal(ModalComponent, options);
  }

  private calcHeader(): void {
    const data = this.userService.calcHeader(1080, 416, 140);
    this.headerHeight = data.height;
    this.headerTop = data.top;
  }

}
