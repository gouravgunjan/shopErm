import { Component, OnInit, NgZone, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { DatabaseService } from '../../core/services/database/database.service';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { startWith, map, take } from 'rxjs/operators';
import { BillListItem } from '../../shared/models/ui-models/bill-list-item';
import { BillEntry } from '../../shared/models/database/bill-entry';
import { ColDef, GridReadyEvent, GridApi, GridOptions } from 'ag-grid-community';
import { QuantityGridComponent } from './grid-components/quantity/quantity.component';
import { BillDetailItem } from '../../shared/models/ui-models/bill-detail-item';
import { BillDetailsActionGridComponent } from './grid-components/bill-details-action/bill-details-action.component';
import { MenuRepo } from '../../shared/models/database/menu-repo';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {MatSnackBar} from '@angular/material/snack-bar';
import { WhiteBoardService } from '../../core/services/whiteboard.service';

@Component({
    selector: 'app-bill-entry',
    templateUrl: './bill-entry.component.html',
    styleUrls: ['./bill-entry.component.scss']
  })
export class BillEntryComponent implements OnInit, OnDestroy, AfterViewInit {
    private subArr: Subscription[] = [];
    private gridApi: GridApi;
    private billDetailsTableEntries: BillDetailItem[];
    private menuItems: MenuRepo[] = [{
        menuId: -1,
        menuCode: '0',
        menuItem: 'Loading...',
        menuPrice: 0
    }];

    @ViewChild('parentContainer', { static: false })
    parentContainerRef: ElementRef;

    isActiveBillsLoading = true;
    billDetailsOverlayMessage = 'Please select a Bill to see details.';
    gridOptions: GridOptions;
    runningBills: BillListItem[];
    filteredMenuList: Observable<MenuRepo[]>;
    newMenuItemControl = new FormControl();
    newMenuItem: string;
    sgstTotal = 0;
    cgstTotal = 0;
    total = 0;

    gridDim = {
        width: 500,
        height: 300
    };

    constructor(private databaseService: DatabaseService,
        private whiteBoard: WhiteBoardService,
        private snackBar: MatSnackBar) {
    }

    ngOnInit(): void {
        this._initialiseGridOptions();
        this.subArr.push(
            this.databaseService.refreshActiveBillList().subscribe(billListItems => {
                this.runningBills = billListItems;
                this.isActiveBillsLoading = false;
                billListItems.forEach(item => this._updateTotalForBillEntry(item.billEntryId));
            })
        );
        this.databaseService.getCompleteMenuRepo().pipe(take(1)).subscribe(menuItemsFromServer => {
            console.log('menu items', menuItemsFromServer);
            this.menuItems = menuItemsFromServer;
        });
        this.filteredMenuList = this.newMenuItemControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filterMenuItemsText(value))
        );
        this.whiteBoard.billTotalChange.subscribe(billEntryId => {
            this._recalculateTotal();
            this._updateTotalForBillEntry(billEntryId);
        });
    }

    ngAfterViewInit(): void {
        this._reCalculateGridDims();
    }

    ngOnDestroy(): void {
        this.subArr.forEach(sub => sub.unsubscribe());
    }

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;
        if (this.billDetailsTableEntries) {
            this._setBillDetails();
        }
    }

    showBillDetails(bill: BillListItem) {
        this.billDetailsTableEntries = null;
        this.runningBills.forEach(billEntry => {
            if (billEntry.billEntryId !== bill.billEntryId) {
                billEntry.isSelected = false;
            }
        });
        bill.isSelected = !bill.isSelected;
        if (bill.isSelected) {
            // update the bill detail section
            this.billDetailsOverlayMessage = 'Loading bill details...';
            this.databaseService.getCompleteDetailsForBillEntry(bill.billEntryId).subscribe(detailRows => {
                console.log('data for bill Entry', detailRows);
                this.billDetailsOverlayMessage = '';
                this._processBillDetails(detailRows);
                if (this.gridApi) {
                    this._setBillDetails();
                }
            });
        } else {
            this.billDetailsOverlayMessage = 'Please select a Bill to see details.';
        }
    }

    newMenuItemChange(selectedEvent: MatAutocompleteSelectedEvent) {
        const selectedValue: MenuRepo = selectedEvent.option.value;
        console.log('selected Menu item', selectedValue);
        // check if the item is alreay present in the list
        let itemAlreadyPresent = false;
        this.gridApi.forEachNode(node => {
            if (node.data.name.indexOf(selectedValue.menuCode) > -1) {
                this.gridApi.ensureNodeVisible(node);
                node.setSelected(true);
                itemAlreadyPresent = true;
                return;
            }
        });
        this.newMenuItemControl.setValue('');
        if (itemAlreadyPresent) {
            this.snackBar.open('This menu item is already present!', 'Okay', { duration: 3000 });
            return;
        }
        const billEntryId = this.runningBills.find(item => item.isSelected).billEntryId;
        const uniqueId = Math.floor(Math.random() * 1000 + 1);
        const newBillEntry: BillEntry = {
            billId: uniqueId,
            billEntryId: billEntryId,
            menuPrice: selectedValue.menuPrice,
            quantity: 1,
            menuCode: selectedValue.menuCode,
            menuItem: selectedValue.menuItem
        };
        const listItem = this._getProcessedBillDetailRow(newBillEntry);
        listItem.updating = true;
        this.gridApi.updateRowData({
            add: [listItem]
        });
        this.databaseService.addNewBillEntryDetail(newBillEntry.menuItem, newBillEntry.billEntryId).subscribe(_newBillId => {
            this.gridApi.forEachNode(node => {
                if (node.data.id === uniqueId) {
                    const data: BillDetailItem = node.data;
                    data.id = _newBillId;
                    data.updating = false;
                    node.updateData(data);
                    return;
                }
            });
        });
    }

    menuItemValueDisplayFunc(item?: MenuRepo): string | undefined {
        return item ? `${item.menuItem} (${item.menuCode})`  : undefined;
    }

    private _updateTotalForBillEntry(billEntryId: number) {
        this.databaseService.getTotalCostForBillId(billEntryId).subscribe(billCost => {
            const runningBillItem = this.runningBills.find(item => item.billEntryId === billEntryId);
            runningBillItem.currentTotalCost = billCost;
        });
    }

    private _setBillDetails() {
        this.gridApi.setRowData(this.billDetailsTableEntries);
        this._recalculateTotal();
    }

    private _reCalculateGridDims(): void {
        // side list is of 30% width
        this.gridDim.height = this.parentContainerRef.nativeElement.scrollHeight - 180;
        this.gridDim.width = this.parentContainerRef.nativeElement.scrollWidth;
    }

    private _processBillDetails(billEntries: BillEntry[]): void {
        this.billDetailsTableEntries = [];
        billEntries.forEach(entryItem => {
            this.billDetailsTableEntries.push(this._getProcessedBillDetailRow(entryItem));
        });
    }

    private _getProcessedBillDetailRow(billEntry: BillEntry): BillDetailItem {
        return <BillDetailItem> {
            id: billEntry.billId,
            name: `${billEntry.menuItem} (${billEntry.menuCode})`,
            price: billEntry.quantity * billEntry.menuPrice,
            quantity: billEntry.quantity,
            menuPrice: billEntry.menuPrice,
            entryId: billEntry.billEntryId,
            updating: false
        };
    }

    private _filterMenuItemsText(value: any): MenuRepo[] {
        if (value.toLowerCase) {
            const filterValue = value.toLowerCase();
            return this.menuItems.filter(option =>
                (option.menuItem.toLowerCase().indexOf(filterValue) > -1)
                || option.menuCode.toLowerCase().indexOf(filterValue) > -1);
        }
        return [value];
    }

    private _recalculateTotal() {
        let totalPrice = 0;
        this.gridApi.forEachNode(node => {
            totalPrice += node.data.price;
        });
        this.sgstTotal = 0.025 * totalPrice;
        this.cgstTotal = 0.025 * totalPrice;
        this.total = totalPrice + this.sgstTotal + this.cgstTotal;
    }

    private _initialiseGridOptions() {
        const columnDefs: ColDef[] = [
            {
                headerName: 'Item Name (Code)',
                field: 'name',
            },
            {
                headerName: 'Quantity',
                field: 'quantity',
                cellRendererFramework: QuantityGridComponent
            },
            {
                headerName: 'Price',
                field: 'price'
            },
            {
                headerName: 'Actions',
                field: 'action',
                cellRendererFramework: BillDetailsActionGridComponent
            },
            {
                headerName: 'Updating',
                field: 'updating',
                cellRenderer: (params) => {
                    return (params.value) ? `Syncing...`
                        : '';
                }
            }
        ];

        this.gridOptions = {
            rowSelection: 'single',
            animateRows: true,
            columnDefs: columnDefs,
            enableSorting: true
        };

    }
}
