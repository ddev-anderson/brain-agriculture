import { ConflictException } from '@nestjs/common';
import { CreateProducerUseCase } from '../create-producer.use-case';
import { CreateProducerDto } from '@application/dtos/producer/create-producer.dto';
import { IProducerRepository } from '@domain/repositories/producer.repository.interface';
import { ProducerEntity } from '@domain/entities/producer.entity';
import { ValidationDomainError } from '@domain/errors/domain.error';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeProducerRepo = (): jest.Mocked<IProducerRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByDocument: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CreateProducerUseCase', () => {
  let useCase: CreateProducerUseCase;
  let repo: jest.Mocked<IProducerRepository>;

  beforeEach(() => {
    repo = makeProducerRepo();
    useCase = new CreateProducerUseCase(repo);
  });

  // ─── Happy path ─────────────────────────────────────────────────────────

  it('creates a producer with a valid CPF', async () => {
    repo.findByDocument.mockResolvedValue(null);
    const saved = {
      id: 'producer-uuid',
      name: 'João Silva',
      document: '52998224725',
    } as ProducerEntity;
    repo.create.mockResolvedValue(saved);

    const dto: CreateProducerDto = { name: 'João Silva', document: '52998224725' };
    const result = await useCase.execute(dto);

    expect(repo.findByDocument).toHaveBeenCalledWith('52998224725');
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(result.document).toBe('52998224725');
  });

  it('creates a producer with a valid CNPJ', async () => {
    repo.findByDocument.mockResolvedValue(null);
    const saved = {
      id: 'producer-uuid',
      name: 'Agro Brasil Ltda',
      document: '11222333000181',
    } as ProducerEntity;
    repo.create.mockResolvedValue(saved);

    const dto: CreateProducerDto = { name: 'Agro Brasil Ltda', document: '11222333000181' };
    const result = await useCase.execute(dto);

    expect(result.document).toBe('11222333000181');
  });

  it('strips CPF formatting before saving (digits only)', async () => {
    repo.findByDocument.mockResolvedValue(null);
    repo.create.mockImplementation(async entity => entity);

    const dto: CreateProducerDto = { name: 'João Silva', document: '529.982.247-25' };
    const result = await useCase.execute(dto);

    // document must be stored as digits-only
    expect(result.document).toBe('52998224725');
  });

  // ─── Conflict ────────────────────────────────────────────────────────────

  it('throws ConflictException when document is already registered', async () => {
    repo.findByDocument.mockResolvedValue({ id: 'existing' } as ProducerEntity);

    const dto: CreateProducerDto = { name: 'João Silva', document: '52998224725' };
    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(repo.create).not.toHaveBeenCalled();
  });

  // ─── Invalid CPF/CNPJ ────────────────────────────────────────────────────

  it('throws ValidationDomainError for an invalid CPF', async () => {
    const dto: CreateProducerDto = { name: 'Invalid', document: '11111111111' };
    await expect(useCase.execute(dto)).rejects.toThrow(ValidationDomainError);
    expect(repo.findByDocument).not.toHaveBeenCalled();
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('throws ValidationDomainError for an invalid CNPJ', async () => {
    const dto: CreateProducerDto = { name: 'Invalid', document: '11111111111111' };
    await expect(useCase.execute(dto)).rejects.toThrow(ValidationDomainError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('throws ValidationDomainError for a document with wrong length', async () => {
    const dto: CreateProducerDto = { name: 'Invalid', document: '1234567890' };
    await expect(useCase.execute(dto)).rejects.toThrow(ValidationDomainError);
  });
});
