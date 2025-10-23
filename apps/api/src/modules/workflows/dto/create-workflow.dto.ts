import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateWorkflowDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsObject({ each: true })
  nodes!: Array<Record<string, unknown>>;
}
