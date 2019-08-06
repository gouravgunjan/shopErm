import { Injectable } from '@angular/core';
import { DatabaseService } from '../database/database.service';
import { Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { SessionInfo } from '../../../shared/models/session/session-info.model';

@Injectable()
export class SessionManager {
    private sessionInfo: SessionInfo;

    public constructor(private databaseService: DatabaseService) {
    }

    public login(userId: string, password: string): Observable<boolean> {
        const resultSub = new Subject<boolean>();
        this.databaseService.checkUserCredentials(userId, password).pipe(take(1)).subscribe(isCorrectUser => {
            if (isCorrectUser) {
                this.sessionInfo = {
                    userName: userId,
                    loginTS: new Date()
                };
                this.databaseService.makeLoginEntry(userId);
                resultSub.next(true);
            } else {
                resultSub.next(false);
            }
        });
        return resultSub.asObservable();
    }
}
