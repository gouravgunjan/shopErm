import { ICellRendererComp, ICellRendererParams, IAfterGuiAttachedParams } from 'ag-grid-community';
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { BillDetailItem } from '../../../../shared/models/ui-models/bill-detail-item';
import { DatabaseService } from '../../../../core/services/database/database.service';
import { WhiteBoardService } from '../../../../core/services/whiteboard.service';

@Component({
    selector: 'app-grid-quantity',
    templateUrl: 'quantity.component.html',
    styleUrls: ['quantity.component.scss']
})
export class QuantityGridComponent implements ICellRendererAngularComp {
    private params: ICellRendererParams;
    quantity: number;
    udpating: boolean;

    constructor(private dbService: DatabaseService, private whiteBoard: WhiteBoardService) { }

    quantityChanged() {
        // change the price accordingly
        if (this.quantity && +this.quantity >= 1) {
            const dataForNode: BillDetailItem = this.params.node.data;
            dataForNode.quantity = +this.quantity;
            dataForNode.price = +this.quantity * dataForNode.menuPrice;
            this.udpating = true;
            dataForNode.updating = this.udpating;
            this.params.node.setData(dataForNode);
            this.dbService.updateQuantityForBillEntry(dataForNode.id, dataForNode.quantity).subscribe(() => {
                this.udpating = false;
                dataForNode.updating = this.udpating;
                this.params.node.setData(dataForNode);
                this.whiteBoard.notifyBillTotalChange(dataForNode.entryId);
            });
        }
    }

    decrementQuantity() {
        if (this.quantity > 1) {
            this.quantity --;
            this.quantityChanged();
        }
    }

    incrementQuantity() {
        this.quantity++;
        this.quantityChanged();
    }

    refresh(params: any): boolean {
        console.log('refresh called in quantity');
        this.udpating = params.data.updating;
        return true;
    }

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.quantity = params.data.quantity;
        this.udpating = params.data.updating;
    }

    afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
    }
}
