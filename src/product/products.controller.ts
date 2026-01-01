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
import { ProductsService } from './products.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';

@Controller('products')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    @Post()
    @UseInterceptors(FilesInterceptor('images'))
    async create(
        @Body() createProductDto: { title: string; description: string; category: string },
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('At least one image is required');
        }

        const mainImage = await this.cloudinaryService.uploadImage(files[0]);
        const variants = files.length > 1 ? await this.cloudinaryService.uploadMultipleImages(files.slice(1)) : [];

        return this.productsService.create({
            ...createProductDto,
            mainImage,
            variants,
        });
    }

    @Get()
    findAll() {
        return this.productsService.findAll();
    }

    @Get('category/:category')
    findByCategory(@Param('category') category: string) {
        return this.productsService.findByCategory(category);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Patch(':id')
    @UseInterceptors(FilesInterceptor('images'))
    async update(
        @Param('id') id: string,
        @Body() updateProductDto: Partial<{ title: string; description: string; category: string }>,
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        let updateData: Partial<{
            title: string;
            description: string;
            category: string;
            mainImage: string;
            variants: string[];
        }> = { ...updateProductDto };

        if (files && files.length > 0) {
            const mainImage = await this.cloudinaryService.uploadImage(files[0]);
            const variants = files.length > 1 ? await this.cloudinaryService.uploadMultipleImages(files.slice(1)) : [];
            updateData.mainImage = mainImage;
            updateData.variants = variants;
        }

        return this.productsService.update(id, updateData);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productsService.remove(id);
    }
}