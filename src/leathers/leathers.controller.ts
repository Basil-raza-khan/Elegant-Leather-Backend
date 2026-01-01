import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
    BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { LeathersService } from './leathers.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';

@Controller('leathers')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class LeathersController {
    constructor(
        private readonly leathersService: LeathersService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    @Post()
    @UseInterceptors(FilesInterceptor('images'))
    async create(
        @Body() createLeatherDto: { title: string; description: string; category: string },
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('At least one image is required');
        }

        const mainImage = await this.cloudinaryService.uploadImage(files[0]);
        const variants = files.length > 1 ? await this.cloudinaryService.uploadMultipleImages(files.slice(1)) : [];

        return this.leathersService.create({
            ...createLeatherDto,
            mainImage,
            variants,
        });
    }

    @Get()
    findAll() {
        return this.leathersService.findAll();
    }

    @Get('category/:category')
    findByCategory(@Param('category') category: string) {
        return this.leathersService.findByCategory(category);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.leathersService.findOne(id);
    }

    @Patch(':id')
    @UseInterceptors(FilesInterceptor('images'))
    async update(
        @Param('id') id: string,
        @Body() updateLeatherDto: Partial<{ title: string; description: string; category: string }>,
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        let updateData: Partial<{
            title: string;
            description: string;
            category: string;
            mainImage: string;
            variants: string[];
        }> = { ...updateLeatherDto };

        if (files && files.length > 0) {
            const mainImage = await this.cloudinaryService.uploadImage(files[0]);
            const variants = files.length > 1 ? await this.cloudinaryService.uploadMultipleImages(files.slice(1)) : [];
            updateData.mainImage = mainImage;
            updateData.variants = variants;
        }

        return this.leathersService.update(id, updateData);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.leathersService.remove(id);
    }
}