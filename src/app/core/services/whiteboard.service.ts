import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class WhiteBoardService {
    private billTotalChangeSource = new Subject<number>();

    billTotalChange = this.billTotalChangeSource.asObservable();

    notifyBillTotalChange(billEntryId: number): void {
        this.billTotalChangeSource.next(billEntryId);
    }
}
