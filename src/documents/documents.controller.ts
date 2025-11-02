import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import * as path from 'path';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body('tags') tags?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

    const document = await this.documentsService.uploadDocument(file, tagsArray);

    return {
      message: 'Document uploaded successfully',
      document: {
        _id: (document as any)._id,
        title: document.title,
        publicUrl: document.publicUrl,
        mimeType: document.mimeType,
        uploadedAt: document.uploadedAt,
      },
    };
  }

  @Get()
  async getDocuments(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('q') q?: string,
    @Query('sort') sort: string = 'uploadedAt',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      throw new BadRequestException('Invalid page number');
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Invalid limit (1-100)');
    }

    return this.documentsService.getDocuments(pageNum, limitNum, q, sort);
  }

  @Get(':id')
  async getDocumentById(@Param('id') id: string) {
    return this.documentsService.getDocumentById(id);
  }

  @Post('bulk-upload')
  async bulkUploadDocuments(@Body('folderPath') folderPath: string) {
    if (!folderPath) {
      throw new BadRequestException('folderPath is required');
    }

    // Resolve the absolute path
    const absolutePath = path.resolve(folderPath);

    return this.documentsService.bulkUploadDocuments(absolutePath);
  }

  @Delete('delete-all')
  async deleteAllDocumentsInFolder() {
    return this.documentsService.deleteAllDocumentsInFolder();
  }
}