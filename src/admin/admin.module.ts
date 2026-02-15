import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Leather, LeatherSchema } from '../leathers/schemas/leather.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { ContactUs, ContactUsSchema } from '../contact-us/schemas/contact-us.schema';
import { Team, TeamSchema } from '../team/schemas/team.schema';
import { Testimonial, TestimonialSchema } from '../testimonials/schemas/testimonial.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Leather.name, schema: LeatherSchema },
      { name: Category.name, schema: CategorySchema },
      { name: ContactUs.name, schema: ContactUsSchema },
      { name: Team.name, schema: TeamSchema },
      { name: Testimonial.name, schema: TestimonialSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
