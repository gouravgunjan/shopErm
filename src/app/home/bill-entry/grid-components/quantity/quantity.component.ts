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
    updating: boolean;

    constructor(private dbService: DatabaseService, private whiteBoard: WhiteBoardService) { }

    quantityChanged() {
        // change the price accordingly
        if (this.quantity && +this.quantity >= 1) {
            const dataForNode: BillDetailItem = this.params.node.data;
            dataForNode.quantity = +this.quantity;
            dataForNode.price = +this.quantity * dataForNode.menuPrice;
            this.updating = true;
            dataForNode.updating = this.updating;
            this.params.node.setData(dataForNode);
            this.dbService.updateQuantityForBillEntry(dataForNode.id, dataForNode.quantity).subscribe(() => {
                console.log('quantity updated');
                this.updating = false;
                dataForNode.updating = this.updating;
                this.params.node.setData(dataForNode);
                this.params.api.redrawRows({
                    rowNodes: [this.params.node]
                });
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
        return false;
    }

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.quantity = params.data.quantity;
        this.updating = params.data.updating;
    }

    afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
    }
}
