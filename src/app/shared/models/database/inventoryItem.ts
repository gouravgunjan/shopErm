import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class InventoryItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 100
    })
    itemName: string;

    @Column()
    itemWeightInKgs: number;

    @Column()
    itemPrice: number;

    @Column()
    dateOfPurchase: Date;

    @Column()
    timeStamp: Date;
}