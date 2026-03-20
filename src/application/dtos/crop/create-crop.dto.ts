import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCropDto {
  @ApiProperty({
    description: 'Nome da cultura agrícola (único no sistema)',
    example: 'Soja',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty({ message: 'Crop name is required.' })
  @MinLength(2, { message: 'Crop name must have at least 2 characters.' })
  name: string;
}
