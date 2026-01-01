import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROCESS = 'IN_PROCESS',
  COMPLETED = 'COMPLETED',
  DELIVERED = 'DELIVERED',
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop()
  reason: string; // For pending with reason

  @Prop({ type: String, ref: 'Department' })
  currentDepartment: string;

  @Prop({ type: String, ref: 'User' })
  assignedTo: string; // Department admin

  @Prop({ type: String, ref: 'User' })
  createdBy: string; // Super Admin or whoever

  @Prop()
  nextDepartment: string; // After completion

  @Prop()
  machine: string; // Selected machine
}

export const OrderSchema = SchemaFactory.createForClass(Order);