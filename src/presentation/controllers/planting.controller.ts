import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreatePlantingUseCase } from '@application/use-cases/planting/create-planting.use-case';
import { FindAllPlantingsUseCase } from '@application/use-cases/planting/find-all-plantings.use-case';
import { DeletePlantingUseCase } from '@application/use-cases/planting/delete-planting.use-case';
import { CreatePlantingDto } from '@application/dtos/planting/create-planting.dto';

@ApiTags('Plantios')
@Controller('plantings')
export class PlantingController {
  constructor(
    private readonly createUseCase: CreatePlantingUseCase,
    private readonly findAllUseCase: FindAllPlantingsUseCase,
    private readonly deleteUseCase: DeletePlantingUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar plantio',
    description:
      'Registra que uma cultura foi plantada em uma fazenda durante uma safra. ' +
      'A combinação (fazenda + safra + cultura) deve ser única — a mesma cultura não pode ser registrada duas vezes na mesma fazenda e safra.',
  })
  @ApiBody({ type: CreatePlantingDto })
  @ApiResponse({ status: 201, description: 'Plantio registrado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Fazenda, safra ou cultura não encontrada.' })
  @ApiResponse({
    status: 409,
    description: 'Esta cultura já está registrada nesta fazenda para esta safra.',
  })
  create(@Body() dto: CreatePlantingDto) {
    return this.createUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar plantios',
    description: 'Retorna todos os plantios registrados.',
  })
  @ApiResponse({ status: 200, description: 'Lista de plantios.' })
  findAll() {
    return this.findAllUseCase.execute();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir plantio', description: 'Remove o registro de um plantio.' })
  @ApiParam({
    name: 'id',
    description: 'UUID do plantio',
    example: 'a7b8c9d0-e1f2-3456-abcd-789012345678',
  })
  @ApiResponse({ status: 204, description: 'Plantio excluído com sucesso.' })
  @ApiResponse({ status: 404, description: 'Plantio não encontrado.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteUseCase.execute(id);
  }
}
