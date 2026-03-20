import { FindAllPlantingsUseCase } from '../find-all-plantings.use-case';
import { IPlantingRepository } from '@domain/repositories/planting.repository.interface';
import { PlantingEntity } from '@domain/entities/planting.entity';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makePlantingRepo = (): jest.Mocked<IPlantingRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByFarmId: jest.fn(),
  findByHarvestId: jest.fn(),
  findByCropId: jest.fn(),
  findByFarmHarvestCrop: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FindAllPlantingsUseCase', () => {
  let useCase: FindAllPlantingsUseCase;
  let repo: jest.Mocked<IPlantingRepository>;

  beforeEach(() => {
    repo = makePlantingRepo();
    useCase = new FindAllPlantingsUseCase(repo);
  });

  it('returns all plantings from the repository', async () => {
    const plantings = [
      { id: '1', farmId: 'f1', harvestId: 'h1', cropId: 'c1' },
      { id: '2', farmId: 'f2', harvestId: 'h2', cropId: 'c2' },
    ] as PlantingEntity[];
    repo.findAll.mockResolvedValue(plantings);

    const result = await useCase.execute();

    expect(repo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
    expect(result).toBe(plantings);
  });

  it('returns an empty array when there are no plantings', async () => {
    repo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
