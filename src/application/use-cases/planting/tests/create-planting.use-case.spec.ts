import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreatePlantingUseCase } from '../create-planting.use-case';
import { CreatePlantingDto } from '@application/dtos/planting/create-planting.dto';
import { IPlantingRepository } from '@domain/repositories/planting.repository.interface';
import { IFarmRepository } from '@domain/repositories/farm.repository.interface';
import { IHarvestRepository } from '@domain/repositories/harvest.repository.interface';
import { ICropRepository } from '@domain/repositories/crop.repository.interface';
import { FarmEntity } from '@domain/entities/farm.entity';
import { HarvestEntity } from '@domain/entities/harvest.entity';
import { CropEntity } from '@domain/entities/crop.entity';
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

const makeFarmRepo = (): jest.Mocked<IFarmRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByProducerId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const makeHarvestRepo = (): jest.Mocked<IHarvestRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByYear: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

const makeCropRepo = (): jest.Mocked<ICropRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const FARM_ID = 'farm-uuid';
const HARVEST_ID = 'harvest-uuid';
const CROP_ID = 'crop-uuid';

const fakeFarm = { id: FARM_ID, name: 'Fazenda Bela Vista' } as FarmEntity;
const fakeHarvest = { id: HARVEST_ID, year: 2024 } as HarvestEntity;
const fakeCrop = { id: CROP_ID, name: 'Soy' } as CropEntity;

const validDto: CreatePlantingDto = { farmId: FARM_ID, harvestId: HARVEST_ID, cropId: CROP_ID };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CreatePlantingUseCase', () => {
  let useCase: CreatePlantingUseCase;
  let plantingRepo: jest.Mocked<IPlantingRepository>;
  let farmRepo: jest.Mocked<IFarmRepository>;
  let harvestRepo: jest.Mocked<IHarvestRepository>;
  let cropRepo: jest.Mocked<ICropRepository>;

  beforeEach(() => {
    plantingRepo = makePlantingRepo();
    farmRepo = makeFarmRepo();
    harvestRepo = makeHarvestRepo();
    cropRepo = makeCropRepo();
    useCase = new CreatePlantingUseCase(plantingRepo, farmRepo, harvestRepo, cropRepo);
  });

  // ─── Happy path ─────────────────────────────────────────────────────────

  it('creates a planting when all references exist and no duplicate exists', async () => {
    farmRepo.findById.mockResolvedValue(fakeFarm);
    harvestRepo.findById.mockResolvedValue(fakeHarvest);
    cropRepo.findById.mockResolvedValue(fakeCrop);
    plantingRepo.findByFarmHarvestCrop.mockResolvedValue(null);
    const saved = { id: 'planting-uuid', ...validDto } as unknown as PlantingEntity;
    plantingRepo.create.mockResolvedValue(saved);

    const result = await useCase.execute(validDto);

    expect(farmRepo.findById).toHaveBeenCalledWith(FARM_ID);
    expect(harvestRepo.findById).toHaveBeenCalledWith(HARVEST_ID);
    expect(cropRepo.findById).toHaveBeenCalledWith(CROP_ID);
    expect(plantingRepo.findByFarmHarvestCrop).toHaveBeenCalledWith(FARM_ID, HARVEST_ID, CROP_ID);
    expect(plantingRepo.create).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('planting-uuid');
  });

  it('resolves farm, harvest and crop lookups in parallel', async () => {
    farmRepo.findById.mockResolvedValue(fakeFarm);
    harvestRepo.findById.mockResolvedValue(fakeHarvest);
    cropRepo.findById.mockResolvedValue(fakeCrop);
    plantingRepo.findByFarmHarvestCrop.mockResolvedValue(null);
    plantingRepo.create.mockResolvedValue({ id: 'p' } as PlantingEntity);

    await useCase.execute(validDto);

    expect(farmRepo.findById).toHaveBeenCalledTimes(1);
    expect(harvestRepo.findById).toHaveBeenCalledTimes(1);
    expect(cropRepo.findById).toHaveBeenCalledTimes(1);
  });

  // ─── Not found cases ────────────────────────────────────────────────────

  it('throws NotFoundException when farm does not exist', async () => {
    farmRepo.findById.mockResolvedValue(null);
    harvestRepo.findById.mockResolvedValue(fakeHarvest);
    cropRepo.findById.mockResolvedValue(fakeCrop);

    await expect(useCase.execute(validDto)).rejects.toThrow(NotFoundException);
    expect(plantingRepo.create).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when harvest does not exist', async () => {
    farmRepo.findById.mockResolvedValue(fakeFarm);
    harvestRepo.findById.mockResolvedValue(null);
    cropRepo.findById.mockResolvedValue(fakeCrop);

    await expect(useCase.execute(validDto)).rejects.toThrow(NotFoundException);
    expect(plantingRepo.create).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when crop does not exist', async () => {
    farmRepo.findById.mockResolvedValue(fakeFarm);
    harvestRepo.findById.mockResolvedValue(fakeHarvest);
    cropRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(validDto)).rejects.toThrow(NotFoundException);
    expect(plantingRepo.create).not.toHaveBeenCalled();
  });

  // ─── Duplicate planting ─────────────────────────────────────────────────

  it('throws ConflictException when the same crop+farm+harvest combination already exists', async () => {
    farmRepo.findById.mockResolvedValue(fakeFarm);
    harvestRepo.findById.mockResolvedValue(fakeHarvest);
    cropRepo.findById.mockResolvedValue(fakeCrop);
    plantingRepo.findByFarmHarvestCrop.mockResolvedValue({
      id: 'existing',
    } as PlantingEntity);

    await expect(useCase.execute(validDto)).rejects.toThrow(ConflictException);
    expect(plantingRepo.create).not.toHaveBeenCalled();
  });
});
