import { NotFoundException } from '@nestjs/common';
import { DeleteCropUseCase } from '../delete-crop.use-case';
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

const fakeCrop = { id: 'crop-uuid', name: 'Soy' } as CropEntity;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DeleteCropUseCase', () => {
  let useCase: DeleteCropUseCase;
  let repo: jest.Mocked<ICropRepository>;

  beforeEach(() => {
    repo = makeCropRepo();
    useCase = new DeleteCropUseCase(repo);
  });

  // ─── Happy path ─────────────────────────────────────────────────────────

  it('deletes the crop when it exists', async () => {
    repo.findById.mockResolvedValue(fakeCrop);
    repo.delete.mockResolvedValue(undefined);

    await useCase.execute('crop-uuid');

    expect(repo.findById).toHaveBeenCalledWith('crop-uuid');
    expect(repo.delete).toHaveBeenCalledWith('crop-uuid');
  });

  // ─── Not found ───────────────────────────────────────────────────────────

  it('throws NotFoundException when the crop does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('crop-uuid')).rejects.toThrow(NotFoundException);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('includes the id in the not-found message', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('crop-uuid')).rejects.toThrow(/crop-uuid/);
  });
});
