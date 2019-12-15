import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, IAfterGuiAttachedParams, RowNode } from 'ag-grid-community';
import { DatabaseService } from '../../../../core/services/database/database.service';
import { BillDetailItem } from '../../../../shared/models/ui-models/bill-detail-item';
import { WhiteBoardService } from '../../../../core/services/whiteboard.service';

@Component({
    selector: 'app-grid-bill-detail-action',
    template: `
        <button mat-stroked-button color="warn" (click)="onDelete()"><i class="material-icons">
        delete
        </i> Delete</button>
    `
})
export class BillDetailsActionGridComponent implements ICellRendererAngularComp {
    private params: ICellRendererParams;

    updating: boolean;

    constructor(private dbService: DatabaseService, private whiteBoard: WhiteBoardService) { }

    refresh(params: any): boolean {
        this.updating = params.data.updating;
        return true;
    }

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.updating = params.data.updating;
    }

    onDelete() {
        const data: BillDetailItem = this.params.node.data;
        data.updating = true;
        this.params.node.updateData(data);

        this.dbService.removeBillDetailRow(data.id).subscribe(() => {
            this.params.api.updateRowData({
                remove: [data]
            });
            this.whiteBoard.notifyBillTotalChange(data.entryId);
            this.whiteBoard.notifyItemDeletedFromBill(data.id);
        });
    }

    afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
    }


}
