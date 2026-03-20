import { FindAllProducersUseCase } from '../find-all-producers.use-case';
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

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FindAllProducersUseCase', () => {
  let useCase: FindAllProducersUseCase;
  let repo: jest.Mocked<IProducerRepository>;

  beforeEach(() => {
    repo = makeProducerRepo();
    useCase = new FindAllProducersUseCase(repo);
  });

  it('returns all producers from the repository', async () => {
    const producers = [
      { id: '1', name: 'João Silva', document: '52998224725' },
      { id: '2', name: 'Agro Brasil Ltda', document: '11222333000181' },
    ] as ProducerEntity[];
    repo.findAll.mockResolvedValue(producers);

    const result = await useCase.execute();

    expect(repo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
    expect(result).toBe(producers);
  });

  it('returns an empty array when there are no producers', async () => {
    repo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
