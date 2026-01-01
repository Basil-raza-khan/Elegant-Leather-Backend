import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: String, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  action: string; // e.g., CREATE_USER, UPDATE_ORDER

  @Prop({ required: true })
  entity: string; // e.g., User, Order

  @Prop({ required: true })
  entityId: string;

  @Prop({ type: Object })
  oldValue: any;

  @Prop({ type: Object })
  newValue: any;

  @Prop()
  description: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);