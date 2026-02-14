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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() createTestimonialDto: CreateTestimonialDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return this.testimonialsService.create(createTestimonialDto, file);
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
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateTestimonialDto: UpdateTestimonialDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.testimonialsService.update(id, updateTestimonialDto, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.OK)
  async hardDelete(@Param('id') id: string) {
    return this.testimonialsService.hardDelete(id);
  }

  @Get('count/total')
  async getCount() {
    const count = await this.testimonialsService.count();
    return { count };
  }
}
