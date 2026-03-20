import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { DefaultEntity } from './default.entity';
import { ProducerEntity } from './producer.entity';
import { PlantingEntity } from './planting.entity';

// TypeORM Entity: Farm (Rural Property)
// A Farm belongs to one Producer and can have many Plantings.

@Entity({ name: 'farms' })
@Index('farms_producer_id_idx', ['producerId'])
export class FarmEntity extends DefaultEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    name: 'city',
    type: 'varchar',
    length: 100,
  })
  city: string;

  @Column({
    name: 'state',
    type: 'varchar',
    length: 2,
    comment: 'State abbreviation (UF)',
  })
  state: string;

  @Column({
    name: 'total_area',
    type: 'numeric',
    precision: 12,
    scale: 4,
  })
  totalArea: number;

  @Column({
    name: 'arable_area',
    type: 'numeric',
    precision: 12,
    scale: 4,
    default: 0,
  })
  arableArea: number;

  @Column({
    name: 'vegetation_area',
    type: 'numeric',
    precision: 12,
    scale: 4,
    default: 0,
  })
  vegetationArea: number;

  @Column({
    name: 'producer_id',
    type: 'uuid',
  })
  producerId: string;

  @ManyToOne(() => ProducerEntity, producer => producer.farms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'producer_id', referencedColumnName: 'id' })
  producer: ProducerEntity;

  @OneToMany(() => PlantingEntity, planting => planting.farm, {
    cascade: true,
  })
  plantings: PlantingEntity[];
}
