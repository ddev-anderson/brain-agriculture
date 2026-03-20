import { Column, Entity, Index, OneToMany } from 'typeorm';

import { DefaultEntity } from './default.entity';
import { FarmEntity } from './farm.entity';

// TypeORM Entity: Rural Producer
// A Producer can have one or many Farms.

@Entity({ name: 'producers' })
export class ProducerEntity extends DefaultEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    name: 'document',
    type: 'varchar',
    length: 14,
    unique: true,
    comment: 'CPF (11 digits) or CNPJ (14 digits), digits only',
  })
  document: string;

  @OneToMany(() => FarmEntity, farm => farm.producer, {
    cascade: true,
  })
  farms: FarmEntity[];
}
