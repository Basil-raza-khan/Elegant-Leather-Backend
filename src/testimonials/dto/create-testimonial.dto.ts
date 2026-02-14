import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}
