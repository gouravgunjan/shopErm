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

@NgModule({
  declarations: [HomeComponent,
    BillEntryComponent],
  imports: [CommonModule,
      SharedModule,
      HomeRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      MatButtonModule,
      MatFormFieldModule,
      MatInputModule,
      MatMenuModule,
      MatAutocompleteModule,
      MatToolbarModule]
})
export class HomeModule {}
