import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Leather } from '../leathers/schemas/leather.schema';
import { Category } from '../categories/schemas/category.schema';
import { ContactUs } from '../contact-us/schemas/contact-us.schema';
import { Team } from '../team/schemas/team.schema';
import { Testimonial } from '../testimonials/schemas/testimonial.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Leather.name) private leatherModel: Model<Leather>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(ContactUs.name) private contactUsModel: Model<ContactUs>,
    @InjectModel(Team.name) private teamModel: Model<Team>,
    @InjectModel(Testimonial.name) private testimonialModel: Model<Testimonial>,
  ) {}

  async getCounts() {
    const [leathersCount, categoriesCount, contactedCount, teamCount, testimonialsCount] = await Promise.all([
      this.leatherModel.countDocuments().exec(),
      this.categoryModel.countDocuments().exec(),
      this.contactUsModel.countDocuments().exec(),
      this.teamModel.countDocuments().exec(),
      this.testimonialModel.countDocuments().exec(),
    ]);

    return {
      leathers: leathersCount,
      categories: categoriesCount,
      contactedPersons: contactedCount,
      teamMembers: teamCount,
      testimonials: testimonialsCount,
    };
  }
}
