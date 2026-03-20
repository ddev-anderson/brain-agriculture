import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { DefaultEntity } from './default.entity';
import { FarmEntity } from './farm.entity';
import { HarvestEntity } from './harvest.entity';
import { CropEntity } from './crop.entity';

// TypeORM Entity: Planting
// Junction entity representing a Crop grown on a Farm during a Harvest.
// Unique constraint: same crop cannot be planted twice on the same farm in the same harvest.

@Entity({ name: 'plantings' })
@Unique(['farm', 'harvest', 'crop'])
@Index('plantings_farm_id_idx', ['farmId'])
@Index('plantings_harvest_id_idx', ['harvestId'])
@Index('plantings_crop_id_idx', ['cropId'])
export class PlantingEntity extends DefaultEntity {
  @Column({
    name: 'farm_id',
    type: 'uuid',
  })
  farmId: string;

  @Column({
    name: 'harvest_id',
    type: 'uuid',
  })
  harvestId: string;

  @Column({
    name: 'crop_id',
    type: 'uuid',
  })
  cropId: string;

  @ManyToOne(() => FarmEntity, farm => farm.plantings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'farm_id', referencedColumnName: 'id' })
  farm: FarmEntity;

  @ManyToOne(() => HarvestEntity, harvest => harvest.plantings, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'harvest_id', referencedColumnName: 'id' })
  harvest: HarvestEntity;

  @ManyToOne(() => CropEntity, crop => crop.plantings, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'crop_id', referencedColumnName: 'id' })
  crop: CropEntity;
}
