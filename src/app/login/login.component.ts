import { Component, OnInit, NgZone } from '@angular/core';
import { SessionManager } from '../core/services/session/session-manager.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { DialogComponent, DialogData } from '../shared/components/dialog/dialog.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.scss']
})
export class LoginComponent {
    userId: string;
    password: string;

    constructor(private sessionManager: SessionManager,
            private dialog: MatDialog,
            private router: Router,
            private ngZone: NgZone) { }

    public onLoginClick(): void {
        console.log(this.userId, this.password);
        this.sessionManager.login(this.userId, this.password).pipe(take(1)).subscribe(result => {
            if (result === false) {
                const dialogRef = this.dialog.open(DialogComponent, <MatDialogConfig<DialogData>> {
                    minWidth: '300px',
                    data: {
                        message: 'Username or Password incorrect',
                        header: 'Login Failed!'
                    }
                });
                dialogRef.afterClosed().pipe(take(1)).subscribe(() => {
                    console.log('message closed!');
                });
            } else {
                // move to home
                this.ngZone.run(() => {
                    this.router.navigate(['/home']);
                });
            }
        });
    }

}
