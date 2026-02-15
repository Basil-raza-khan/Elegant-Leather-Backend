import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async create(
    @Request() req,
    @Body() createTestimonialDto: CreateTestimonialDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return this.testimonialsService.create(req.user.userId, createTestimonialDto, file);
  }

  @Get()
  async findAll() {
    return this.testimonialsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.testimonialsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateTestimonialDto: UpdateTestimonialDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.testimonialsService.update(req.user.userId, id, updateTestimonialDto, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Request() req) {
    return this.testimonialsService.remove(req.user.userId, id);
  }

  @Delete(':id/permanent')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async hardDelete(@Param('id') id: string, @Request() req) {
    return this.testimonialsService.hardDelete(req.user.userId, id);
  }

  @Get('count/total')
  async getCount() {
    const count = await this.testimonialsService.count();
    return { count };
  }
}
