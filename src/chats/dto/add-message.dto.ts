import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddMessageDto {
  @IsString()
  @IsNotEmpty()
  question: string;
}