import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../users/schemas/user.schema';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const role = user?.role;
    return user && (
      role === UserRole.SUPER_ADMIN || 
      role === UserRole.DEPT_ADMIN || 
      role === 'SUPER ADMIN' || 
      role === 'DEPT ADMIN'
    );
  }
}