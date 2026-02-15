import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LogDocument = Log & Document;

@Schema({ timestamps: true })
export class Log {
  @Prop({ required: true })
  action: string; // 'create', 'update', 'delete'

  @Prop({ required: true })
  entityType: string; // 'leather', 'category', 'team', 'testimonial', 'user'

  @Prop({ required: true })
  entityId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: Object })
  oldData?: any;

  @Prop({ type: Object })
  newData?: any;
}

export const LogSchema = SchemaFactory.createForClass(Log);