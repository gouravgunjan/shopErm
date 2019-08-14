export interface BillListItem {
    billEntryId: number;
    currentTotalCost?: number;
    startTime: Date;
    customerType: string;
    isSelected?: boolean;
    isOverdue?: boolean;
}