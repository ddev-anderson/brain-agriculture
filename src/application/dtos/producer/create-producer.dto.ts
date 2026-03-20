import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProducerDto {
  @ApiProperty({
    description: 'Nome completo do produtor rural',
    example: 'João da Silva',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty({ message: 'Producer name is required.' })
  @MinLength(2, { message: 'Name must have at least 2 characters.' })
  name: string;

  @ApiProperty({
    description:
      'CPF (11 dígitos) ou CNPJ (14 dígitos) do produtor — apenas números ou com máscara',
    example: '123.456.789-09',
  })
  @IsString()
  @IsNotEmpty({ message: 'Document (CPF/CNPJ) is required.' })
  document: string;
}

// Um produtor (Producer) tem fazendas (Farms); em cada fazenda, durante uma safra (Harvest), podem ser registrados plantios (Plantings) de diferentes tipos (Crops).
