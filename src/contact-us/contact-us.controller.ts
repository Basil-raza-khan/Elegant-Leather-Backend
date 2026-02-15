import { Controller, Get, Post, Body, UseGuards, UsePipes, ValidationPipe, Delete, Param, Req } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createContactUsDto: CreateContactUsDto) {
    const contact = await this.contactUsService.create(createContactUsDto);
    return { message: 'Contact form submitted successfully', contact };
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll() {
    const contacts = await this.contactUsService.findAll();
    return { count: contacts.length, data: contacts };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.contactUsService.remove(req.user.userId, id);
    return { message: 'Contact form entry deleted successfully' };
  }   
}