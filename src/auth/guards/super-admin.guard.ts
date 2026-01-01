import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../users/schemas/user.schema';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user && user.role === UserRole.SUPER_ADMIN;
  }
}