import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateProducerUseCase } from '../update-producer.use-case';
import { UpdateProducerDto } from '@application/dtos/producer/update-producer.dto';
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

const fakeProducer = (): ProducerEntity =>
  ({ id: 'producer-uuid', name: 'João Silva', document: '52998224725' }) as ProducerEntity;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('UpdateProducerUseCase', () => {
  let useCase: UpdateProducerUseCase;
  let repo: jest.Mocked<IProducerRepository>;

  beforeEach(() => {
    repo = makeProducerRepo();
    useCase = new UpdateProducerUseCase(repo);
  });

  // ─── Happy path ─────────────────────────────────────────────────────────

  it('updates the name without touching the document', async () => {
    const producer = fakeProducer();
    repo.findById.mockResolvedValue(producer);
    repo.update.mockResolvedValue({ ...producer, name: 'Novo Nome' } as ProducerEntity);

    const dto: UpdateProducerDto = { name: 'Novo Nome' };
    const result = await useCase.execute('producer-uuid', dto);

    expect(repo.findByDocument).not.toHaveBeenCalled();
    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(result.name).toBe('Novo Nome');
  });

  it('updates the document to a new valid CPF', async () => {
    const producer = fakeProducer();
    repo.findById.mockResolvedValue(producer);
    repo.findByDocument.mockResolvedValue(null);
    repo.update.mockResolvedValue({ ...producer, document: '11144477735' } as ProducerEntity);

    const dto: UpdateProducerDto = { document: '11144477735' };
    const result = await useCase.execute('producer-uuid', dto);

    expect(repo.findByDocument).toHaveBeenCalledWith('11144477735');
    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(result.document).toBe('11144477735');
  });

  it('skips document validation when the incoming document matches the current one', async () => {
    const producer = fakeProducer(); // document = '52998224725'
    repo.findById.mockResolvedValue(producer);
    repo.update.mockResolvedValue(producer);

    // Sending the same document that is already stored
    const dto: UpdateProducerDto = { document: '52998224725' };
    await useCase.execute('producer-uuid', dto);

    expect(repo.findByDocument).not.toHaveBeenCalled();
  });

  // ─── Not found ───────────────────────────────────────────────────────────

  it('throws NotFoundException when the producer does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('producer-uuid', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  // ─── Conflict ────────────────────────────────────────────────────────────

  it('throws ConflictException when new document is already taken by another producer', async () => {
    const producer = fakeProducer();
    repo.findById.mockResolvedValue(producer);
    repo.findByDocument.mockResolvedValue({ id: 'other-producer' } as ProducerEntity);

    const dto: UpdateProducerDto = { document: '11144477735' };
    await expect(useCase.execute('producer-uuid', dto)).rejects.toThrow(ConflictException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  // ─── Invalid CPF/CNPJ ────────────────────────────────────────────────────

  it('throws ValidationDomainError for an invalid CPF as new document', async () => {
    const producer = fakeProducer();
    repo.findById.mockResolvedValue(producer);

    const dto: UpdateProducerDto = { document: '11111111111' };
    await expect(useCase.execute('producer-uuid', dto)).rejects.toThrow(ValidationDomainError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('throws ValidationDomainError for an invalid CNPJ as new document', async () => {
    const producer = fakeProducer();
    repo.findById.mockResolvedValue(producer);

    const dto: UpdateProducerDto = { document: '11111111111111' };
    await expect(useCase.execute('producer-uuid', dto)).rejects.toThrow(ValidationDomainError);
    expect(repo.update).not.toHaveBeenCalled();
  });
});
