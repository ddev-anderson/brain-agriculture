import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FarmEntity } from '@domain/entities/farm.entity';
import { IFarmRepository } from '@domain/repositories/farm.repository.interface';

@Injectable()
export class FarmRepository implements IFarmRepository {
  constructor(
    @InjectRepository(FarmEntity)
    private readonly repo: Repository<FarmEntity>,
  ) {}

  findAll(): Promise<FarmEntity[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  findById(id: string): Promise<FarmEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByProducerId(producerId: string): Promise<FarmEntity[]> {
    return this.repo.find({ where: { producerId }, order: { name: 'ASC' } });
  }

  create(farm: FarmEntity): Promise<FarmEntity> {
    return this.repo.save(this.repo.create(farm));
  }

  async update(farm: FarmEntity): Promise<FarmEntity> {
    await this.repo.save(farm);
    return this.repo.findOne({ where: { id: farm.id } }) as Promise<FarmEntity>;
  }

  async delete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
