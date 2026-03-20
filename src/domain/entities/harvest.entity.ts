import { Column, Entity, Index, OneToMany } from 'typeorm';

import { DefaultEntity } from './default.entity';
import { PlantingEntity } from './planting.entity';

// TypeORM Entity: Harvest
// Represents a crop year. A Harvest can have many Plantings.

@Entity({ name: 'harvests' })
@Index('harvests_year_idx', ['year'], { unique: true })
export class HarvestEntity extends DefaultEntity {
  @Column({
    name: 'year',
    type: 'int',
    unique: true,
  })
  year: number;

  @OneToMany(() => PlantingEntity, planting => planting.harvest)
  plantings: PlantingEntity[];
}
