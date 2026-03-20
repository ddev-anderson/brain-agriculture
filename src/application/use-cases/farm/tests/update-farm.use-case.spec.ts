import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { UpdateFarmUseCase } from '../update-farm.use-case';
import { UpdateFarmDto } from '@application/dtos/farm/update-farm.dto';
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

const makeFarm = (overrides: Partial<FarmEntity> = {}): FarmEntity =>
  ({
    id: 'farm-uuid',
    name: 'Fazenda Boa Vista',
    city: 'Ribeirão Preto',
    state: 'SP',
    totalArea: 1000,
    arableArea: 600,
    vegetationArea: 300,
    ...overrides,
  }) as FarmEntity;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('UpdateFarmUseCase', () => {
  let useCase: UpdateFarmUseCase;
  let repo: jest.Mocked<IFarmRepository>;

  beforeEach(() => {
    repo = makeFarmRepo();
    useCase = new UpdateFarmUseCase(repo);
  });

  // ─── Happy path ─────────────────────────────────────────────────────────

  it('updates scalar fields and persists the farm', async () => {
    const farm = makeFarm();
    repo.findById.mockResolvedValue(farm);
    const updated = { ...farm, name: 'Nova Fazenda' } as FarmEntity;
    repo.update.mockResolvedValue(updated);

    const result = await useCase.execute('farm-uuid', { name: 'Nova Fazenda' });

    expect(repo.findById).toHaveBeenCalledWith('farm-uuid');
    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(result.name).toBe('Nova Fazenda');
  });

  it('uses existing farm values for untouched area fields when validating', async () => {
    const farm = makeFarm({ arableArea: 600, vegetationArea: 300, totalArea: 1000 });
    repo.findById.mockResolvedValue(farm);
    repo.update.mockResolvedValue({ ...farm, arableArea: 500 } as FarmEntity);

    // reducing arableArea — sum is 500+300=800 ≤ 1000, should pass
    await expect(useCase.execute('farm-uuid', { arableArea: 500 })).resolves.not.toThrow();
    expect(repo.update).toHaveBeenCalledTimes(1);
  });

  it('allows combined areas equal to totalArea (boundary)', async () => {
    const farm = makeFarm({ totalArea: 1000 });
    repo.findById.mockResolvedValue(farm);
    repo.update.mockResolvedValue(farm);

    await expect(
      useCase.execute('farm-uuid', { arableArea: 600, vegetationArea: 400 }),
    ).resolves.not.toThrow();
  });

  // ─── Not found ───────────────────────────────────────────────────────────

  it('throws NotFoundException when the farm does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('farm-uuid', {})).rejects.toThrow(NotFoundException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  // ─── Area validation ────────────────────────────────────────────────────

  describe('area validation after partial update', () => {
    it('throws UnprocessableEntityException when new areas exceed totalArea', async () => {
      const farm = makeFarm({ totalArea: 1000, arableArea: 600, vegetationArea: 300 });
      repo.findById.mockResolvedValue(farm);

      await expect(
        useCase.execute('farm-uuid', { arableArea: 800, vegetationArea: 400 }),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('throws when only arableArea is updated and causes overflow', async () => {
      const farm = makeFarm({ totalArea: 1000, arableArea: 600, vegetationArea: 300 });
      repo.findById.mockResolvedValue(farm);

      // 800 (new arable) + 300 (existing veg) = 1100 > 1000
      await expect(useCase.execute('farm-uuid', { arableArea: 800 })).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('throws when only vegetationArea is updated and causes overflow', async () => {
      const farm = makeFarm({ totalArea: 1000, arableArea: 600, vegetationArea: 300 });
      repo.findById.mockResolvedValue(farm);

      // 600 (existing arable) + 500 (new veg) = 1100 > 1000
      await expect(useCase.execute('farm-uuid', { vegetationArea: 500 })).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });
});
