import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument } from 'mongoose';

export type DocumentDocument = Document & MongooseDocument;

@Schema({ timestamps: true })
export class Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  originalFilename: string;

  @Prop({ required: true })
  publicUrl: string;

  @Prop({ required: true })
  cloudinaryPublicId: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true })
  uploadedAt: Date;

  @Prop({ required: true })
  folder: string;
}

export const DocumentSchema = SchemaFactory.createForClass(Document);