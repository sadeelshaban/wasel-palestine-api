import { SetMetadata } from '@nestjs/common';

export const REPORTS_ROLES_KEY = 'reports_roles';
export const ReportsRoles = (...roles: string[]) => SetMetadata(REPORTS_ROLES_KEY, roles);
