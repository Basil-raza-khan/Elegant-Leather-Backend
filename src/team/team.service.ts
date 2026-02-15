import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team, TeamDocument } from './schemas/team.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private logsService: LogsService,
  ) {}

  async create(
    userId: string,
    createTeamDto: CreateTeamDto,
    imageFile: Express.Multer.File,
  ): Promise<Team> {
    if (!imageFile) {
      throw new Error('Image file is required');
    }

    // Upload image to Cloudinary
    const uploadedAsset = await this.cloudinaryService.uploadImage(imageFile);

    // Create team member with image URL and public_id
    const team = new this.teamModel({
      ...createTeamDto,
      imageUrl: uploadedAsset.url,
      imagePublicId: uploadedAsset.public_id,
    });

    const savedTeam = await team.save();
    await this.logsService.createLog('create', 'team', (savedTeam._id as any).toString(), userId, null, (savedTeam as any).toObject());
    return savedTeam;
  }

  async findAll(): Promise<Team[]> {
    return this.teamModel.find({ isActive: true }).exec();
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamModel.findById(id).exec();
    if (!team) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }
    return team;
  }

  async update(
    userId: string,
    id: string,
    updateTeamDto: UpdateTeamDto,
    imageFile?: Express.Multer.File,
  ): Promise<Team | null> {
    const team = await this.findOne(id);
    const oldTeam = (team as any).toObject();

    let updateData: any = { ...updateTeamDto };

    // If new image is provided, delete old one and upload new one
    if (imageFile) {
      // Delete old image from Cloudinary
      if (team.imagePublicId) {
        await this.cloudinaryService.deleteAsset(team.imagePublicId);
      }

      // Upload new image
      const uploadedAsset = await this.cloudinaryService.uploadImage(imageFile);
      updateData.imageUrl = uploadedAsset.url;
      updateData.imagePublicId = uploadedAsset.public_id;
    }

    const updatedTeam = await this.teamModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (updatedTeam) {
      await this.logsService.createLog('update', 'team', id, userId, oldTeam, (updatedTeam as any).toObject());
    }
    return updatedTeam;
  }

  async remove(userId: string, id: string): Promise<Team | null> {
    const team = await this.findOne(id);
    const oldTeam = (team as any).toObject();

    // Delete image from Cloudinary
    if (team.imagePublicId) {
      await this.cloudinaryService.deleteAsset(team.imagePublicId);
    }

    // Hard delete
    const deletedTeam = await this.teamModel.findByIdAndDelete(id).exec();
    if (deletedTeam) {
      await this.logsService.createLog('delete', 'team', id, userId, oldTeam, null);
    }
    return deletedTeam;
  }

  async hardDelete(userId: string, id: string): Promise<Team | null> {
    const team = await this.findOne(id);
    const oldTeam = (team as any).toObject();

    // Delete image from Cloudinary
    if (team.imagePublicId) {
      await this.cloudinaryService.deleteAsset(team.imagePublicId);
    }

    // Hard delete
    const deletedTeam = await this.teamModel.findByIdAndDelete(id).exec();
    if (deletedTeam) {
      await this.logsService.createLog('delete', 'team', id, userId, oldTeam, null);
    }
    return deletedTeam;
  }

  async count(): Promise<number> {
    return this.teamModel.countDocuments({ isActive: true }).exec();
  }
}
