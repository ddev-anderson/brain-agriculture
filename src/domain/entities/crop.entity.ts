import { Column, Entity, Index, OneToMany } from 'typeorm';

import { DefaultEntity } from './default.entity';
import { PlantingEntity } from './planting.entity';

// TypeORM Entity: Crop
// Represents a type of agricultural product (e.g. Soy, Corn, Coffee).
// A Crop can be associated with many Plantings.

@Entity({ name: 'crops' })
@Index('crops_name_idx', ['name'], { unique: true })
export class CropEntity extends DefaultEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name: string;

  @OneToMany(() => PlantingEntity, planting => planting.crop)
  plantings: PlantingEntity[];
}
