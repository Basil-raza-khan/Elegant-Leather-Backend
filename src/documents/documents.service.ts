import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { Document, DocumentDocument } from './schemas/document.schema';

@Injectable()
export class DocumentsService {
  private genAI: GoogleGenerativeAI;

  constructor(
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
    private configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    this.genAI = new GoogleGenerativeAI(this.configService.get<string>('GEMINI_API_KEY') || '');
  }

  async uploadDocument(file: Express.Multer.File, tags?: string[]): Promise<Document> {
    // Validate file size (20MB limit)
    const maxSize = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 20MB limit');
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/jpeg',
      'image/png',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only PDF, DOCX, DOC, JPG, PNG are allowed');
    }

    try {
      const resourceType =
        file.mimetype.startsWith('image/')
          ? 'image'
          : 'raw';

      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            folder: this.configService.get<string>('CLOUDINARY_FOLDER'),
            public_id: `${Date.now()}-${file.originalname}`,
            type: 'upload',
            access_mode: 'public',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);
      });



      // Use Cloudinary's secure_url which handles the correct URL format for each resource type
      const publicUrl = uploadResult.secure_url;

      // Create title from filename (remove extension and replace underscores/spaces)
      const title = file.originalname.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

      // Save metadata to database
      const document = new this.documentModel({
        title,
        originalFilename: file.originalname,
        publicUrl,
        cloudinaryPublicId: uploadResult.public_id,
        mimeType: file.mimetype,
        size: file.size,
        tags: tags || [],
        uploadedAt: new Date(),
        folder: this.configService.get<string>('CLOUDINARY_FOLDER'),
      });

      return await document.save();
    } catch (error) {
      console.error('Upload error:', error);
      throw new BadRequestException('Failed to upload document');
    }
  }

  async getDocuments(
    page: number = 1,
    limit: number = 20,
    q?: string,
    sort: string = 'uploadedAt',
  ): Promise<{ documents: Document[]; page: number; limit: number; total: number }> {
    const skip = (page - 1) * limit;
    const sortOrder: any = sort === 'uploadedAt' ? { uploadedAt: -1 } : { [sort]: 1 };

    let query = {};
    if (q) {
      query = {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q, 'i')] } },
        ],
      };
    }

    const [documents, total] = await Promise.all([
      this.documentModel.find(query).sort(sortOrder).skip(skip).limit(limit).exec(),
      this.documentModel.countDocuments(query).exec(),
    ]);

    return {
      documents,
      page,
      limit,
      total,
    };
  }

  async getDocumentById(id: string): Promise<Document> {
    const document = await this.documentModel.findById(id).exec();
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async generateTagsForDocument(fileName: string, filePath?: string): Promise<string[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.configService.get<string>('GEMINI_DEVELOPMENT_MODEL') || 'gemini-2.0-flash' });

      const prompt = `Analyze this legal document filename and generate relevant tags for categorization.
      Filename: "${fileName}"
      
      Please provide 3-5 relevant tags that would help categorize this legal document.
      Focus on legal categories, court types, document types, and jurisdictions mentioned.
      Return only the tags as a comma-separated list, no explanations.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const tagsText = response.text().trim();

      // Parse the comma-separated tags
      const tags = tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      return tags.length > 0 ? tags : ['legal-document'];
    } catch (error) {
      console.error('Error generating tags with Gemini:', error);
      // Fallback to basic filename-based tags
      return this.generateBasicTags(fileName);
    }
  }

  private generateBasicTags(fileName: string): string[] {
    const tags: string[] = [];
    const lowerName = fileName.toLowerCase();

    // Court types
    if (lowerName.includes('high court') || lowerName.includes('lahore') || lowerName.includes('islamabad') || lowerName.includes('peshawar') || lowerName.includes('sindh') || lowerName.includes('bahawalpur') || lowerName.includes('multan') || lowerName.includes('rawalpindi')) {
      tags.push('high-court');
    }
    if (lowerName.includes('supreme court') || lowerName.includes('sc')) {
      tags.push('supreme-court');
    }

    // Document types
    if (lowerName.includes('affidavit')) tags.push('affidavit');
    if (lowerName.includes('petition')) tags.push('petition');
    if (lowerName.includes('bail')) tags.push('bail');
    if (lowerName.includes('warrant')) tags.push('warrant');
    if (lowerName.includes('bond') || lowerName.includes('surety')) tags.push('bond');
    if (lowerName.includes('power of attorney') || lowerName.includes('wakalat')) tags.push('power-of-attorney');
    if (lowerName.includes('certificate')) tags.push('certificate');
    if (lowerName.includes('form') || lowerName.includes('proforma')) tags.push('form');
    if (lowerName.includes('notice')) tags.push('notice');
    if (lowerName.includes('summon')) tags.push('summon');

    // Legal categories
    if (lowerName.includes('civil')) tags.push('civil');
    if (lowerName.includes('criminal')) tags.push('criminal');
    if (lowerName.includes('family') || lowerName.includes('divorce')) tags.push('family-law');

    return tags.length > 0 ? tags : ['legal-document'];
  }

  async bulkUploadDocuments(folderPath: string): Promise<{ uploaded: number; failed: number; results: any[] }> {
    const results: any[] = [];
    let uploaded = 0;
    let failed = 0;

    try {
      // Read all files from the folder
      const files = fs.readdirSync(folderPath);

      for (const fileName of files) {
        const filePath = path.join(folderPath, fileName);

        // Skip directories
        if (fs.statSync(filePath).isDirectory()) continue;

        try {
          // Read file
          const fileBuffer = fs.readFileSync(filePath);
          const fileStats = fs.statSync(filePath);

          // Create file object similar to multer
          const file: Express.Multer.File = {
            fieldname: 'file',
            originalname: fileName,
            encoding: '7bit',
            mimetype: this.getMimeType(fileName),
            buffer: fileBuffer,
            size: fileStats.size,
            destination: '',
            filename: fileName,
            path: filePath,
            stream: null as any,
          };

          // Generate tags using Gemini
          const tags = await this.generateTagsForDocument(fileName, filePath);

          // Upload document
          const document = await this.uploadDocument(file, tags);

          results.push({
            fileName,
            status: 'success',
            documentId: (document as any)._id,
            tags,
          });

          uploaded++;
        } catch (error) {
          console.error(`Failed to upload ${fileName}:`, error);
          results.push({
            fileName,
            status: 'failed',
            error: error.message,
          });
          failed++;
        }
      }
    } catch (error) {
      throw new BadRequestException(`Failed to read folder: ${error.message}`);
    }

    return { uploaded, failed, results };
  }

  private getMimeType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  async deleteAllDocumentsInFolder(): Promise<{ deleted: number; failed: number }> {
    const folder = this.configService.get<string>('CLOUDINARY_FOLDER');
    let deleted = 0;
    let failed = 0;

    try {
      // Fetch all documents in the folder from DB
      const documents = await this.documentModel.find({ folder }).exec();

      for (const doc of documents) {
        try {
          // Determine resource type based on mime type
          let resourceType = 'raw';
          if (doc.mimeType.startsWith('image/')) {
            resourceType = 'image';
          } else if (doc.mimeType === 'application/pdf') {
            resourceType = 'raw';
          }

          // Delete from Cloudinary with correct resource type
          const destroyResult = await cloudinary.uploader.destroy(doc.cloudinaryPublicId, { 
            resource_type: resourceType,
            type: 'upload'
          });

          console.log(`Deleted from Cloudinary: ${doc.cloudinaryPublicId}`, destroyResult);

          // Delete from DB only after successful Cloudinary deletion
          await this.documentModel.findByIdAndDelete(doc._id).exec();
          deleted++;
        } catch (error) {
          console.error(`Failed to delete ${doc.title}:`, error);
          failed++;
        }
      }
    } catch (error) {
      console.error('Error deleting all documents:', error);
      throw new BadRequestException('Failed to delete all documents in the folder');
    }

    return { deleted, failed };
  }
}
