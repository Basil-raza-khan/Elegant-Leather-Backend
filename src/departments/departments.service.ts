import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
  ) {}

  async create(name: string, createdBy: string): Promise<Department> {
    const department = new this.departmentModel({ name, createdBy });
    return department.save();
  }

  async findAll(): Promise<Department[]> {
    return this.departmentModel.find().populate('assignedTo', 'email firstName lastName').exec();
  }

  async findOne(id: string): Promise<Department | null> {
    return this.departmentModel.findById(id).populate('assignedTo', 'email firstName lastName').exec();
  }

  async update(id: string, name: string): Promise<Department | null> {
    return this.departmentModel.findByIdAndUpdate(id, { name }, { new: true }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.departmentModel.findByIdAndDelete(id).exec();
  }
}