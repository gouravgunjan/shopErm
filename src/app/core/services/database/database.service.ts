import { createConnection, Connection } from 'typeorm';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { InventoryItem } from '../../../shared/models/database/inventoryItem';
import { Injectable } from '@angular/core';
require('sqlite3');

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {

    public async createTable(): Promise<void> {
        const _connection = await this.getConnection();
        let _newEntry = new InventoryItem();
        _newEntry.dateOfPurchase = new Date();
        _newEntry.timeStamp = new Date();
        _newEntry.itemName = 'Paneer';
        _newEntry.itemWeightInKgs = 20;
        _newEntry.itemPrice = 5000;
        _newEntry = await _connection.manager.save(_newEntry);
        console.log('saved entry id', _newEntry.id);
    }

    private get sqlLiteConnectionOptions(): SqliteConnectionOptions {
        const _connOptions: SqliteConnectionOptions = {
            type: 'sqlite',
            database: './database.sqlite'
        };
        return _connOptions;
    }

    private async getConnection(): Promise<Connection> {
        return await createConnection(this.sqlLiteConnectionOptions);
    }
}
