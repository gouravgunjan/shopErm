import { BillDetailItem } from '../models/ui-models/bill-detail-item';

export interface TotalCalResult {
    totalWithoutGst: number;
    total: number;
    sgst: number;
    cgst: number;
    discount: number;
}

export class TotalCal {
    static calcTotalFromDetailItems(entries: BillDetailItem[], discount?: number) {
        let total = 0;
        let calcDiscount = 0;
        entries.forEach(item => {
            total += item.price;
        });
        let newTotal = total > 0 ? total + total * 0.05 : 0;
        if (discount > 0) {
            calcDiscount = newTotal * discount / 100;
            newTotal -= calcDiscount;
        }
        return <TotalCalResult> {
            totalWithoutGst: total,
            total: newTotal,
            sgst: Math.ceil(total * 0.025),
            cgst: Math.ceil(total * 0.025),
            discount: calcDiscount
        };
    }
}
