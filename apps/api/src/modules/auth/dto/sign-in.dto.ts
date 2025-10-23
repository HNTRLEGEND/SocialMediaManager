import { IsEnum, IsString } from 'class-validator';

export class SignInDto {
  @IsString()
  userId!: string;

  @IsString()
  tenantId!: string;

  @IsEnum(['owner', 'admin', 'member', 'viewer'])
  role!: 'owner' | 'admin' | 'member' | 'viewer';
}
