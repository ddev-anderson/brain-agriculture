import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CropEntity } from '@domain/entities/crop.entity';
import { ICropRepository } from '@domain/repositories/crop.repository.interface';

@Injectable()
export class CropRepository implements ICropRepository {
  constructor(
    @InjectRepository(CropEntity)
    private readonly repo: Repository<CropEntity>,
  ) {}

  findAll(): Promise<CropEntity[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  findById(id: string): Promise<CropEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByName(name: string): Promise<CropEntity | null> {
    return this.repo.findOne({ where: { name } });
  }

  create(crop: CropEntity): Promise<CropEntity> {
    return this.repo.save(this.repo.create(crop));
  }

  async delete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
