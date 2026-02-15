import { IsString, IsOptional, IsArray, IsNotEmpty, IsNumber, IsObject } from 'class-validator';

export class CreateLeatherDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    inStock?: number;

    @IsNumber()
    @IsOptional()
    ratings?: number;

    @IsNumber()
    @IsOptional()
    reviewCount?: number;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsObject()
    @IsOptional()
    media?: any;

    @IsString()
    @IsOptional()
    weightRange?: string;

    @IsString()
    @IsOptional()
    temper?: string;

    @IsString()
    @IsOptional()
    oilContent?: string;

    @IsString()
    @IsOptional()
    leatherType?: string;

    @IsString()
    @IsOptional()
    texture?: string;

    @IsString()
    @IsOptional()
    grading?: string;

    @IsString()
    @IsOptional()
    finish?: string;

    @IsString()
    @IsOptional()
    collections?: string;
}