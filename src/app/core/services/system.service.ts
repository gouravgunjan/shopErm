import { Injectable } from '@angular/core';
import * as shutdown from 'electron-shutdown-command';

@Injectable()
export class SystemService {
    logoutWindows(): void {
        shutdown.logoff();
    }

    shutdownWindows(): void {
        shutdown.shutdown();
    }

    rebootWindows(): void {
        shutdown.reboot();
    }
}
