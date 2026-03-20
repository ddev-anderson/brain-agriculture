import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateFarmUseCase } from '../create-farm.use-case';
import { CreateFarmDto } from '@application/dtos/farm/create-farm.dto';
import { IFarmRepository } from '@domain/repositories/farm.repository.interface';
import { IProducerRepository } from '@domain/repositories/producer.repository.interface';
import { FarmEntity } from '@domain/entities/farm.entity';
import { ProducerEntity } from '@domain/entities/producer.entity';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeFarmRepo = (): jest.Mocked<IFarmRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByProducerId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const makeProducerRepo = (): jest.Mocked<IProducerRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByDocument: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const fakeProducer = { id: 'producer-uuid', name: 'João Silva' } as ProducerEntity;

const baseDto: CreateFarmDto = {
  name: 'Fazenda Boa Vista',
  city: 'Ribeirão Preto',
  state: 'SP',
  totalArea: 1000,
  arableArea: 600,
  vegetationArea: 300,
  producerId: 'producer-uuid',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CreateFarmUseCase', () => {
  let useCase: CreateFarmUseCase;
  let farmRepo: jest.Mocked<IFarmRepository>;
  let producerRepo: jest.Mocked<IProducerRepository>;

  beforeEach(() => {
    farmRepo = makeFarmRepo();
    producerRepo = makeProducerRepo();
    useCase = new CreateFarmUseCase(farmRepo, producerRepo);
  });

  // ─── Happy path ─────────────────────────────────────────────────────────

  it('creates a farm when all inputs are valid', async () => {
    producerRepo.findById.mockResolvedValue(fakeProducer);
    const saved = { ...baseDto, id: 'farm-uuid' } as unknown as FarmEntity;
    farmRepo.create.mockResolvedValue(saved);

    const result = await useCase.execute(baseDto);

    expect(producerRepo.findById).toHaveBeenCalledWith('producer-uuid');
    expect(farmRepo.create).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('farm-uuid');
  });

  it('allows combined areas equal to totalArea (boundary)', async () => {
    producerRepo.findById.mockResolvedValue(fakeProducer);
    const dto: CreateFarmDto = { ...baseDto, arableArea: 600, vegetationArea: 400 };
    farmRepo.create.mockResolvedValue({ id: 'farm-uuid' } as FarmEntity);

    await expect(useCase.execute(dto)).resolves.not.toThrow();
    expect(farmRepo.create).toHaveBeenCalledTimes(1);
  });

  // ─── Producer not found ─────────────────────────────────────────────────

  it('throws NotFoundException when producer does not exist', async () => {
    producerRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(baseDto)).rejects.toThrow(NotFoundException);
    expect(farmRepo.create).not.toHaveBeenCalled();
  });

  // ─── Area validation ────────────────────────────────────────────────────

  describe('area validation: arableArea + vegetationArea must not exceed totalArea', () => {
    beforeEach(() => {
      producerRepo.findById.mockResolvedValue(fakeProducer);
    });

    it('throws when combined areas exceed totalArea', async () => {
      const dto: CreateFarmDto = { ...baseDto, arableArea: 700, vegetationArea: 400 };
      await expect(useCase.execute(dto)).rejects.toThrow(UnprocessableEntityException);
      expect(farmRepo.create).not.toHaveBeenCalled();
    });

    it('throws when arableArea alone exceeds totalArea', async () => {
      const dto: CreateFarmDto = { ...baseDto, arableArea: 1100, vegetationArea: 0 };
      await expect(useCase.execute(dto)).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when vegetationArea alone exceeds totalArea', async () => {
      const dto: CreateFarmDto = { ...baseDto, arableArea: 0, vegetationArea: 1001 };
      await expect(useCase.execute(dto)).rejects.toThrow(UnprocessableEntityException);
    });
  });
});
