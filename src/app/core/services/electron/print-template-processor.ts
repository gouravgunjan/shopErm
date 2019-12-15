import { BillDetailItem } from '../../../shared/models/ui-models/bill-detail-item';
import { TotalCal } from '../../../shared/utils/total-cal.util';
import * as moment from 'moment';

export class PrintTemplateProcessor {

    private static getItemSingleRow(itemName: string, itemQuantity: number, itemPrice: number): string {
        return `<tr><td class="data item">${itemName}</td><td class="data">${itemQuantity}</td>
        <td  class="data price">${itemPrice}</td></tr>`;
    }

    private static getItemRowsString(billDetailRows: BillDetailItem[]): string {
        let result = '';
        billDetailRows.forEach(row => {
            result += this.getItemSingleRow(row.name, row.quantity, row.price);
        });
        return result;
    }

    private static getDiscountRow(discount: number): string {
        if (discount > 0) {
            return `<tr><td class="data item" colspan="2">Discount</td><td class="data"> - ${discount}</td></tr>`;
        }
        return '';
    }

    static getCompleteBillHtmlString(billDetailRows: BillDetailItem[], discount: number, customer: string): string {
        const additionalDetails = TotalCal.calcTotalFromDetailItems(billDetailRows, discount);
        const stringItemRows = this.getItemRowsString(billDetailRows);
        const sgstValue = additionalDetails.sgst;
        const cgstValue = additionalDetails.cgst;
        const totalValue = Math.round(additionalDetails.total);
        const discountRow = this.getDiscountRow(Math.round(additionalDetails.discount));
        const billNumber = billDetailRows[0].entryId;
        const formattedDate = moment().format('MM-DD-YYYY');
        return `<html>
                    <body>
                        <div class="header">
                            <span class="kitchen-name">Noco Kitchen (<span>${formattedDate}</span>)</span>
                            <div class="additonal-details">
                                <span>Bill No. ${billNumber}</span>
                                <span>[29AAQFD3229A1ZK]</span>
                            </div>
                            <div class="other-details">
                                <div>Ph - 7903443098</div>
                                <div class="customer">Customer - ${customer}</div>
                            </div>
                            <span>---------------------------------------------------------------------------------</span>
                        </div>
                        <table>
                            <tr>
                                <th class="item">Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                            </tr>
                            <tr>
                                <td colspan="3">---------------------------------------------------------------------------------</td>
                            </tr>
                            ${stringItemRows}
                            <tr>
                                <td class="seperator" colspan="3">---------------------------------------------------------------------------------</td>
                            </tr>
                            <tr>
                                <td class="item data" colspan="2">Total (excluding taxes)</td>
                                <td class="data price">${additionalDetails.totalWithoutGst}</td>
                            </tr>
                            <tr>
                                <td class="item data" colspan="2">SGST (2.5%)</td>
                                <td class="data price">${sgstValue}</td>
                            </tr>
                            <tr>
                                <td class="item data" colspan="2">CGST (2.5%)</td>
                                <td class="data price">${cgstValue}</td>
                            </tr>
                            ${discountRow}
                            <tr>
                                <td colspan="3">---------------------------------------------------------------------------------</td>
                            </tr>
                            <tr>
                                <td class="item data" colspan="2">Total</td>
                                <td class="data price">Rs. ${totalValue}</td>
                            </tr>
                            <tr>
                                <td colspan="3">---------------------------------------------------------------------------------</td>
                            </tr>
                        </table>
                        <br />
                        <br />.
                    </body>
                    <style>
                        @page {
                            size: auto;
                            margin-top:0mm;
                            margin-left: 1mm;
                            margin-right: 1mm;
                            margin-bottom: 30mm;
                            size: portrait;
                        }
                        body {
                            width: 242px;
                        }
                        body *{
                            font-family: 'Franklin Gothic Medium',
                            'Arial Narrow', Arial, sans-serif;
                            font-size: 12px;
                        }
                        .kitchen-name {
                            font-size: 16px;
                            font-weight: bold;
                            margin-bottom: 10px;
                        }
                        .other-details {
                            width: calc(100% - 10px);
                            padding-top: 6px;
                        }
                        .other-details div {
                            padding-bottom: 6px;
                            width: 100%;
                            justify-content: space-between;
                            font-size: 12px;
                        }
                        .other-details .customer {
                            font-size: 14px;
                            font-weight: bold;
                        }
                        .header {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            flex-flow: column;
                        }
                        .additonal-details {
                            display: flex;
                            width: calc(100% - 10px);
                            justify-content: space-between;
                            margin-left: 10px;
                            padding-right: 10px;
                        }
                        th {
                            text-align: left;
                            padding-left: 6px;
                        }
                        tr {
                            padding-top: 3px;
                        }
                        td.item {
                            width: 144px;
                        }
                        td.data {
                            padding-left: 6px;
                        }
                        td.data.price {
                            font-size: 14px;
                        }
                    </style>
                </html>`;
    }
}
