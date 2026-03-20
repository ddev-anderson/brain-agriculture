import { ConflictException } from '@nestjs/common';
import { CreateCropUseCase } from '../create-crop.use-case';
import { CreateCropDto } from '@application/dtos/crop/create-crop.dto';
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

const validDto: CreateCropDto = { name: 'Soy' };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CreateCropUseCase', () => {
  let useCase: CreateCropUseCase;
  let repo: jest.Mocked<ICropRepository>;

  beforeEach(() => {
    repo = makeCropRepo();
    useCase = new CreateCropUseCase(repo);
  });

  // ─── Happy path ─────────────────────────────────────────────────────────

  it('creates a crop when the name does not exist yet', async () => {
    repo.findByName.mockResolvedValue(null);
    const saved = { id: 'crop-uuid', name: 'Soy' } as CropEntity;
    repo.create.mockResolvedValue(saved);

    const result = await useCase.execute(validDto);

    expect(repo.findByName).toHaveBeenCalledWith('Soy');
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('crop-uuid');
    expect(result.name).toBe('Soy');
  });

  // ─── Conflict ────────────────────────────────────────────────────────────

  it('throws ConflictException when a crop with the same name already exists', async () => {
    repo.findByName.mockResolvedValue({ id: 'existing', name: 'Soy' } as CropEntity);

    await expect(useCase.execute(validDto)).rejects.toThrow(ConflictException);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('includes the crop name in the conflict message', async () => {
    repo.findByName.mockResolvedValue({ id: 'existing', name: 'Soy' } as CropEntity);

    await expect(useCase.execute(validDto)).rejects.toThrow(/Soy/);
  });
});
