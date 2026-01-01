import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { Department, DepartmentSchema } from '../departments/schemas/department.schema';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { DepartmentsModule } from '../departments/departments.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Department.name, schema: DepartmentSchema }]),
    AuditLogsModule,
    DepartmentsModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {} 