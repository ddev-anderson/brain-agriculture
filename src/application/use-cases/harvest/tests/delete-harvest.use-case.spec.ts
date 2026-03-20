import { NotFoundException } from '@nestjs/common';
import { DeleteHarvestUseCase } from '../delete-harvest.use-case';
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

const fakeHarvest = { id: 'harvest-uuid', year: 2024 } as HarvestEntity;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DeleteHarvestUseCase', () => {
  let useCase: DeleteHarvestUseCase;
  let repo: jest.Mocked<IHarvestRepository>;

  beforeEach(() => {
    repo = makeHarvestRepo();
    useCase = new DeleteHarvestUseCase(repo);
  });

  // ─── Happy path ─────────────────────────────────────────────────────────

  it('deletes the harvest when it exists', async () => {
    repo.findById.mockResolvedValue(fakeHarvest);
    repo.delete.mockResolvedValue(undefined);

    await useCase.execute('harvest-uuid');

    expect(repo.findById).toHaveBeenCalledWith('harvest-uuid');
    expect(repo.delete).toHaveBeenCalledWith('harvest-uuid');
  });

  // ─── Not found ───────────────────────────────────────────────────────────

  it('throws NotFoundException when the harvest does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('harvest-uuid')).rejects.toThrow(NotFoundException);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('includes the id in the not-found message', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('harvest-uuid')).rejects.toThrow(/harvest-uuid/);
  });
});
