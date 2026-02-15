import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Testimonial, TestimonialDocument } from './schemas/testimonial.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectModel(Testimonial.name) private testimonialModel: Model<TestimonialDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private logsService: LogsService,
  ) {}

  async create(
    userId: string,
    createTestimonialDto: CreateTestimonialDto,
    imageFile: Express.Multer.File,
  ): Promise<Testimonial> {
    if (!imageFile) {
      throw new Error('Image file is required');
    }

    const uploadedAsset = await this.cloudinaryService.uploadImage(imageFile);

    const testimonial = new this.testimonialModel({
      ...createTestimonialDto,
      imageUrl: uploadedAsset.url,
      imagePublicId: uploadedAsset.public_id,
    });

    const savedTestimonial = await testimonial.save();
    await this.logsService.createLog('create', 'testimonial', (savedTestimonial._id as any).toString(), userId, null, (savedTestimonial as any).toObject());
    return savedTestimonial;
  }

  async findAll(): Promise<Testimonial[]> {
    return this.testimonialModel.find({ isActive: true }).exec();
  }

  async findOne(id: string): Promise<Testimonial> {
    const testimonial = await this.testimonialModel.findById(id).exec();
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
    return testimonial;
  }

  async update(
    userId: string,
    id: string,
    updateTestimonialDto: UpdateTestimonialDto,
    imageFile?: Express.Multer.File,
  ): Promise<Testimonial | null> {
    const testimonial = await this.findOne(id);
    const oldTestimonial = (testimonial as any).toObject();

    let updateData: any = { ...updateTestimonialDto };

    if (imageFile) {
      if (testimonial.imagePublicId) {
        await this.cloudinaryService.deleteAsset(testimonial.imagePublicId);
      }

      const uploadedAsset = await this.cloudinaryService.uploadImage(imageFile);
      updateData.imageUrl = uploadedAsset.url;
      updateData.imagePublicId = uploadedAsset.public_id;
    }

    const updatedTestimonial = await this.testimonialModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (updatedTestimonial) {
      await this.logsService.createLog('update', 'testimonial', id, userId, oldTestimonial, (updatedTestimonial as any).toObject());
    }
    return updatedTestimonial;
  }

  async remove(userId: string, id: string): Promise<Testimonial | null> {
    const testimonial = await this.findOne(id);
    const oldTestimonial = (testimonial as any).toObject();

    if (testimonial.imagePublicId) {
      await this.cloudinaryService.deleteAsset(testimonial.imagePublicId);
    }

    const deletedTestimonial = await this.testimonialModel.findByIdAndDelete(id).exec();
    if (deletedTestimonial) {
      await this.logsService.createLog('delete', 'testimonial', id, userId, oldTestimonial, null);
    }
    return deletedTestimonial;
  }

  async hardDelete(userId: string, id: string): Promise<Testimonial | null> {
    const testimonial = await this.findOne(id);
    const oldTestimonial = (testimonial as any).toObject();

    if (testimonial.imagePublicId) {
      await this.cloudinaryService.deleteAsset(testimonial.imagePublicId);
    }

    const deletedTestimonial = await this.testimonialModel.findByIdAndDelete(id).exec();
    if (deletedTestimonial) {
      await this.logsService.createLog('delete', 'testimonial', id, userId, oldTestimonial, null);
    }
    return deletedTestimonial;
  }

  async count(): Promise<number> {
    return this.testimonialModel.countDocuments({ isActive: true }).exec();
  }
}
