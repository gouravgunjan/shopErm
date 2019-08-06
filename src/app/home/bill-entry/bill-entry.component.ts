import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../core/services/database/database.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
    selector: 'app-bill-entry',
    templateUrl: './bill-entry.component.html',
    styleUrls: ['./bill-entry.component.scss']
  })
export class BillEntryComponent implements OnInit {

    public tableControl = new FormControl();
    public tableOptions = ['Table 1', 'Table 2', 'On Demand'];
    public filteredTableOptions: Observable<any>;

    constructor(private databaseService: DatabaseService) { }

    ngOnInit(): void {
        this.filteredTableOptions = this.tableControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value))
        );
    }

    private _filter(value: string): string[] {
        return this.tableOptions.filter(option => option.toLowerCase().indexOf(value.toLowerCase()) > -1);
    }
}
