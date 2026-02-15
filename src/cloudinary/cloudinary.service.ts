import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

interface UploadedAsset {
    url: string;
    public_id: string;
}

@Injectable()
export class CloudinaryService {
    constructor(private configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }

    async uploadImage(file: Express.Multer.File): Promise<UploadedAsset> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'elegant-leather', resource_type: 'image' },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error('Upload failed'));
                    resolve({ url: result.secure_url, public_id: result.public_id });
                },
            );
            uploadStream.end(file.buffer);
        });
    }

    async uploadImageUrl(file: Express.Multer.File): Promise<string> {
        const result = await this.uploadImage(file);
        return result.url;
    }

    async uploadVideo(file: Express.Multer.File): Promise<UploadedAsset> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'elegant-leather',
                    resource_type: 'video',
                    max_file_size: 100000000, // 100MB limit
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error('Upload failed'));
                    resolve({ url: result.secure_url, public_id: result.public_id });
                },
            );
            uploadStream.end(file.buffer);
        });
    }

    async uploadMultipleImages(files: Express.Multer.File[]): Promise<UploadedAsset[]> {
        const promises = files.map(file => this.uploadImage(file));
        return Promise.all(promises);
    }

    async uploadMultipleImagesUrls(files: Express.Multer.File[]): Promise<string[]> {
        const results = await this.uploadMultipleImages(files);
        return results.map(r => r.url);
    }

    async uploadMultipleVideos(files: Express.Multer.File[]): Promise<UploadedAsset[]> {
        const promises = files.map(file => this.uploadVideo(file));
        return Promise.all(promises);
    }

    async deleteAsset(public_id: string, resource_type?: string): Promise<any> {
        console.log('Attempting to delete Cloudinary asset:', public_id, 'resource_type:', resource_type || 'auto');
        return new Promise((resolve, reject) => {
            const options: any = {};
            if (resource_type) {
                options.resource_type = resource_type;
            }
            cloudinary.uploader.destroy(public_id, options, (error, result) => {
                if (error) {
                    console.error('Error deleting Cloudinary asset:', public_id, error);
                    reject(error);
                } else {
                    console.log('Successfully deleted Cloudinary asset:', public_id, result);
                    resolve(result);
                }
            });
        });
    }

    generateUploadSignature(folder: string = 'elegant-leather', resourceType: string = 'auto') {
        const timestamp = Math.round((new Date).getTime() / 1000);
        const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');
        
        // Create the signature string - parameters must be sorted alphabetically
        const params = {
            folder,
            timestamp
        };
        
        // Sort parameters alphabetically and create signature string
        const sortedParams = Object.keys(params).sort();
        const signatureString = sortedParams.map(key => `${key}=${params[key]}`).join('&') + apiSecret;
        
        // Generate SHA-1 hash
        const crypto = require('crypto');
        const signature = crypto.createHash('sha1').update(signatureString).digest('hex');
        
        return {
            signature,
            timestamp,
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            folder
        };
    }
}