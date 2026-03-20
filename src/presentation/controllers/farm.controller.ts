import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateFarmUseCase } from '@application/use-cases/farm/create-farm.use-case';
import { FindAllFarmsUseCase } from '@application/use-cases/farm/find-all-farms.use-case';
import { FindFarmByIdUseCase } from '@application/use-cases/farm/find-farm-by-id.use-case';
import { UpdateFarmUseCase } from '@application/use-cases/farm/update-farm.use-case';
import { DeleteFarmUseCase } from '@application/use-cases/farm/delete-farm.use-case';
import { CreateFarmDto } from '@application/dtos/farm/create-farm.dto';
import { UpdateFarmDto } from '@application/dtos/farm/update-farm.dto';

@ApiTags('Fazendas')
@Controller('farms')
export class FarmController {
  constructor(
    private readonly createUseCase: CreateFarmUseCase,
    private readonly findAllUseCase: FindAllFarmsUseCase,
    private readonly findByIdUseCase: FindFarmByIdUseCase,
    private readonly updateUseCase: UpdateFarmUseCase,
    private readonly deleteUseCase: DeleteFarmUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar fazenda',
    description:
      'Cadastra uma nova propriedade rural vinculada a um produtor. A soma de área agricultável + área de vegetação não pode exceder a área total.',
  })
  @ApiBody({ type: CreateFarmDto })
  @ApiResponse({ status: 201, description: 'Fazenda criada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Produtor não encontrado.' })
  @ApiResponse({ status: 422, description: 'Soma das áreas excede a área total.' })
  create(@Body() dto: CreateFarmDto) {
    return this.createUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar fazendas',
    description: 'Retorna todas as fazendas cadastradas.',
  })
  @ApiResponse({ status: 200, description: 'Lista de fazendas.' })
  findAll() {
    return this.findAllUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar fazenda por ID',
    description: 'Retorna os dados de uma fazenda específica.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da fazenda',
    example: 'd4e5f6a7-b8c9-0123-defa-456789012345',
  })
  @ApiResponse({ status: 200, description: 'Dados da fazenda.' })
  @ApiResponse({ status: 404, description: 'Fazenda não encontrada.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.findByIdUseCase.execute(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar fazenda',
    description: 'Atualiza dados de uma fazenda. Valida que as áreas não excedam a área total.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da fazenda',
    example: 'd4e5f6a7-b8c9-0123-defa-456789012345',
  })
  @ApiBody({ type: UpdateFarmDto })
  @ApiResponse({ status: 200, description: 'Fazenda atualizada.' })
  @ApiResponse({ status: 404, description: 'Fazenda não encontrada.' })
  @ApiResponse({ status: 422, description: 'Soma das áreas excede a área total.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFarmDto) {
    return this.updateUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir fazenda',
    description: 'Remove uma fazenda e em cascata todos os seus plantios.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da fazenda',
    example: 'd4e5f6a7-b8c9-0123-defa-456789012345',
  })
  @ApiResponse({ status: 204, description: 'Fazenda excluída com sucesso.' })
  @ApiResponse({ status: 404, description: 'Fazenda não encontrada.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteUseCase.execute(id);
  }
}
