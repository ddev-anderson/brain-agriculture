import { CropEntity } from '../entities/crop.entity';

export interface ICropRepository {
  findAll(): Promise<CropEntity[]>;
  findById(id: string): Promise<CropEntity | null>;
  findByName(name: string): Promise<CropEntity | null>;
  create(crop: CropEntity): Promise<CropEntity>;
  delete(id: string): Promise<void>;
}
