import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockType } from './schemas/stock.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  addStock(@Body() createStockDto: { type: StockType; name: string; quantity: number; unit?: string }, @Request() req) {
    const departmentId = req.user.role === UserRole.SUPER_ADMIN ? createStockDto['departmentId'] : req.user.departmentId;
    return this.stockService.addStock({ ...createStockDto, departmentId, addedBy: req.user.userId });
  }

  @Get()
  findAll(@Request() req, @Query('type') type?: StockType) {
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return type ? this.stockService.findByType(type) : this.stockService.findAll();
    } else {
      return type ? this.stockService.findByType(type, req.user.departmentId) : this.stockService.findByDepartment(req.user.departmentId);
    }
  }

  @Patch(':id/quantity')
  updateQuantity(@Param('id') id: string, @Body() updateDto: { quantity: number }) {
    return this.stockService.updateQuantity(id, updateDto.quantity);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockService.remove(id);
  }
}