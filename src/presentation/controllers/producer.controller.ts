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
import { CreateProducerUseCase } from '@application/use-cases/producer/create-producer.use-case';
import { FindAllProducersUseCase } from '@application/use-cases/producer/find-all-producers.use-case';
import { FindProducerByIdUseCase } from '@application/use-cases/producer/find-producer-by-id.use-case';
import { UpdateProducerUseCase } from '@application/use-cases/producer/update-producer.use-case';
import { DeleteProducerUseCase } from '@application/use-cases/producer/delete-producer.use-case';
import { CreateProducerDto } from '@application/dtos/producer/create-producer.dto';
import { UpdateProducerDto } from '@application/dtos/producer/update-producer.dto';

@ApiTags('Produtores')
@Controller('producers')
export class ProducerController {
  constructor(
    private readonly createUseCase: CreateProducerUseCase,
    private readonly findAllUseCase: FindAllProducersUseCase,
    private readonly findByIdUseCase: FindProducerByIdUseCase,
    private readonly updateUseCase: UpdateProducerUseCase,
    private readonly deleteUseCase: DeleteProducerUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar produtor',
    description: 'Cadastra um novo produtor rural (pessoa física via CPF ou jurídica via CNPJ).',
  })
  @ApiBody({ type: CreateProducerDto })
  @ApiResponse({ status: 201, description: 'Produtor criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'Já existe um produtor com este CPF/CNPJ.' })
  @ApiResponse({ status: 422, description: 'CPF ou CNPJ inválido.' })
  create(@Body() dto: CreateProducerDto) {
    return this.createUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar produtores',
    description: 'Retorna todos os produtores cadastrados.',
  })
  @ApiResponse({ status: 200, description: 'Lista de produtores.' })
  findAll() {
    return this.findAllUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar produtor por ID',
    description: 'Retorna os dados de um produtor específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do produtor',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Dados do produtor.' })
  @ApiResponse({ status: 404, description: 'Produtor não encontrado.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.findByIdUseCase.execute(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar produtor',
    description: 'Atualiza nome e/ou documento de um produtor.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do produtor',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateProducerDto })
  @ApiResponse({ status: 200, description: 'Produtor atualizado.' })
  @ApiResponse({ status: 404, description: 'Produtor não encontrado.' })
  @ApiResponse({ status: 422, description: 'CPF ou CNPJ inválido.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProducerDto) {
    return this.updateUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir produtor',
    description: 'Remove um produtor e em cascata todas as suas fazendas e plantios.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do produtor',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 204, description: 'Produtor excluído com sucesso.' })
  @ApiResponse({ status: 404, description: 'Produtor não encontrado.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteUseCase.execute(id);
  }
}
