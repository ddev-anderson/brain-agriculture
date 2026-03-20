import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlantingDto {
  @ApiProperty({
    description: 'UUID da fazenda onde a cultura será plantada',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'farmId must be a valid UUID.' })
  @IsNotEmpty({ message: 'farmId is required.' })
  farmId: string;

  @ApiProperty({
    description: 'UUID da safra (ano agrícola) em que ocorreu o plantio',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'harvestId must be a valid UUID.' })
  @IsNotEmpty({ message: 'harvestId is required.' })
  harvestId: string;

  @ApiProperty({
    description: 'UUID da cultura agrícola plantada',
    example: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'cropId must be a valid UUID.' })
  @IsNotEmpty({ message: 'cropId is required.' })
  cropId: string;
}
