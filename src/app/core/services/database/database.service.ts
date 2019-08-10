import * as mysql from 'mysql';
import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { Connection, ConnectionConfig } from 'mysql';
import { ConnectionResponse } from '../../../shared/models/session/connection-response';
import { take, map, tap } from 'rxjs/operators';
import * as loginMessages from '../../../../assets/json/login-messages.json';
import * as databaseGenericMessages from '../../../../assets/json/database-generic-messages.json';
import { BillListItem } from '../../../shared/models/ui-models/bill-list-item';
import { BillEntry } from '../../../shared/models/database/bill-entry';
import { MenuRepo } from '../../../shared/models/database/menu-repo';

@Injectable()
export class DatabaseService {

    public constructor(private ngZone: NgZone) { }

    public refreshActiveBillList(): Observable<BillListItem[]> {
        const resultSubject = new Subject<BillListItem[]>();
        this.runQuery('SELECT billEntryId, startTime, customerType  from bill_repo where isComplete = false')
        .subscribe(queryResult => {
            resultSubject.next(queryResult);
        }, error => {
            console.error(error);
        });
        return resultSubject.asObservable();
    }

    public getTotalCostForBillId(billEntryId: number): Observable<number> {
        return this.runQuery(`select SUM(mr.menuPrice*be.quantity) as totalPrice from bill_entry as be
            join menu_repo as mr on mr.menuItem = be.menuItem
            where be.billEntryId = '${billEntryId}'`).pipe(map(result =>  (result[0].totalPrice) + (result[0].totalPrice * 0.05)));
    }

    public getCompleteDetailsForBillEntry(billEntryId: number): Observable<BillEntry[]> {
        return this.runQuery(`select be.*, mr.menuCode, mr.menuPrice from
            bill_entry as be
            join menu_repo mr on be.menuItem = mr.menuItem
            where billEntryId='${billEntryId}';`);
    }

    public updateQuantityForBillEntry(billId: number, quantity: number): Observable<boolean> {
        return this.runQuery(`update bill_entry set quantity = ${quantity} where  billId=${billId}`)
            .pipe(tap((update) => console.log('bill quantity Changed', update)), take(1));
    }

    public addNewBillEntryDetail(menuItem: string, billEntryId: number): Observable<number> {
        return this.runQuery(`insert into bill_entry (billEntryId, menuItem, quantity)
            values(${billEntryId}, '${menuItem}', 1)`).pipe(take(1), map(result => result.insertId));
    }

    public removeBillDetailRow(billId: number) {
        return this.runQuery(`delete from bill_entry where billId = ${billId}`);
    }

    public getCompleteMenuRepo(): Observable<MenuRepo[]> {
        return this.runQuery(`select * from menu_repo`);
    }

    public checkUserCredentials(userId: string, password: string): Observable<string> {
        const resultSubject  = new Subject<string>();
        this.runQuery(`SELECT COUNT(*) FROM user_repo where userId='${userId}' and password='${password}'`).subscribe(queryResult => {
            resultSubject.next((queryResult[0]['COUNT(*)'] > 0) ? loginMessages.successMessage : loginMessages.failureMessage);
        }, error => {
            console.log(error);
            resultSubject.next(databaseGenericMessages.connectionFailureMessage);
        });
        return resultSubject.asObservable().pipe(take(1));
    }

    public makeLoginEntry(userId: string): void {
        this.runQuery(`INSERT INTO LOGIN_ENTRY VALUES('${userId}', current_timestamp())`).subscribe(() => {
            console.log('Entry marked for user');
        }, error => {
            console.error(error);
        });
    }

    private runQuery(query: string): Observable<any> {
        const conn = this.getConnection();
        const result = new Subject<ConnectionResponse<any>>();
        conn.connect(connError => {
            if (connError) {
                result.error(connError);
                conn.destroy();
            } else {
                conn.query(query, (queryError, results) => {
                    this.ngZone.run(() => {
                        if (queryError) {
                            result.error(queryError);
                        } else {
                            result.next(results);
                        }
                    });
                    conn.destroy();
                });
            }
        });
        return result.asObservable().pipe(take(1));
    }

    private get mySqlConnectionOptions(): ConnectionConfig {
        const connOptions: ConnectionConfig = {
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'Admin.welcome',
            database: 'inventorymanagement'
        };
        return connOptions;
    }

    private getConnection(): Connection {
        return mysql.createConnection(this.mySqlConnectionOptions);
    }
}
