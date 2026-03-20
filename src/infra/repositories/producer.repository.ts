import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProducerEntity } from '@domain/entities/producer.entity';
import { IProducerRepository } from '@domain/repositories/producer.repository.interface';

@Injectable()
export class ProducerRepository implements IProducerRepository {
  constructor(
    @InjectRepository(ProducerEntity)
    private readonly repo: Repository<ProducerEntity>,
  ) {}

  findAll(): Promise<ProducerEntity[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  findById(id: string): Promise<ProducerEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByDocument(document: string): Promise<ProducerEntity | null> {
    return this.repo.findOne({ where: { document } });
  }

  create(producer: ProducerEntity): Promise<ProducerEntity> {
    return this.repo.save(this.repo.create(producer));
  }

  async update(producer: ProducerEntity): Promise<ProducerEntity> {
    await this.repo.update(producer.id, { name: producer.name, document: producer.document });
    return this.repo.findOne({ where: { id: producer.id } }) as Promise<ProducerEntity>;
  }

  async delete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
