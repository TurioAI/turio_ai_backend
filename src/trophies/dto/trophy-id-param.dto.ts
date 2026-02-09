import { IsString, IsUUID } from 'class-validator';

export class TrophyIdParamDto {
  @IsString()
  @IsUUID()
  id: string;
}
