import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { LogsService } from './logs.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getLogs(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.logsService.getLogs(page, limit);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteLog(@Param('id') id: string) {
    await this.logsService.deleteLog(id);
    return { message: 'Log deleted successfully' };
  }
}