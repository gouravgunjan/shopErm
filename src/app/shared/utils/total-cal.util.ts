import { BillDetailItem } from '../models/ui-models/bill-detail-item';

export interface TotalCalResult {
    total: number;
    sgst: number;
    cgst: number;
    discount: number;
}

export class TotalCal {
    static calcTotalFromDetailItems(entries: BillDetailItem[], discount?: number) {
        let total = 0;
        entries.forEach(item => {
            total += item.price;
        });
        if (discount > 0) {
            total -= total * discount / 100;
        }
        return <TotalCalResult> {
            total: total,
            sgst: Math.ceil(total * 0.025),
            cgst: Math.ceil(total * 0.025),
            discount: discount
        };
    }
}
