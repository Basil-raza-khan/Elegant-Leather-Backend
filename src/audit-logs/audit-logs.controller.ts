import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  findAll(@Query('userId') userId?: string, @Query('entity') entity?: string, @Query('entityId') entityId?: string) {
    if (userId) {
      return this.auditLogsService.findByUser(userId);
    } else if (entity && entityId) {
      return this.auditLogsService.findByEntity(entity, entityId);
    } else {
      return this.auditLogsService.findAll();
    }
  }
}