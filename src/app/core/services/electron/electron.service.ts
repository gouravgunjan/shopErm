import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, remote, BrowserWindow } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { PromoBillEntry } from '../../../shared/models/ui-models/promo-bill-entry';
import { PrintTemplateProcessor } from './print-template-processor';
import { BillDetailItem } from '../../../shared/models/ui-models/bill-detail-item';
import { Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;

  get isElectron() {
    return window && window.process && window.process.type;
  }

  constructor() {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
    }
  }

  showBilLDetails(billEntries: BillDetailItem[], discount: number) {
    const htmlBody = PrintTemplateProcessor.getCompleteBillHtmlString(billEntries, discount);
    this.fs.writeFile('C:/temp/print.html', htmlBody,
    (error) => {
      if (error) {
        console.error(error);
      } else {
        const win = new this.remote.BrowserWindow();
        win.loadFile('C:/temp/print.html');
      }
    });
  }

  printBillDetails(billEntries: BillDetailItem[], discount: number): Observable<boolean> {
    const result = new Subject<boolean>();
    const htmlBody = PrintTemplateProcessor.getCompleteBillHtmlString(billEntries, discount);
    this.fs.writeFile('C:/temp/print.html', htmlBody,
    (error) => {
      if (error) {
        console.error(error);
        result.next(false);
      } else {
        const win = new this.remote.BrowserWindow({
          show: false
        });
        win.loadFile('C:/temp/print.html');
        // win.webContents.openDevTools();
        win.webContents.on('did-finish-load', () => {
          win.webContents.print({}, success => {
            result.next(true);
            setTimeout(() => {
              win.close();
            }, 30000);
          });
        });
      }
    });
    return result.asObservable().pipe(take(1));
  }
}
