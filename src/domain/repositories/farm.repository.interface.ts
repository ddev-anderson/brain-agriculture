import { FarmEntity } from '../entities/farm.entity';

export interface IFarmRepository {
  findAll(): Promise<FarmEntity[]>;
  findById(id: string): Promise<FarmEntity | null>;
  findByProducerId(producerId: string): Promise<FarmEntity[]>;
  create(farm: FarmEntity): Promise<FarmEntity>;
  update(farm: FarmEntity): Promise<FarmEntity>;
  delete(id: string): Promise<void>;
}
