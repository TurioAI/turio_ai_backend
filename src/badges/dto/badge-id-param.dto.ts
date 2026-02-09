import { IsString, IsUUID } from 'class-validator';

export class BadgeIdParamDto {
  @IsString()
  @IsUUID()
  id: string;
}
