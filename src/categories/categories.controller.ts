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
  Request,
  UseGuards,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
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
    @Request() req,
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    if (!files.image || files.image.length === 0) {
      throw new BadRequestException('Image file is required');
    }

    return this.categoriesService.create(
      req.user.userId,
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
  @UseGuards(JwtAuthGuard, AdminGuard)
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
    @Request() req,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFiles()
    files?: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    return this.categoriesService.update(
      req.user.userId,
      id,
      updateCategoryDto,
      files?.image ? files.image[0] : undefined,
      files?.video ? files.video[0] : undefined,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Request() req) {
    return this.categoriesService.remove(req.user.userId, id);
  }

  @Delete(':id/permanent')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async hardDelete(@Param('id') id: string, @Request() req) {
    return this.categoriesService.hardDelete(req.user.userId, id);
  }

  @Get('count/total')
  async getCount() {
    const count = await this.categoriesService.count();
    return { count };
  }
}