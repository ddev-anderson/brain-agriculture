import { ConflictException } from '@nestjs/common';
import { CreateHarvestUseCase } from '../create-harvest.use-case';
import { CreateHarvestDto } from '@application/dtos/harvest/create-harvest.dto';
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

const validDto: CreateHarvestDto = { year: 2024 };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CreateHarvestUseCase', () => {
  let useCase: CreateHarvestUseCase;
  let repo: jest.Mocked<IHarvestRepository>;

  beforeEach(() => {
    repo = makeHarvestRepo();
    useCase = new CreateHarvestUseCase(repo);
  });

  // ─── Happy path ─────────────────────────────────────────────────────────

  it('creates a harvest when the year does not exist yet', async () => {
    repo.findByYear.mockResolvedValue(null);
    const saved = { id: 'harvest-uuid', year: 2024 } as HarvestEntity;
    repo.create.mockResolvedValue(saved);

    const result = await useCase.execute(validDto);

    expect(repo.findByYear).toHaveBeenCalledWith(2024);
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(result.year).toBe(2024);
  });

  // ─── Conflict ────────────────────────────────────────────────────────────

  it('throws ConflictException when a harvest for the same year already exists', async () => {
    repo.findByYear.mockResolvedValue({ id: 'existing', year: 2024 } as HarvestEntity);

    await expect(useCase.execute(validDto)).rejects.toThrow(ConflictException);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('includes the year in the conflict message', async () => {
    repo.findByYear.mockResolvedValue({ id: 'existing', year: 2024 } as HarvestEntity);

    await expect(useCase.execute(validDto)).rejects.toThrow(/2024/);
  });
});
