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
import { CreateCropUseCase } from '@application/use-cases/crop/create-crop.use-case';
import { FindAllCropsUseCase } from '@application/use-cases/crop/find-all-crops.use-case';
import { DeleteCropUseCase } from '@application/use-cases/crop/delete-crop.use-case';
import { CreateCropDto } from '@application/dtos/crop/create-crop.dto';

@ApiTags('Culturas')
@Controller('crops')
export class CropController {
  constructor(
    private readonly createUseCase: CreateCropUseCase,
    private readonly findAllUseCase: FindAllCropsUseCase,
    private readonly deleteUseCase: DeleteCropUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar cultura',
    description:
      'Cadastra um novo tipo de cultura agrícola no catálogo do sistema (ex: Soja, Milho, Café). O nome deve ser único.',
  })
  @ApiBody({ type: CreateCropDto })
  @ApiResponse({ status: 201, description: 'Cultura criada com sucesso.' })
  @ApiResponse({ status: 409, description: 'Já existe uma cultura com este nome.' })
  create(@Body() dto: CreateCropDto) {
    return this.createUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar culturas',
    description: 'Retorna todas as culturas agrícolas disponíveis no sistema.',
  })
  @ApiResponse({ status: 200, description: 'Lista de culturas.' })
  findAll() {
    return this.findAllUseCase.execute();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir cultura',
    description:
      'Remove uma cultura do catálogo. A operação é bloqueada se houver plantios vinculados (RESTRICT).',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da cultura',
    example: 'f6a7b8c9-d0e1-2345-fabc-678901234567',
  })
  @ApiResponse({ status: 204, description: 'Cultura excluída com sucesso.' })
  @ApiResponse({ status: 404, description: 'Cultura não encontrada.' })
  @ApiResponse({
    status: 409,
    description: 'Não é possível excluir — existem plantios vinculados a esta cultura.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteUseCase.execute(id);
  }
}
