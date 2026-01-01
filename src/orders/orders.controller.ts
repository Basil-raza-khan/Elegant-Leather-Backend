import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus } from './schemas/order.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: { title: string; description?: string }, @Request() req) {
    return this.ordersService.create({ ...createOrderDto, createdBy: req.user.userId });
  }

  @Get()
  findAll(@Request() req) {
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return this.ordersService.findAll();
    } else {
      return this.ordersService.findByDepartment(req.user.departmentId);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: { status: OrderStatus; reason?: string; nextDepartment?: string; machine?: string },
    @Request() req
  ) {
    // Allow department admin to update if assigned, super admin always
    return this.ordersService.updateStatus(id, updateDto.status, updateDto.reason, updateDto.nextDepartment, updateDto.machine);
  }

  @Patch(':id/assign')
  assignToDepartment(@Param('id') id: string, @Body() assignDto: { departmentId: string; assignedTo: string }) {
    return this.ordersService.assignToDepartment(id, assignDto.departmentId, assignDto.assignedTo);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}