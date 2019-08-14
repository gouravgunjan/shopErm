import { Injectable } from '@angular/core';
import { DatabaseService } from '../database/database.service';
import { Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { SessionInfo } from '../../../shared/models/session/session-info.model';
import { ConnectionResponse } from '../../../shared/models/session/connection-response';
import * as loginMessages from '../../../../assets/json/login-messages.json';

@Injectable()
export class SessionManager {
    private sessionInfo: SessionInfo;

    public constructor(private databaseService: DatabaseService) {
    }

    public login(userId: string, password: string): Observable<string> {
        const resultSub = new Subject<string>();
        this.databaseService.checkUserCredentials(userId, password).subscribe((response: string) => {
            if (response === loginMessages.successMessage) {
                this.sessionInfo = {
                    userName: userId,
                    loginTS: new Date()
                };
                this.databaseService.makeLoginEntry(userId);
            }
            resultSub.next(response);
        });
        return resultSub.asObservable();
    }

    public get entryUser(): string {
        return this.sessionInfo.userName;
    }
}
