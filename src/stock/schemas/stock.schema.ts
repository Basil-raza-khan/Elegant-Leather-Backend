import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StockDocument = Stock & Document;

export enum StockType {
  CHEMICAL = 'CHEMICAL',
  LEATHER = 'LEATHER',
}

@Schema({ timestamps: true })
export class Stock {
  @Prop({ required: true, enum: StockType })
  type: StockType;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ type: String, ref: 'Department' })
  departmentId: string; // Which department owns this stock

  @Prop({ type: String, ref: 'User' })
  addedBy: string;

  @Prop()
  unit: string; // kg, liters, etc.
}

export const StockSchema = SchemaFactory.createForClass(Stock);