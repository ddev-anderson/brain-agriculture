import { IsInt, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHarvestDto {
  @ApiProperty({
    description: 'Ano agrícola da safra',
    example: 2025,
    minimum: 1900,
    maximum: 2100,
  })
  @IsInt({ message: 'Year must be an integer.' })
  @IsNotEmpty({ message: 'Year is required.' })
  @Min(1900)
  @Max(2100)
  year: number;
}
