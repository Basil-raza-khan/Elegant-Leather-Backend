import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeatherDocument = Leather & Document;

interface MediaAsset {
    url: string;
    public_id: string;
}

interface VariantMedia {
    images: MediaAsset[];
    videos: MediaAsset[];
}

interface MediaSection {
    main?: MediaAsset;
    variants: VariantMedia[];
}

@Schema({ timestamps: true })
export class Leather {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop()
    inStock: number;

    @Prop({ default: "0" })
    ratings: string;

    @Prop({ default: "0" })
    reviewCount: string;

    @Prop({ required: true })
    category: string;

    @Prop({ type: [String], default: [] })
    tags: string[];

    @Prop({ type: Object, required: true })
    media: {
        images: MediaSection;
        videos: MediaSection;
    };

    @Prop()
    weightRange?: string;

    @Prop()
    temper?: string;

    @Prop()
    oilContent?: string;

    @Prop()
    leatherType?: string;

    @Prop()
    texture?: string;

    @Prop()
    grading?: string;

    @Prop()
    finish?: string;

    @Prop()
    collections?: string;
}

export const LeatherSchema = SchemaFactory.createForClass(Leather);