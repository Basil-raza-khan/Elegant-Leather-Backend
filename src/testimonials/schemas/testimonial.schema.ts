import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TestimonialDocument = Testimonial & Document;

@Schema({ timestamps: true })
export class Testimonial {
  @Prop({ required: true })
  clientName: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  imagePublicId: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);
