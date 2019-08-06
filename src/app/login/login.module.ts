import { NgModule } from '@angular/core';
import { LoginComponent } from './login.component';

import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoginRoutingModule } from './login-routing.module';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
    declarations: [LoginComponent],
    imports: [CommonModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        FormsModule,
        MatDialogModule,
        LoginRoutingModule]
})
export class LoginModule { }
