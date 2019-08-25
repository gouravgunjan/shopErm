import { BillDetailItem } from '../../../shared/models/ui-models/bill-detail-item';
import { TotalCal } from '../../../shared/utils/total-cal.util';
import * as moment from 'moment';

export class PrintTemplateProcessor {

    private static getItemSingleRow(itemName: string, itemQuantity: number, itemPrice: number): string {
        return `<tr><td class="data item">${itemName}</td><td class="data">${itemQuantity}</td><td  class="data">${itemPrice}</td></tr>`;
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

    static getCompleteBillHtmlString(billDetailRows: BillDetailItem[], discount: number): string {
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
                            <span class="kitchen-name">Noco Kitchen</span>
                            <div class="additonal-details">
                                <span>Bill No. ${billNumber}</span>
                                <span>Date: ${formattedDate}</span>
                            </div>
                            <span>----------------------------------------------------------------</span>
                        </div>
                        <table>
                            <tr>
                                <th class="item">Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                            </tr>
                            <tr>
                                <td colspan="3">----------------------------------------------------------------</td>
                            </tr>
                            ${stringItemRows}
                            <tr>
                                <td class="seperator" colspan="3">----------------------------------------------------------------</td>
                            </tr>
                            <tr>
                                <td class="item data" colspan="2">SGST (2.5%)</td>
                                <td class="data">${sgstValue}</td>
                            </tr>
                            <tr>
                                <td class="item data" colspan="2">CGST (2.5%)</td>
                                <td class="data">${cgstValue}</td>
                            </tr>
                            ${discountRow}
                            <tr>
                                <td colspan="3">----------------------------------------------------------------</td>
                            </tr>
                            <tr>
                                <td class="item data" colspan="2">Total</td>
                                <td class="data">Rs. ${totalValue}</td>
                            </tr>
                            <tr>
                                <td colspan="3">----------------------------------------------------------------</td>
                            </tr>
                        </table>
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
                            font-size: 11px;
                        }
                        .kitchen-name {
                            font-size: 14px;
                            font-weight: bold;
                            margin-bottom: 10px;
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
                        td.item {
                            width: 150px;
                        }
                        td.data {
                            padding-left: 6px;
                        }
                    </style>
                </html>`;
    }
}
