import { HarvestEntity } from '../entities/harvest.entity';

export interface IHarvestRepository {
  findAll(): Promise<HarvestEntity[]>;
  findById(id: string): Promise<HarvestEntity | null>;
  findByYear(year: number): Promise<HarvestEntity | null>;
  create(harvest: HarvestEntity): Promise<HarvestEntity>;
  delete(id: string): Promise<void>;
}
