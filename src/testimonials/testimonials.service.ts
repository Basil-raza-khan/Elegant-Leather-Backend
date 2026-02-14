import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Testimonial, TestimonialDocument } from './schemas/testimonial.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectModel(Testimonial.name) private testimonialModel: Model<TestimonialDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
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

    return testimonial.save();
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
    id: string,
    updateTestimonialDto: UpdateTestimonialDto,
    imageFile?: Express.Multer.File,
  ): Promise<Testimonial | null> {
    const testimonial = await this.findOne(id);

    let updateData: any = { ...updateTestimonialDto };

    if (imageFile) {
      if (testimonial.imagePublicId) {
        await this.cloudinaryService.deleteAsset(testimonial.imagePublicId);
      }

      const uploadedAsset = await this.cloudinaryService.uploadImage(imageFile);
      updateData.imageUrl = uploadedAsset.url;
      updateData.imagePublicId = uploadedAsset.public_id;
    }

    return this.testimonialModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Testimonial | null> {
    const testimonial = await this.findOne(id);

    if (testimonial.imagePublicId) {
      await this.cloudinaryService.deleteAsset(testimonial.imagePublicId);
    }

    return this.testimonialModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
  }

  async hardDelete(id: string): Promise<Testimonial | null> {
    const testimonial = await this.findOne(id);

    if (testimonial.imagePublicId) {
      await this.cloudinaryService.deleteAsset(testimonial.imagePublicId);
    }

    return this.testimonialModel.findByIdAndDelete(id).exec();
  }

  async count(): Promise<number> {
    return this.testimonialModel.countDocuments({ isActive: true }).exec();
  }
}
