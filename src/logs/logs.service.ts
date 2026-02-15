import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log, LogDocument } from './log.schema';

@Injectable()
export class LogsService {
  constructor(
    @InjectModel(Log.name) private logModel: Model<LogDocument>,
  ) {}

  async createLog(
    action: string,
    entityType: string,
    entityId: string,
    userId: string,
    oldData?: any,
    newData?: any,
  ): Promise<Log> {
    const log = new this.logModel({
      action,
      entityType,
      entityId,
      userId,
      oldData,
      newData,
    });
    return log.save();
  }

  async getLogs(page: number = 1, limit: number = 10): Promise<{ logs: Log[]; total: number }> {
    const skip = (page - 1) * limit;
    const logs = await this.logModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
    const total = await this.logModel.countDocuments().exec();
    return { logs, total };
  }

  async deleteLog(id: string): Promise<void> {
    await this.logModel.findByIdAndDelete(id).exec();
  }
}