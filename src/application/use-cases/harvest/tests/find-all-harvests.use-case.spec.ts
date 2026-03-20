import { FindAllHarvestsUseCase } from '../find-all-harvests.use-case';
import { IHarvestRepository } from '@domain/repositories/harvest.repository.interface';
import { HarvestEntity } from '@domain/entities/harvest.entity';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeHarvestRepo = (): jest.Mocked<IHarvestRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByYear: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FindAllHarvestsUseCase', () => {
  let useCase: FindAllHarvestsUseCase;
  let repo: jest.Mocked<IHarvestRepository>;

  beforeEach(() => {
    repo = makeHarvestRepo();
    useCase = new FindAllHarvestsUseCase(repo);
  });

  it('returns all harvests from the repository', async () => {
    const harvests = [
      { id: '1', year: 2023 },
      { id: '2', year: 2024 },
    ] as HarvestEntity[];
    repo.findAll.mockResolvedValue(harvests);

    const result = await useCase.execute();

    expect(repo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
    expect(result).toBe(harvests);
  });

  it('returns an empty array when there are no harvests', async () => {
    repo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
