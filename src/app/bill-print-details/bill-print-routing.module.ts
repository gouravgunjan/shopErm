import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { BillPrintDetailsComponent } from './bill-print-details.component';

const routes: Routes = [
    {
        path: 'bill',
        component: BillPrintDetailsComponent
    }
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BillPrintRoutingModule {}
