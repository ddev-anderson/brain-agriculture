import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProducerDto {
  @ApiPropertyOptional({
    description: 'Novo nome do produtor rural',
    example: 'João da Silva Atualizado',
    minLength: 2,
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Name must have at least 2 characters.' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Novo CPF ou CNPJ do produtor',
    example: '98.765.432/0001-10',
  })
  @IsString()
  @IsOptional()
  document?: string;
}
