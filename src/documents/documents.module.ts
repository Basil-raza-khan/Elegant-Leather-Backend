import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document, DocumentSchema } from './schemas/document.schema';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
    MongooseModule.forFeature([{ name: Document.name, schema: DocumentSchema }]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}