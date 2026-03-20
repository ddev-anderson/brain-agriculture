import { NotFoundException } from '@nestjs/common';
import { DeletePlantingUseCase } from '../delete-planting.use-case';
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

const fakePlanting = { id: 'planting-uuid' } as PlantingEntity;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DeletePlantingUseCase', () => {
  let useCase: DeletePlantingUseCase;
  let repo: jest.Mocked<IPlantingRepository>;

  beforeEach(() => {
    repo = makePlantingRepo();
    useCase = new DeletePlantingUseCase(repo);
  });

  // ─── Happy path ─────────────────────────────────────────────────────────

  it('deletes the planting when it exists', async () => {
    repo.findById.mockResolvedValue(fakePlanting);
    repo.delete.mockResolvedValue(undefined);

    await useCase.execute('planting-uuid');

    expect(repo.findById).toHaveBeenCalledWith('planting-uuid');
    expect(repo.delete).toHaveBeenCalledWith('planting-uuid');
  });

  // ─── Not found ───────────────────────────────────────────────────────────

  it('throws NotFoundException when the planting does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('planting-uuid')).rejects.toThrow(NotFoundException);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('includes the id in the not-found message', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('planting-uuid')).rejects.toThrow(/planting-uuid/);
  });
});
