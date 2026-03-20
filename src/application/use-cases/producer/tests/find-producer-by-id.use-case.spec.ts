import { NotFoundException } from '@nestjs/common';
import { FindProducerByIdUseCase } from '../find-producer-by-id.use-case';
import { IProducerRepository } from '@domain/repositories/producer.repository.interface';
import { ProducerEntity } from '@domain/entities/producer.entity';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeProducerRepo = (): jest.Mocked<IProducerRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByDocument: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const fakeProducer = {
  id: 'producer-uuid',
  name: 'João Silva',
  document: '52998224725',
} as ProducerEntity;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FindProducerByIdUseCase', () => {
  let useCase: FindProducerByIdUseCase;
  let repo: jest.Mocked<IProducerRepository>;

  beforeEach(() => {
    repo = makeProducerRepo();
    useCase = new FindProducerByIdUseCase(repo);
  });

  // ─── Happy path ─────────────────────────────────────────────────────────

  it('returns the producer when it exists', async () => {
    repo.findById.mockResolvedValue(fakeProducer);

    const result = await useCase.execute('producer-uuid');

    expect(repo.findById).toHaveBeenCalledWith('producer-uuid');
    expect(result).toBe(fakeProducer);
  });

  // ─── Not found ───────────────────────────────────────────────────────────

  it('throws NotFoundException when the producer does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('producer-uuid')).rejects.toThrow(NotFoundException);
  });

  it('includes the id in the not-found message', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('producer-uuid')).rejects.toThrow(/producer-uuid/);
  });
});
