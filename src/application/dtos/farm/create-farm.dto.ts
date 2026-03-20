import { IsString, IsNotEmpty, IsNumber, IsPositive, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFarmDto {
  @ApiProperty({ description: 'Nome da fazenda', example: 'Fazenda Santa Fé' })
  @IsString()
  @IsNotEmpty({ message: 'Farm name is required.' })
  name: string;

  @ApiProperty({
    description: 'Município onde a fazenda está localizada',
    example: 'Ribeirão Preto',
  })
  @IsString()
  @IsNotEmpty({ message: 'City is required.' })
  city: string;

  @ApiProperty({ description: 'Sigla do estado (UF)', example: 'SP' })
  @IsString()
  @IsNotEmpty({ message: 'State is required.' })
  state: string;

  @ApiProperty({
    description: 'Área total da fazenda em hectares',
    example: 500.0,
    minimum: 0.0001,
  })
  @IsNumber({}, { message: 'Total area must be a number.' })
  @IsPositive({ message: 'Total area must be greater than zero.' })
  totalArea: number;

  @ApiProperty({
    description: 'Área agricultável em hectares (deve ser ≤ área total)',
    example: 350.0,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Arable area must be a number.' })
  @Min(0, { message: 'Arable area cannot be negative.' })
  arableArea: number;

  @ApiProperty({
    description: 'Área de vegetação/reserva em hectares (deve ser ≤ área total)',
    example: 100.0,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Vegetation area must be a number.' })
  @Min(0, { message: 'Vegetation area cannot be negative.' })
  vegetationArea: number;

  @ApiProperty({
    description: 'UUID do produtor proprietário da fazenda',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'producerId must be a valid UUID.' })
  @IsNotEmpty({ message: 'producerId is required.' })
  producerId: string;
}
