import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'video', maxCount: 1 },
      ],
      {
        limits: { fileSize: 100 * 1024 * 1024 },
      },
    ),
  )
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    if (!files.image || files.image.length === 0) {
      throw new BadRequestException('Image file is required');
    }

    return this.categoriesService.create(
      createCategoryDto,
      files.image[0],
      files.video ? files.video[0] : undefined,
    );
  }

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'video', maxCount: 1 },
      ],
      {
        limits: { fileSize: 100 * 1024 * 1024 },
      },
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFiles()
    files?: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    return this.categoriesService.update(
      id,
      updateCategoryDto,
      files?.image ? files.image[0] : undefined,
      files?.video ? files.video[0] : undefined,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.OK)
  async hardDelete(@Param('id') id: string) {
    return this.categoriesService.hardDelete(id);
  }

  @Get('count/total')
  async getCount() {
    const count = await this.categoriesService.count();
    return { count };
  }
}