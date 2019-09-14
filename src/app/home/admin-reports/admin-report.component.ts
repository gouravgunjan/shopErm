import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../core/services/database/database.service';
import { IChartistData } from 'chartist';
import { ChartEvent, ChartInterfaces, ChartType } from 'ng-chartist';
import * as moment from 'moment';

@Component({
    selector: 'app-admin-report',
    templateUrl: 'admin-report.component.html',
    styleUrls: ['admin-report.component.scss']
})
export class AdminReportComponent implements OnInit {
    private readonly DATE_FORMAT_SQL = 'YYYY-MM-DD';

    chartDetails: IChartistData = {
        labels: [
            '9:00 AM', '10:00 AM', '11:00 AM', '12:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
        ],
        series: [
            [90, 20, 0, 115, 130, 665, 30, 853]
        ]
    };
    chartType: ChartType = 'Line';

    totals = {
        revenue: {
            today: -1,
            weekly: -1,
            monthly: -1
        },
        numberOfOrders: {
            today: -1,
            weekly: -1,
            monthly: -1
        },
        isLoading: false,
        isLoaded: false
    };

    estimations = {
        projectedEarning: {
            dayEnd: -1,
            weekEnd: -1,
            monthEnd: -1
        },
        changesInRevenue: {
            lastThreeDaysEarning: -1,
            lastWeekEarning: -1,
            lastMonthEarning: -1
        }
    }

    yesterdayEarnedByThisTime: -1;

    foodDetails = {
        mostOrderedFoodItem: '',
        mostOrderedFoodItemPerSource: [
            {
                source: '',
                mostOrderedFoodItem: ''
            }
        ]
    };

    constructor(private databaseService: DatabaseService) {

    }

    ngOnInit(): void {
        // get chart data
        this.databaseService.runQuery( `
        select date_format(startTime, '%h:00') as timeInHour, SUM(mr.menuPrice * be.quantity) as totalPrices from bill_repo as br
        join bill_entry as be on be.billEntryId=br.billEntryId
        join menu_repo as mr on mr.menuItem = be.menuItem
        where startTime >= '2019-08-10'
        group by timeInHour;`).subscribe(result => {
            // transform the result into data
            this.chartDetails.labels = [];
            const tempLabels: string[] = [];
            const tempTotals: number[] = [];
            result.forEach((row: any) => {
                tempLabels.push(<string> row.timeInHour);
                tempTotals.push(<number> row.totalPrices);
            });
            this.chartDetails = {
                labels: tempLabels,
                series: [tempTotals]
            };
            // this.chartDetails.labels = tempLabels;
            // this.chartDetails.series = [tempTotals];
            console.log(result);
        });
    }

    chartInitialized(params: ChartInterfaces) {
        console.log(params);
    }

    getTotals(): void {
        this.totals.isLoading = true;
        // totals = {
        //     revenue: {
        //         today: -1,
        //         weekly: -1,
        //         monthly: -1
        //     },
        //     numberOfOrders: {
        //         today: -1,
        //         weekly: -1,
        //         monthly: -1
        //     }
        // };
        const totals = Object.assign({}, this.totals);
        const loadedState = {
            today: false,
            weekly: false,
            monthly: false
        };
        this.databaseService.runQuery(this.getTotalAndOrdersForDate(moment().format(this.DATE_FORMAT_SQL))).subscribe(res => {
            totals.revenue.today = (res[0].revenue) ? res[0].revenue : 0;
            totals.numberOfOrders.today = res[0].totalOrder;
            console.log('totals', totals);
            loadedState.today = true;
            this.checkAndSetTotals(loadedState, totals);
        });
        this.databaseService.runQuery(this.getTotalAndOrdersForDate(moment().subtract(7, 'd').format(this.DATE_FORMAT_SQL),
            moment().format(this.DATE_FORMAT_SQL))).subscribe(res => {
                totals.revenue.weekly = (res[0].revenue) ? res[0].revenue : 0;
                totals.numberOfOrders.weekly = res[0].totalOrder;
                loadedState.weekly = true;
                this.checkAndSetTotals(loadedState, totals);
        });
        this.databaseService.runQuery(this.getTotalAndOrdersForDate(moment().subtract(30, 'd').format(this.DATE_FORMAT_SQL),
            moment().format(this.DATE_FORMAT_SQL))).subscribe(res => {
                totals.revenue.monthly = (res[0].revenue) ? res[0].revenue : 0;
                totals.numberOfOrders.monthly = res[0].totalOrder;
                loadedState.monthly = true;
                this.checkAndSetTotals(loadedState, totals);
        });
    }

    private checkAndSetTotals(loadedState: any, totals: any) {
        if (loadedState.today === true &&
            loadedState.weekly === true &&
            loadedState.monthly === true) {
                totals.isLoading = false;
                totals.isLoaded = true;
                this.totals = totals;
            }
    }

    private getTotalAndOrdersForDate(startDate: string, endDate?: string): string {
        const query = `select SUM(mr.menuPrice * be.quantity) as revenue, count(br.billEntryId) as totalOrder from bill_repo as br
        join bill_entry as be on be.billEntryId=br.billEntryId
        join menu_repo as mr on mr.menuItem = be.menuItem
        where DATE(startTime) ${endDate ? '>' : ''}= '${startDate}'`;
        return endDate ? query + ` and DATE(startTime) <= '${endDate}'` : query;
    }
}
