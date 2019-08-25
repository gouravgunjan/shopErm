import { Component, OnInit, NgZone } from '@angular/core';
import { SessionManager } from '../core/services/session/session-manager.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { take, delay } from 'rxjs/operators';
import { DialogComponent, DialogData } from '../shared/components/dialog/dialog.component';
import { Router } from '@angular/router';
import { ConnectionResponse } from '../shared/models/session/connection-response';
import * as loginMessages from '../../assets/json/login-messages.json';
import { SystemService } from '../core/services/system.service';

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.scss']
})
export class LoginComponent {
    userId: string;
    password: string;
    isLoading: boolean;

    constructor(private sessionManager: SessionManager,
            private dialog: MatDialog,
            private systemService: SystemService,
            private router: Router) { }

    public onLoginClick(): void {
        console.log(this.userId, this.password);
        this.isLoading = true;
        this.sessionManager.login(this.userId, this.password).subscribe((result: string) => {
            if (result !== loginMessages.successMessage) {
                const dialogRef = this.dialog.open(DialogComponent, <MatDialogConfig<DialogData>> {
                    minWidth: '300px',
                    data: {
                        message: result,
                        header: loginMessages.headerMessage
                    }
                });
            } else {
                // move to home
                this.router.navigate(['/home']);
            }
            this.isLoading = false;
        });
    }

    onLogoutClick() {
        this.systemService.logoutWindows();
    }
}
