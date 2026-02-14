import { IsString, IsOptional } from 'class-validator';

export class UpdateTestimonialDto {
  @IsString()
  @IsOptional()
  clientName?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  country?: string;
}
