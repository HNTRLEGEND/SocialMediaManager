import { IsIn, IsString } from 'class-validator';

const ORG_ROLES = ['owner', 'admin', 'member', 'viewer'] as const;
export type OrgRoleInput = (typeof ORG_ROLES)[number];

export class SignInDto {
  @IsString()
  userId!: string;

  @IsString()
  tenantId!: string;

  @IsIn(ORG_ROLES)
  role!: OrgRoleInput;
}

export const ALLOWED_ORG_ROLES = ORG_ROLES;
