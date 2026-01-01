import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: String, ref: 'User', required: true })
  createdBy: string; // Super Admin ID

  @Prop({ type: String, ref: 'User' })
  assignedTo: string; // Department head (DEPT_ADMIN) ID
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);