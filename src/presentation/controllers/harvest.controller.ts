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
import { CreateHarvestUseCase } from '@application/use-cases/harvest/create-harvest.use-case';
import { FindAllHarvestsUseCase } from '@application/use-cases/harvest/find-all-harvests.use-case';
import { DeleteHarvestUseCase } from '@application/use-cases/harvest/delete-harvest.use-case';
import { CreateHarvestDto } from '@application/dtos/harvest/create-harvest.dto';

@ApiTags('Safras')
@Controller('harvests')
export class HarvestController {
  constructor(
    private readonly createUseCase: CreateHarvestUseCase,
    private readonly findAllUseCase: FindAllHarvestsUseCase,
    private readonly deleteUseCase: DeleteHarvestUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar safra',
    description: 'Cadastra um novo ano agrícola. O ano deve ser único no sistema.',
  })
  @ApiBody({ type: CreateHarvestDto })
  @ApiResponse({ status: 201, description: 'Safra criada com sucesso.' })
  @ApiResponse({ status: 409, description: 'Já existe uma safra para este ano.' })
  create(@Body() dto: CreateHarvestDto) {
    return this.createUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar safras',
    description: 'Retorna todos os anos agrícolas cadastrados.',
  })
  @ApiResponse({ status: 200, description: 'Lista de safras.' })
  findAll() {
    return this.findAllUseCase.execute();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir safra',
    description:
      'Remove uma safra. A operação é bloqueada se houver plantios vinculados (RESTRICT).',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da safra',
    example: 'e5f6a7b8-c9d0-1234-efab-567890123456',
  })
  @ApiResponse({ status: 204, description: 'Safra excluída com sucesso.' })
  @ApiResponse({ status: 404, description: 'Safra não encontrada.' })
  @ApiResponse({
    status: 409,
    description: 'Não é possível excluir — existem plantios vinculados a esta safra.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteUseCase.execute(id);
  }
}
