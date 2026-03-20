import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HarvestEntity } from '@domain/entities/harvest.entity';
import { IHarvestRepository } from '@domain/repositories/harvest.repository.interface';

@Injectable()
export class HarvestRepository implements IHarvestRepository {
  constructor(
    @InjectRepository(HarvestEntity)
    private readonly repo: Repository<HarvestEntity>,
  ) {}

  findAll(): Promise<HarvestEntity[]> {
    return this.repo.find({ order: { year: 'DESC' } });
  }

  findById(id: string): Promise<HarvestEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByYear(year: number): Promise<HarvestEntity | null> {
    return this.repo.findOne({ where: { year } });
  }

  create(harvest: HarvestEntity): Promise<HarvestEntity> {
    return this.repo.save(this.repo.create(harvest));
  }

  async delete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
