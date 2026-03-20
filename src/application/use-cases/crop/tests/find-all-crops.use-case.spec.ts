import { FindAllCropsUseCase } from '../find-all-crops.use-case';
import { ICropRepository } from '@domain/repositories/crop.repository.interface';
import { CropEntity } from '@domain/entities/crop.entity';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeCropRepo = (): jest.Mocked<ICropRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FindAllCropsUseCase', () => {
  let useCase: FindAllCropsUseCase;
  let repo: jest.Mocked<ICropRepository>;

  beforeEach(() => {
    repo = makeCropRepo();
    useCase = new FindAllCropsUseCase(repo);
  });

  it('returns all crops from the repository', async () => {
    const crops = [
      { id: '1', name: 'Soy' },
      { id: '2', name: 'Corn' },
    ] as CropEntity[];
    repo.findAll.mockResolvedValue(crops);

    const result = await useCase.execute();

    expect(repo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
    expect(result).toBe(crops);
  });

  it('returns an empty array when there are no crops', async () => {
    repo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
