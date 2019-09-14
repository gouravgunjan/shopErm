import { Component, OnInit, NgZone, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { DatabaseService } from '../../core/services/database/database.service';
import { FormControl } from '@angular/forms';
import { Observable, Subscription, timer } from 'rxjs';
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
import { SessionManager } from '../../core/services/session/session-manager.service';
import { MatInput } from '@angular/material/input';
import { PromoBillEntry } from '../../shared/models/ui-models/promo-bill-entry';
import * as moment from 'moment';
import { remote } from 'electron';
import { ElectronService } from '../../core/services';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { DialogComponent, DialogData } from '../../shared/components/dialog/dialog.component';

@Component({
    selector: 'app-bill-entry',
    templateUrl: './bill-entry.component.html',
    styleUrls: ['./bill-entry.component.scss']
  })
export class BillEntryComponent implements OnInit, OnDestroy, AfterViewInit {
    private subArr: Subscription[] = [];
    private gridApi: GridApi;
    private billDetailsTableEntries: BillDetailItem[];
    private menuItems: MenuRepo[] = [];
    private billEntryTypes: string[] = [];
    private promoCodes: PromoBillEntry[] = [];
    private newBillCustomerType: string;

    @ViewChild('parentContainer', { static: false })
    parentContainerRef: ElementRef;
    @ViewChild('billEntryAddition', {static: false})
    billEntryMatInput: MatInput;
    @ViewChild('promoCodeInput', { static: false})
    promoCodeInput: MatInput;

    isActiveBillsLoading = true;
    billDetailsOverlayMessage = 'Please select a Bill to see details.';
    gridOptions: GridOptions;
    runningBills: BillListItem[];
    filteredMenuList: Observable<MenuRepo[]>;
    filteredEntryType: Observable<string[]>;
    filteredPromoCode: Observable<PromoBillEntry[]>;
    appliedPromoCode: PromoBillEntry;
    newMenuItemControl = new FormControl();
    newBillEntryControl = new FormControl();
    promoCodeControl = new FormControl();
    newBillEntryButtonEnabled = true;
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
        private snackBar: MatSnackBar,
        private electron: ElectronService,
        private dialog: MatDialog,
        private sessionManager: SessionManager) {
    }

    ngOnInit(): void {
        this._initialiseGridOptions();
        this.refreshAllBillList();
        this.databaseService.getCustomerTypesSortedByUsage().subscribe(customerTypes => {
            console.log('bill entries', customerTypes);
            this.billEntryTypes = customerTypes;
        });
        this.databaseService.getCompleteMenuRepo().subscribe(menuItemsFromServer => {
            console.log('menu items', menuItemsFromServer);
            this.menuItems = menuItemsFromServer;
        });
        this.databaseService.getAllPromoCodes().subscribe(promoCodes => this.promoCodes = promoCodes);
        this.filteredMenuList = this.newMenuItemControl.valueChanges.pipe(
            map(value => this._filterMenuItemsText(value))
        );
        this.filteredEntryType = this.newBillEntryControl.valueChanges.pipe(
            map(value => {
                this._checkAndSetNewBillButtonEnabled(value);
                return this._filterCustomerType(value);
            })
        );
        this.filteredPromoCode = this.promoCodeControl.valueChanges.pipe(
            map(value => this._filterPromoCode(value))
        );
        this.whiteBoard.billTotalChange.subscribe(billEntryId => {
            this._recalculateTotal();
        });

        timer(60 * 1000, 60 * 1000).subscribe(() => {
            this._recalculateBillOverdue();
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
        this.appliedPromoCode = null;
        (<any>this.promoCodeInput).nativeElement.value = '';
        if (!bill) {
            this.billDetailsOverlayMessage = 'Please select a Bill to see details.';
            return;
        }
        this.runningBills.forEach(billEntry => {
            if (billEntry.billEntryId !== bill.billEntryId) {
                billEntry.isSelected = false;
            }
        });
        bill.isSelected = !bill.isSelected;
        if (bill.isSelected) {
            // update the bill detail section
            this.billDetailsOverlayMessage = 'Loading bill details...';
            this.databaseService.getPromoCodeForBillEntry(bill.billEntryId).subscribe(result => {
                if (result) {
                    this.appliedPromoCode = result;
                    (<any>this.promoCodeInput).nativeElement.value = this.appliedPromoCode.promoCode;
                }
            });
            this.databaseService.getCompleteDetailsForBillEntry(bill.billEntryId).subscribe(detailRows => {
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

    promoCodeSelected(selectedEvent: MatAutocompleteSelectedEvent) {
        const selectedValue: PromoBillEntry = selectedEvent.option.value;
        const selectedBillEntryId = this.runningBills.find(item => item.isSelected).billEntryId;
        this.databaseService.applyPromo(selectedValue ? selectedValue.promoCode : '', selectedBillEntryId).subscribe(isSuccess => {
            if (isSuccess) {
                this.appliedPromoCode = selectedValue;
                this.snackBar.open(selectedValue ? 'Promo Applied!' : 'Promo Removed!', 'Okay', { duration: 3000});
            } else {
                this.appliedPromoCode = null;
                this.snackBar.open('Promo Failed', 'Okay', { duration: 3000 });
                this.promoCodeControl.reset();
            }
            this._recalculateTotal();
        });
    }

    newMenuItemChange(selectedEvent: MatAutocompleteSelectedEvent) {
        const selectedValue: MenuRepo = selectedEvent.option.value;
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
        this.billDetailsTableEntries.push(listItem);
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
                    this.gridApi.redrawRows({rowNodes: [node]});
                    return;
                }
            });
        });
    }

    menuItemValueDisplayFunc(item?: MenuRepo): string | undefined {
        return item ? `${item.menuItem} (${item.menuCode})`  : undefined;
    }

    promoItemValueDisplayFunc(item?: PromoBillEntry): string | undefined {
        return item ? item.promoCode  : undefined;
    }

    newBillEntryClick(): void {
        if (this.newBillCustomerType !== '') {
            this.newBillEntryButtonEnabled = false;
            this.isActiveBillsLoading = true;
            this.databaseService.addNewBillEntry(this.newBillCustomerType, this.sessionManager.entryUser).subscribe(entryId => {
                const newBillEntry: BillListItem = {
                    billEntryId: entryId,
                    currentTotalCost: 0,
                    customerType: this.newBillCustomerType,
                    isSelected: false,
                    startTime: new Date()
                };
                if (!this.billEntryTypes.some(item => item.toLowerCase() === this.newBillCustomerType.toLowerCase())) {
                    this.billEntryTypes.push(this.newBillCustomerType);
                }
                this.newBillEntryControl.reset();
                this.runningBills.push(newBillEntry);
                this.showBillDetails(newBillEntry);
                this.isActiveBillsLoading = false;
            });
        }
    }

    completeAndPrint() {
        const dialogRef = this.dialog.open(DialogComponent, <MatDialogConfig<DialogData>> {
            minWidth: '300px',
            data: {
                message: 'Please press Complete to confirm.',
                header: 'Confirm',
                okButtonText: 'Complete'
            }
        });
        dialogRef.componentInstance.data.okButtonAction = () => this.setOkButtonActionForCompleteAndPrint(dialogRef);
    }

    private setOkButtonActionForCompleteAndPrint(dialogRef: MatDialogRef<DialogComponent, any>) {
        dialogRef.componentInstance.data.okButtonAction = undefined;
        dialogRef.componentInstance.data.okButtonText = undefined;
        dialogRef.componentInstance.data.header = 'Updating';
        dialogRef.componentInstance.data.message = 'Updating Database';
        dialogRef.componentInstance.data.cancelButtonDisabled = true;
        dialogRef.disableClose = true;
        this.databaseService.markBillAsComplete(this.billDetailsTableEntries[0].entryId).subscribe(isUpdateSuccess => {
            if (isUpdateSuccess) {
                dialogRef.componentInstance.data.header = 'Printing';
                dialogRef.componentInstance.data.message = 'Printing the bill...';
                this.electron.printBillDetails(this.billDetailsTableEntries,
                    this.appliedPromoCode ? this.appliedPromoCode.promoDiscountPercent : 0).subscribe(success => {
                    dialogRef.disableClose = false;
                    if (success) {
                        dialogRef.close();
                        this.snackBar.open('Bill Printed!', 'Okay', { duration: 3000 });
                        this.refreshAllBillList();
                    } else {
                        dialogRef.componentInstance.data.cancelButtonDisabled = false;
                        dialogRef.componentInstance.data.message =
                            'Something went wrong while printing the data. Please provide manual bill.';
                        dialogRef.componentInstance.data.header = 'Error!';
                        this.electron.showBilLDetails(this.billDetailsTableEntries,
                            this.appliedPromoCode ? this.appliedPromoCode.promoDiscountPercent : 0);
                        this.refreshAllBillList();
                    }
                });
            } else {
                dialogRef.componentInstance.data.okButtonAction = () => this.setOkButtonActionForCompleteAndPrint(dialogRef);
                dialogRef.componentInstance.data.okButtonText = 'Retry Completing';
                dialogRef.componentInstance.data.header = 'Retry';
                dialogRef.componentInstance.data.message = 'Failed to update database, please retry to complete bill.';
                dialogRef.componentInstance.data.cancelButtonDisabled = false;
                dialogRef.disableClose = false;
            }
        });
    }

    private refreshAllBillList(): void {
        this.databaseService.refreshActiveBillList().subscribe(billListItems => {
            this.runningBills = billListItems.sort((a, b) => a.billEntryId - b.billEntryId);
            this.isActiveBillsLoading = false;
            this._recalculateBillOverdue();
            billListItems.forEach(item => this._updateTotalForBillEntry(item.billEntryId));
            this.showBillDetails(null);
        });
    }

    private _checkAndSetNewBillButtonEnabled(customerType: string) {
        if (customerType && customerType.trim() === '' ) {
            this.newBillCustomerType = '';
            this.newBillEntryButtonEnabled = false;
        } else if (customerType) {
            this.newBillCustomerType = customerType.trim();
            this.newBillEntryButtonEnabled = true;
        }
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

    private _filterPromoCode(value: any): PromoBillEntry[] {
        if (value && value.toLowerCase) {
            const filterValue = value.toLowerCase();
            return this.promoCodes.filter(option =>
                option.promoCode.toLowerCase().indexOf(filterValue) > -1);
        }
        return [value];
    }

    private _filterCustomerType(value: string): string[]  {
        if (value) {
            const filterValue = value.toLowerCase();
            return this.billEntryTypes.filter(option =>
                option.toLowerCase().indexOf(filterValue) > -1);
    }
    }

    private _filterMenuItemsText(value: any): MenuRepo[] {
        if (value && value.toLowerCase) {
            const filterValue = value.toLowerCase();
            return this.menuItems.filter(option =>
                (option.menuItem.toLowerCase().indexOf(filterValue) > -1)
                || option.menuCode.toLowerCase().indexOf(filterValue) > -1);
        }
        return [value];
    }

    private _recalculateBillOverdue() {
        if (this.runningBills && this.runningBills.length > 0) {
            this.runningBills.forEach(billEntry => {
                if (!billEntry.isOverdue && moment().diff(moment(billEntry.startTime), 'h') > 2) {
                    billEntry.isOverdue = true;
                }
            });
        }
    }

    private _recalculateTotal() {
        let totalPrice = 0;
        const billEntry = this.runningBills.find(item => item.isSelected);
        if (billEntry) {
            this.gridApi.forEachNode(node => {
                totalPrice += node.data.price;
            });
            this._updateTotalForBillEntry(billEntry.billEntryId);
            if (this.appliedPromoCode && totalPrice > 0) {
                totalPrice -= totalPrice * this.appliedPromoCode.promoDiscountPercent / 100;
            }
            this.sgstTotal = 0.025 * totalPrice;
            this.cgstTotal = 0.025 * totalPrice;
            this.total = totalPrice;
        }
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
