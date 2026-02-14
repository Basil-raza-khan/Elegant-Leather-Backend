import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    imageFile: Express.Multer.File,
    videoFile?: Express.Multer.File,
  ): Promise<Category> {
    if (!imageFile) {
      throw new Error('Image file is required');
    }

    const uploadedImage = await this.cloudinaryService.uploadImage(imageFile);

    let uploadedVideo: any = null;
    if (videoFile) {
      uploadedVideo = await this.cloudinaryService.uploadVideo(videoFile);
    }

    const category = new this.categoryModel({
      ...createCategoryDto,
      imageUrl: uploadedImage.url,
      imagePublicId: uploadedImage.public_id,
      ...(uploadedVideo && {
        videoUrl: uploadedVideo.url,
        videoPublicId: uploadedVideo.public_id,
      }),
    });

    return category.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find({ isActive: true }).exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    imageFile?: Express.Multer.File,
    videoFile?: Express.Multer.File,
  ): Promise<Category | null> {
    const category = await this.findOne(id);

    let updateData: any = { ...updateCategoryDto };

    if (imageFile) {
      if (category.imagePublicId) {
        await this.cloudinaryService.deleteAsset(category.imagePublicId);
      }

      const uploadedImage = await this.cloudinaryService.uploadImage(imageFile);
      updateData.imageUrl = uploadedImage.url;
      updateData.imagePublicId = uploadedImage.public_id;
    }

    if (videoFile) {
      if (category.videoPublicId) {
        await this.cloudinaryService.deleteAsset(category.videoPublicId);
      }

      const uploadedVideo = await this.cloudinaryService.uploadVideo(videoFile);
      updateData.videoUrl = uploadedVideo.url;
      updateData.videoPublicId = uploadedVideo.public_id;
    }

    return this.categoryModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Category | null> {
    const category = await this.findOne(id);

    if (category.imagePublicId) {
      await this.cloudinaryService.deleteAsset(category.imagePublicId);
    }

    if (category.videoPublicId) {
      await this.cloudinaryService.deleteAsset(category.videoPublicId);
    }

    return this.categoryModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
  }

  async hardDelete(id: string): Promise<Category | null> {
    const category = await this.findOne(id);

    if (category.imagePublicId) {
      await this.cloudinaryService.deleteAsset(category.imagePublicId);
    }

    if (category.videoPublicId) {
      await this.cloudinaryService.deleteAsset(category.videoPublicId);
    }

    return this.categoryModel.findByIdAndDelete(id).exec();
  }

  async count(): Promise<number> {
    return this.categoryModel.countDocuments({ isActive: true }).exec();
  }
}