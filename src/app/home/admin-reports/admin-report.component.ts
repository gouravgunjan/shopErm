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
            '9 AM',
            '10 AM',
            '11 AM',
            '12 AM',
            '1 PM',
            '2 PM',
            '3 PM',
            '4 PM',
            '5 PM',
            '6 PM',
            '7 PM',
            '8 PM',
            '9 PM',
            '10 PM'
        ],
        series: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
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
        },
        isLoading: false,
        isLoaded: false
    };

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
        this.getChartValues();
        this.getTotals();
    }

    chartInitialized(params: ChartInterfaces) {
        console.log(params);
    }

    getChartValues() {
        this.databaseService.runQuery(this.getChartDetailsQueryForDate('2019-08-10')).subscribe(result => {
            // transform the result into data
            const tempCharDetails = Object.assign({}, this.chartDetails);
            result.forEach((row: any) => {
                const indexOfLableFound = (<string[]> tempCharDetails.labels).indexOf(row.timeInHour);
                if (indexOfLableFound > -1) {
                    (<number[]>tempCharDetails.series[0]).splice(indexOfLableFound, 1, <number> row.totalPrices);
                }
            });
            this.chartDetails = tempCharDetails;
        });
        this.databaseService.runQuery(this.getChartDetailsQueryForDate(moment().subtract(7, 'd').format(this.DATE_FORMAT_SQL),
        moment().format(this.DATE_FORMAT_SQL), 6)).subscribe(result => {
            // transform the result into data
            const tempCharDetails = Object.assign({}, this.chartDetails);
            result.forEach((row: any) => {
                const indexOfLableFound = (<string[]> tempCharDetails.labels).indexOf(row.timeInHour);
                if (indexOfLableFound > -1) {
                    (<number[]>tempCharDetails.series[1]).splice(indexOfLableFound, 1, <number> row.totalPrices);
                }
            });
            this.chartDetails = tempCharDetails;
        });
        this.databaseService.runQuery(this.getChartDetailsQueryForDate(moment().subtract(30, 'd').format(this.DATE_FORMAT_SQL),
        moment().format(this.DATE_FORMAT_SQL), 29)).subscribe(result => {
            // transform the result into data
            const tempCharDetails = Object.assign({}, this.chartDetails);
            result.forEach((row: any) => {
                const indexOfLableFound = (<string[]> tempCharDetails.labels).indexOf(row.timeInHour);
                if (indexOfLableFound > -1) {
                    (<number[]>tempCharDetails.series[1]).splice(indexOfLableFound, 1, <number> row.totalPrices);
                }
            });
            this.chartDetails = tempCharDetails;
        });
    }

    getTotals(): void {
        this.totals.isLoading = true;
        const totals = Object.assign({}, this.totals);
        const loadedState = {
            today: false,
            weekly: false,
            monthly: false
        };
        this.databaseService.runQuery(this.getTotalAndOrdersQueryForDate(moment().format(this.DATE_FORMAT_SQL))).subscribe(res => {
            totals.revenue.today = (res[0].revenue) ? res[0].revenue : 0;
            totals.numberOfOrders.today = res[0].totalOrder;
            console.log('totals', totals);
            loadedState.today = true;
            this.checkAndSetTotals(loadedState, totals);
        });
        this.databaseService.runQuery(this.getTotalAndOrdersQueryForDate(moment().subtract(7, 'd').format(this.DATE_FORMAT_SQL),
            moment().format(this.DATE_FORMAT_SQL))).subscribe(res => {
                totals.revenue.weekly = (res[0].revenue) ? res[0].revenue : 0;
                totals.numberOfOrders.weekly = res[0].totalOrder;
                loadedState.weekly = true;
                this.checkAndSetTotals(loadedState, totals);
        });
        this.databaseService.runQuery(this.getTotalAndOrdersQueryForDate(moment().subtract(30, 'd').format(this.DATE_FORMAT_SQL),
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

    private getTotalAndOrdersQueryForDate(startDate: string, endDate?: string): string {
        const endDateQuery = endDate ? ` and DATE(startTime) <= '${endDate}'` : '';
        const query = `select SUM(mr.menuPrice * be.quantity) as revenue, count(br.billEntryId) as totalOrder from bill_repo as br
        join bill_entry as be on be.billEntryId=br.billEntryId
        join menu_repo as mr on mr.menuItem = be.menuItem
        where DATE(startTime) ${endDate ? '>' : ''}= '${startDate}'${endDateQuery}
        and br.isComplete=true`;
        return ;
    }

    private getChartDetailsQueryForDate(startDate: string, endDate?: string, numberOfDays?: number): string {
        const endDateExtraQuery = endDate ? ` and DATE(startTime) <= '${endDate}'` : '';
        return `select date_format(startTime, '%l %p') as timeInHour,
        SUM(mr.menuPrice * be.quantity)${numberOfDays ? '/' + numberOfDays : ''} as totalPrices from bill_repo as br
        join bill_entry as be on be.billEntryId=br.billEntryId
        join menu_repo as mr on mr.menuItem = be.menuItem
        where DATE(startTime) ${endDate ? '>' : ''}= '${startDate}' ${endDateExtraQuery}
        and br.isComplete=true
        group by timeInHour;`;
    }
}
