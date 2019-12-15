import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class WhiteBoardService {
    private billTotalChangeSource = new Subject<number>();
    private menuItemDeletedSource = new Subject<number>();

    billTotalChange = this.billTotalChangeSource.asObservable();
    menuItemDelete = this.menuItemDeletedSource.asObservable();

    notifyBillTotalChange(billEntryId: number): void {
        this.billTotalChangeSource.next(billEntryId);
    }

    notifyItemDeletedFromBill(menuBillItemId: number): void {
        this.menuItemDeletedSource.next(menuBillItemId);
    }
}
