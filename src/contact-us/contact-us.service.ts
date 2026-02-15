import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactUs, ContactUsDocument } from './schemas/contact-us.schema';
import { LogsService } from 'src/logs/logs.service';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectModel(ContactUs.name) private contactUsModel: Model<ContactUsDocument>,
    private logsService: LogsService,
    
  ) {}

  async create(createContactUsDto: {
    name: string;
    lastname: string;
    email: string;
    message: string;
  }): Promise<ContactUs> {
    const createdContact = new this.contactUsModel(createContactUsDto);
    return createdContact.save();
  }

  async findAll(): Promise<ContactUs[]> {
    return this.contactUsModel.find().sort({ createdAt: -1 }).exec();
  }

  async remove(userId: string, id: string): Promise<ContactUs | null> {
    const deletedContact = await this.contactUsModel.findByIdAndDelete(id).exec();
    if (deletedContact) {
      await this.logsService.createLog('delete', 'contact-us', id, userId, deletedContact, null);
    }
    return deletedContact;
  }
}