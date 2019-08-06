import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
    header?: string;
    message: string;
    okButtonText?: string;
    okButtonAction?: Function;
    cancelButtonText?: string;
    cancelButtonAction?: Function;
}

@Component({
    selector: 'app-dialog',
    templateUrl: 'dialog.component.html',
    styleUrls: ['dialog.component.scss']
})
export class DialogComponent {
    constructor(
        public dialogRef: MatDialogRef<DialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) {
            if (!data.cancelButtonText) {
                data.cancelButtonText = 'Close';
            }
        }
}
