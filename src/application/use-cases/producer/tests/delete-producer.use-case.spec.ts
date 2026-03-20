import { NotFoundException } from '@nestjs/common';
import { DeleteProducerUseCase } from '../delete-producer.use-case';
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

const fakeProducer = { id: 'producer-uuid', name: 'João Silva' } as ProducerEntity;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DeleteProducerUseCase', () => {
  let useCase: DeleteProducerUseCase;
  let repo: jest.Mocked<IProducerRepository>;

  beforeEach(() => {
    repo = makeProducerRepo();
    useCase = new DeleteProducerUseCase(repo);
  });

  // ─── Happy path ─────────────────────────────────────────────────────────

  it('deletes the producer when it exists', async () => {
    repo.findById.mockResolvedValue(fakeProducer);
    repo.delete.mockResolvedValue(undefined);

    await useCase.execute('producer-uuid');

    expect(repo.findById).toHaveBeenCalledWith('producer-uuid');
    expect(repo.delete).toHaveBeenCalledWith('producer-uuid');
  });

  // ─── Not found ───────────────────────────────────────────────────────────

  it('throws NotFoundException when the producer does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('producer-uuid')).rejects.toThrow(NotFoundException);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('includes the id in the not-found message', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('producer-uuid')).rejects.toThrow(/producer-uuid/);
  });
});
