import { NotFoundException } from '@nestjs/common';
import { FindFarmByIdUseCase } from '../find-farm-by-id.use-case';
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

describe('FindFarmByIdUseCase', () => {
  let useCase: FindFarmByIdUseCase;
  let repo: jest.Mocked<IFarmRepository>;

  beforeEach(() => {
    repo = makeFarmRepo();
    useCase = new FindFarmByIdUseCase(repo);
  });

  // ─── Happy path ─────────────────────────────────────────────────────────

  it('returns the farm when it exists', async () => {
    repo.findById.mockResolvedValue(fakeFarm);

    const result = await useCase.execute('farm-uuid');

    expect(repo.findById).toHaveBeenCalledWith('farm-uuid');
    expect(result).toBe(fakeFarm);
  });

  // ─── Not found ───────────────────────────────────────────────────────────

  it('throws NotFoundException when the farm does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('farm-uuid')).rejects.toThrow(NotFoundException);
  });

  it('includes the id in the not-found message', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('farm-uuid')).rejects.toThrow(/farm-uuid/);
  });
});
