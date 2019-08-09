import { Component, OnInit, NgZone, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { DatabaseService } from '../../core/services/database/database.service';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { BillListItem } from '../../shared/models/ui-models/bill-list-item';
import { BillEntry } from '../../shared/models/database/bill-entry';

@Component({
    selector: 'app-bill-entry',
    templateUrl: './bill-entry.component.html',
    styleUrls: ['./bill-entry.component.scss']
  })
export class BillEntryComponent implements OnInit, OnDestroy, AfterViewInit {
    private subArr: Subscription[] = [];

    @ViewChild('parentContainer', { static: false })
    parentContainerRef: ElementRef;

    billListItems: BillListItem[];
    billEntries: BillEntry[];
    gridDim = {
        width: 500,
        height: 300
    };

    columnDefs = [
        {
            headerName: 'Item Name (Code)',
            field: 'name',
        },
        {
            headerName: 'Quantity',
            field: 'quantity'
        },
        {
            headerName: 'Price',
            field: 'price'
        },
        {
            headerName: '',
            field: 'action'
        }
    ];

    rowData = [
        { name: 'Toyota', quantity: 'Celica', price: 35000 },
        { name: 'Ford', quantity: 'Mondeo', price: 32000 },
        { name: 'Porsche', quantity: 'Boxter', price: 72000 }
    ];

    constructor(private databaseService: DatabaseService) {
     }

    ngOnInit(): void {
        this.subArr.push(
            this.databaseService.refreshActiveBillList().subscribe(billListItems => {
                this.billListItems = billListItems;
            })
        );
    }

    ngAfterViewInit(): void {
        this._reCalculateGridDims();
    }

    ngOnDestroy(): void {
        this.subArr.forEach(sub => sub.unsubscribe());
    }

    showBillDetails(bill: BillListItem) {
        this.billListItems.forEach(billEntry => {
            if (billEntry.billEntryId !== bill.billEntryId) {
                billEntry.isSelected = false;
            }
        });
        bill.isSelected = !bill.isSelected;
        if (bill.isSelected) {
            // update the bill detail section
            this.databaseService.getCompleteDetailsForBillEntry(bill.billEntryId).subscribe(detailRows => {
                this.billEntries = detailRows;
                console.log(detailRows);
            });
        }
    }

    private _reCalculateGridDims(): void {
        // side list is of 30% width
        this.gridDim.height = this.parentContainerRef.nativeElement.scrollHeight;
        this.gridDim.width = this.parentContainerRef.nativeElement.scrollWidth;
    }
}
