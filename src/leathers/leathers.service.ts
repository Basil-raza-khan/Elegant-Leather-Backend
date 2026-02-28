import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Leather, LeatherDocument } from './schemas/leather.schema';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class LeathersService {
    constructor(
        @InjectModel(Leather.name) private leatherModel: Model<LeatherDocument>,
        private logsService: LogsService,
    ) { }

    async create(createLeatherDto: {
        name: string;
        description?: string;
        inStock?: number;
        ratings?: string;
        reviewCount?: string;
        category: string;
        tags?: string[];
        media: any;
        weightRange?: string;
        temper?: string;
        oilContent?: string;
        leatherType?: string;
        texture?: string;
        grading?: string;
        finish?: string;
        collections?: string;
    }, userId: string): Promise<Leather> {
        try {
            // console.log('Creating leather model with data:', createLeatherDto);
            const createdLeather = new this.leatherModel(createLeatherDto);
            // console.log('Leather model created, saving...');
            const savedLeather = await createdLeather.save();
            // console.log('Leather saved, creating log...');
            const logResult = await this.logsService.createLog('create', 'leather', (savedLeather._id as any).toString(), userId, null, (savedLeather as any).toObject());
            if (logResult) {
                console.log('Log created successfully');
            } else {
                console.log('Log creation failed, but continuing');
            }
            return savedLeather;
        } catch (error) {
            console.error('Error in leather service create:', error);
            throw error;
        }
    }

    async count(): Promise<number> {
        return this.leatherModel.countDocuments().exec();
    }

    async findAll(): Promise<Leather[]> {
        return this.leatherModel.find().exec();
    }

    async findByCategory(category: string): Promise<Leather[]> {
        return this.leatherModel.find({ category }).exec();
    }

    async findOne(id: string): Promise<Leather | null> {
        return this.leatherModel.findById(id).exec();
    }

    async update(id: string, updateLeatherDto: Partial<{
        name: string;
        description?: string;
        inStock?: number;
        ratings?: string;
        reviewCount?: string;
        category: string;
        tags?: string[];
        media: any;
        weightRange?: string;
        temper?: string;
        oilContent?: string;
        leatherType?: string;
        texture?: string;
        grading?: string;
        finish?: string;
        collections?: string;
    }>, userId: string): Promise<Leather | null> {
        const oldLeather = await this.leatherModel.findById(id).exec();
        const updatedLeather = await this.leatherModel.findByIdAndUpdate(id, updateLeatherDto, { new: true }).exec();
        if (updatedLeather) {
            await this.logsService.createLog('update', 'leather', id, userId, oldLeather?.toObject(), updatedLeather.toObject());
        }
        return updatedLeather;
    }

    async remove(id: string, userId: string): Promise<Leather | null> {
        const deletedLeather = await this.leatherModel.findByIdAndDelete(id).exec();
        if (deletedLeather) {
            await this.logsService.createLog('delete', 'leather', id, userId, deletedLeather.toObject(), null);
        }
        return deletedLeather;
    }
}