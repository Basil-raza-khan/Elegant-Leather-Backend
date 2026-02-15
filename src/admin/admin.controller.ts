import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/counts')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getCounts() {
    return this.adminService.getCounts();
  } 
}
