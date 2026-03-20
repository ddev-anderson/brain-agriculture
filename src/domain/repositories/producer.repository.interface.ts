import { ProducerEntity } from '../entities/producer.entity';

export interface IProducerRepository {
  findAll(): Promise<ProducerEntity[]>;
  findById(id: string): Promise<ProducerEntity | null>;
  findByDocument(document: string): Promise<ProducerEntity | null>;
  create(producer: ProducerEntity): Promise<ProducerEntity>;
  update(producer: ProducerEntity): Promise<ProducerEntity>;
  delete(id: string): Promise<void>;
}
