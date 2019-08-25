import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../core/services/database/database.service';
import { BillEntry } from '../shared/models/database/bill-entry';
import { GridOptions, ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { BillDetailItem } from '../shared/models/ui-models/bill-detail-item';
import { TotalCal } from '../shared/utils/total-cal.util';
import { ElectronService } from '../core/services';
import { isNgTemplate } from '@angular/compiler';


@Component({
    selector: 'app-bill-print-details',
    templateUrl: 'bill-print-details.component.html',
    styleUrls: ['bill-print-details.component.scss']
})
export class BillPrintDetailsComponent implements OnInit {
    private gridApi: GridApi;
    private discount: number;

    additionalDetails = [
        {
            label: 'SGST (2.5%):',
            value: 0
        },
        {
            label: 'CGST (2.5%):',
            value: 0
        },
        {
            label: 'Total:',
            value: 0
        }
    ];
    billEntryDetails: BillDetailItem[];
    gridHeight: number;
    gridOptions: GridOptions;

    constructor(private databaseService: DatabaseService, private electron: ElectronService) { }

    ngOnInit(): void {
        const billEntryId = +this.getQueryStringValue('billEntryId');
        this.discount = +this.getQueryStringValue('discount');
        this.databaseService.getCompleteDetailsForBillEntry(billEntryId).subscribe(entryItems => {
            this._processBillDetails(entryItems);
            this._calculateAddtionalDetails();
            if (this.gridApi) {
                this._setBillDetails();
            }
        });
        this._initialiseGridOptions();
    }

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api;
        if (this.billEntryDetails) {
            this._setBillDetails();
        }
    }

    printBill() {
        this.electron.printBillDetails(this.billEntryDetails, this.discount);
    }

    private _setBillDetails() {
        this.gridApi.setRowData(this.billEntryDetails);
        // this._recalculateTotal();
    }

    private getQueryStringValue (key) {
        return decodeURIComponent(window.location.href
            .replace(new RegExp('^(?:.*[&\\?]' + encodeURIComponent(key).replace(/[\.\+\*]/g, '\\$&') +
                '(?:\\=([^&]*))?)?.*$', 'i'), '$1'));
    }

    private _getProcessedBillDetailRow(billEntry: BillEntry): BillDetailItem {
        return <BillDetailItem> {
            id: billEntry.billId,
            name: billEntry.menuItem,
            price: billEntry.quantity * billEntry.menuPrice,
            quantity: billEntry.quantity,
            menuPrice: billEntry.menuPrice,
            entryId: billEntry.billEntryId
        };
    }

    private _calculateAddtionalDetails() {
        const additionalDetails = TotalCal.calcTotalFromDetailItems(this.billEntryDetails, this.discount);
        this.additionalDetails.forEach(item => {
            switch (item.label) {
                case 'CGST (2.5%):':
                    item.value = additionalDetails.cgst;
                    break;
                case 'SGST (2.5%):':
                    item.value = additionalDetails.sgst;
                    break;
                case 'Total:':
                    item.value = additionalDetails.total;
                    break;
            }
        });
        if (this.discount > 0) {
            this.additionalDetails.unshift({
                label: `Discount (${this.discount}%):`,
                value: additionalDetails.discount
            });
        }
    }

    private _processBillDetails(billEntries: BillEntry[]): void {
        this.billEntryDetails = [];
        billEntries.forEach(entryItem => {
            this.billEntryDetails.push(this._getProcessedBillDetailRow(entryItem));
        });
        this.gridHeight = 100 + 40 * billEntries.length;
    }

    private _initialiseGridOptions() {
        const columnDefs: ColDef[] = [
            {
                headerName: 'Item Name',
                field: 'name',
                width: 330
            },
            {
                headerName: 'Rate',
                field: 'menuPrice',
                width: 80
            },
            {
                headerName: 'Qty.',
                field: 'quantity',
                width: 80
            },
            {
                headerName: 'Price',
                field: 'price',
                width: 80
            }
        ];

        this.gridOptions = <GridOptions> {
            columnDefs: columnDefs,
            rowHeight: 30,
            headerHeight: 30
        };
    }

}
