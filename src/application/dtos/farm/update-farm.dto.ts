import { IsString, IsOptional, IsNumber, IsPositive, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFarmDto {
  @ApiPropertyOptional({ description: 'Novo nome da fazenda', example: 'Fazenda Nova Esperança' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Novo município', example: 'Sertãozinho' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'Nova sigla do estado (UF)', example: 'SP' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    description: 'Nova área total em hectares',
    example: 600.0,
    minimum: 0.0001,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  totalArea?: number;

  @ApiPropertyOptional({
    description: 'Nova área agricultável em hectares',
    example: 400.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  arableArea?: number;

  @ApiPropertyOptional({
    description: 'Nova área de vegetação em hectares',
    example: 150.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  vegetationArea?: number;
}
