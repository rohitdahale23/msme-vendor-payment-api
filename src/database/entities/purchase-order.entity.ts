import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Vendor } from './vendor.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';
import { Payment } from './payment.entity';

export enum POStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  FULLY_PAID = 'FULLY_PAID',
}

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  poNumber: string;

  @Column('uuid')
  vendorId: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.purchaseOrders, { eager: true })
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column({ type: 'date' })
  poDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'enum', enum: POStatus, default: POStatus.DRAFT })
  status: POStatus;

  @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder, { cascade: true, eager: true })
  items: PurchaseOrderItem[];

  @OneToMany(() => Payment, (payment) => payment.purchaseOrder)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt: Date;
}
