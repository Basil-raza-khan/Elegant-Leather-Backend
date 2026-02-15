import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private logsService: LogsService,
  ) {}

  async create(
    userId: string,
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

    const savedCategory = await category.save();
    await this.logsService.createLog('create', 'category', (savedCategory._id as any).toString(), userId, null, (savedCategory as any).toObject());
    return savedCategory;
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
    userId: string,
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    imageFile?: Express.Multer.File,
    videoFile?: Express.Multer.File,
  ): Promise<Category | null> {
    const category = await this.findOne(id);
    const oldCategory = (category as any).toObject();

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
        await this.cloudinaryService.deleteAsset(category.videoPublicId, 'video');
      }

      const uploadedVideo = await this.cloudinaryService.uploadVideo(videoFile);
      updateData.videoUrl = uploadedVideo.url;
      updateData.videoPublicId = uploadedVideo.public_id;
    }

    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (updatedCategory) {
      await this.logsService.createLog('update', 'category', id, userId, oldCategory, (updatedCategory as any).toObject());
    }
    return updatedCategory;
  }

  async remove(userId: string, id: string): Promise<Category | null> {
    const category = await this.findOne(id);
    const oldCategory = (category as any).toObject();

    if (category.imagePublicId) {
      await this.cloudinaryService.deleteAsset(category.imagePublicId);
    }

    if (category.videoPublicId) {
      await this.cloudinaryService.deleteAsset(category.videoPublicId, 'video');
    }

    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    if (updatedCategory) {
      await this.logsService.createLog('delete', 'category', id, userId, oldCategory, updatedCategory.toObject());
    }
    return updatedCategory;
  }

  async hardDelete(userId: string, id: string): Promise<Category | null> {
    const category = await this.findOne(id);
    const oldCategory = (category as any).toObject();

    if (category.imagePublicId) {
      await this.cloudinaryService.deleteAsset(category.imagePublicId);
    }

    if (category.videoPublicId) {
      await this.cloudinaryService.deleteAsset(category.videoPublicId, 'video');
    }

    const deletedCategory = await this.categoryModel.findByIdAndDelete(id).exec();
    if (deletedCategory) {
      await this.logsService.createLog('delete', 'category', id, userId, oldCategory, null);
    }
    return deletedCategory;
  }

  async count(): Promise<number> {
    return this.categoryModel.countDocuments({ isActive: true }).exec();
  }
}