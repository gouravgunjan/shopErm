import * as mysql from 'mysql';
import { InventoryEntryItem } from '../../../shared/models/database/inventoryItem';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Connection, ConnectionConfig } from 'mysql';

@Injectable()
export class DatabaseService {

    public insertRawInventory() {
        const connection = this.getConnection();
        // const newEntry = new InventoryEntryItem();
        // newEntry.inventoryCode = '105';
        // newEntry.inventoryName = 'Paneer';
        // newEntry.weightInKgs = 20;
        // newEntry.inventoryPrice = 5000;
        // const insertQuery = `INSERT INTO raw_inventory_entry
        //     (inventoryCode, inventoryName, inventoryPrice, dateOfPurchase, updateTS, weightInKgs)
        //         values(
        //         '` + newEntry.inventoryCode + `',
        //         '` + newEntry.inventoryName + `',
        //         ` + newEntry.inventoryPrice + `, CURDATE(), current_timestamp(),
        //         ` + newEntry.weightInKgs + `)`;
        // console.log(insertQuery);
        // connection.connect(error => {
        //     if (error) {
        //         console.error(error);
        //     }
        //     connection.query(insertQuery).on('result', (row: InventoryEntryItem) => {
        //         console.log('saved entry id', row);
        //     }).on('error', queryError => {
        //         console.error(queryError);
        //     });
        // });
    }

    public checkUserCredentials(userId: string, password: string): Observable<boolean> {
        const resultSubject  = new Subject<boolean>();
        const conn = this.getConnection();
        conn.connect(connError => {
            if (connError) {
                console.error(connError);
            }
            conn.query(`SELECT COUNT(*) FROM user_repo where userId='` + userId + `' and password='` + password + `';`)
            .on('result', result => {
                console.log(result);
                resultSubject.next(result['COUNT(*)'] > 0);
            }).on('error', queryError => {
                console.error(queryError);
            });
        });
        return resultSubject.asObservable();
    }

    public makeLoginEntry(userId: string) {
        const conn = this.getConnection();
        conn.connect(connError => {
            if (connError) {
                console.error(connError);
            }
            conn.query(`INSERT INTO LOGIN_ENTRY VALUES('` + userId + `', current_timestamp())`).on('result', result => {
                console.log(result);
            }).on('error', queryError => {
                console.error(queryError);
            });
        });
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
