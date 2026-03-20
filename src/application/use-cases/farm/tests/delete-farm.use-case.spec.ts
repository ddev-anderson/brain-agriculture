import { NotFoundException } from '@nestjs/common';
import { DeleteFarmUseCase } from '../delete-farm.use-case';
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

const fakeFarm = { id: 'farm-uuid', name: 'Fazenda Boa Vista' } as FarmEntity;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DeleteFarmUseCase', () => {
  let useCase: DeleteFarmUseCase;
  let repo: jest.Mocked<IFarmRepository>;

  beforeEach(() => {
    repo = makeFarmRepo();
    useCase = new DeleteFarmUseCase(repo);
  });

  // ─── Happy path ─────────────────────────────────────────────────────────

  it('deletes the farm when it exists', async () => {
    repo.findById.mockResolvedValue(fakeFarm);
    repo.delete.mockResolvedValue(undefined);

    await useCase.execute('farm-uuid');

    expect(repo.findById).toHaveBeenCalledWith('farm-uuid');
    expect(repo.delete).toHaveBeenCalledWith('farm-uuid');
  });

  // ─── Not found ───────────────────────────────────────────────────────────

  it('throws NotFoundException when the farm does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('farm-uuid')).rejects.toThrow(NotFoundException);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('includes the id in the not-found message', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('farm-uuid')).rejects.toThrow(/farm-uuid/);
  });
});
