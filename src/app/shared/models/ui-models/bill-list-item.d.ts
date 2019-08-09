export interface BillListItem {
    billEntryId: string;
    currentTotalCost?: number;
    startTime: Date;
    customerType: string;
    isSelected?: boolean;
}