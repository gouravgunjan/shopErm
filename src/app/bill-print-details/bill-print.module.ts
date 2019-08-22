import { NgModule } from '@angular/core';
import { BillPrintDetailsComponent } from './bill-print-details.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillPrintRoutingModule } from './bill-print-routing.module';
import { AgGridModule } from 'ag-grid-angular';


@NgModule({
    declarations: [
        BillPrintDetailsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        AgGridModule,
        BillPrintRoutingModule
    ]
})
export class BillPrintModule { }
