import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(createOrderDto: { title: string; description?: string; createdBy: string }): Promise<Order> {
    const order = new this.orderModel(createOrderDto);
    return order.save();
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().populate('currentDepartment assignedTo createdBy').exec();
  }

  async findByDepartment(departmentId: string): Promise<Order[]> {
    return this.orderModel.find({ currentDepartment: departmentId }).populate('assignedTo').exec();
  }

  async findOne(id: string): Promise<Order | null> {
    return this.orderModel.findById(id).populate('currentDepartment assignedTo createdBy').exec();
  }

  async updateStatus(id: string, status: OrderStatus, reason?: string, nextDepartment?: string, machine?: string): Promise<Order | null> {
    const updateData: any = { status };
    if (reason) updateData.reason = reason;
    if (nextDepartment) updateData.nextDepartment = nextDepartment;
    if (machine) updateData.machine = machine;
    return this.orderModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async assignToDepartment(id: string, departmentId: string): Promise<Order | null> {
    return this.orderModel.findByIdAndUpdate(id, { currentDepartment: departmentId, assignedTo: null }, { new: true }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.orderModel.findByIdAndDelete(id).exec();
  }
}