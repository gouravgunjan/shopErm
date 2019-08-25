import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { HomeRoutingModule } from './home-routing.module';
import {MatMenuModule} from '@angular/material/menu';
import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BillEntryComponent } from './bill-entry/bill-entry.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import { AgGridModule } from 'ag-grid-angular';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { QuantityGridComponent } from './bill-entry/grid-components/quantity/quantity.component';
import { BillDetailsActionGridComponent } from './bill-entry/grid-components/bill-details-action/bill-details-action.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { WhiteBoardService } from '../core/services/whiteboard.service';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [HomeComponent,
    BillEntryComponent,
    QuantityGridComponent,
    BillDetailsActionGridComponent
  ],
  imports: [CommonModule,
      SharedModule,
      HomeRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      MatButtonModule,
      MatFormFieldModule,
      MatInputModule,
      MatMenuModule,
      MatDialogModule,
      MatListModule,
      MatSnackBarModule,
      MatAutocompleteModule,
      AgGridModule.withComponents([
        BillDetailsActionGridComponent,
        QuantityGridComponent
      ]),
      MatProgressBarModule,
      MatProgressSpinnerModule,
      MatToolbarModule],
    providers: [WhiteBoardService]
})
export class HomeModule {}
