import { FindAllFarmsUseCase } from '../find-all-farms.use-case';
import { IFarmRepository } from '@domain/repositories/farm.repository.interface';
import { FarmEntity } from '@domain/entities/farm.entity';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeFarmRepo = (): jest.Mocked<IFarmRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByProducerId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FindAllFarmsUseCase', () => {
  let useCase: FindAllFarmsUseCase;
  let repo: jest.Mocked<IFarmRepository>;

  beforeEach(() => {
    repo = makeFarmRepo();
    useCase = new FindAllFarmsUseCase(repo);
  });

  it('returns all farms from the repository', async () => {
    const farms = [
      { id: '1', name: 'Fazenda A' },
      { id: '2', name: 'Fazenda B' },
    ] as FarmEntity[];
    repo.findAll.mockResolvedValue(farms);

    const result = await useCase.execute();

    expect(repo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
    expect(result).toBe(farms);
  });

  it('returns an empty array when there are no farms', async () => {
    repo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
