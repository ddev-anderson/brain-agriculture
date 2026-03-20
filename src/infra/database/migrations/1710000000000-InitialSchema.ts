import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── producers ───────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'producers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'cpf_cnpj', type: 'varchar', length: '14', isUnique: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'producers',
      new TableIndex({ name: 'producers_cpf_cnpj_idx', columnNames: ['cpf_cnpj'], isUnique: true }),
    );

    // ─── farms ────────────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'farms',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'city', type: 'varchar', length: '100' },
          { name: 'state', type: 'varchar', length: '2', comment: 'State abbreviation (UF)' },
          { name: 'total_area', type: 'numeric', precision: 12, scale: 4 },
          { name: 'arable_area', type: 'numeric', precision: 12, scale: 4, default: '0' },
          { name: 'vegetation_area', type: 'numeric', precision: 12, scale: 4, default: '0' },
          { name: 'producer_id', type: 'uuid' },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'farms',
      new TableIndex({ name: 'farms_producer_id_idx', columnNames: ['producer_id'] }),
    );

    await queryRunner.createForeignKey(
      'farms',
      new TableForeignKey({
        name: 'fk_farms_producer',
        columnNames: ['producer_id'],
        referencedTableName: 'producers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // ─── harvests ────────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'harvests',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'ano', type: 'int', isUnique: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'harvests',
      new TableIndex({ name: 'harvests_ano_idx', columnNames: ['ano'], isUnique: true }),
    );

    // ─── crops ───────────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'crops',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'nome', type: 'varchar', length: '100', isUnique: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'crops',
      new TableIndex({ name: 'crops_nome_idx', columnNames: ['nome'], isUnique: true }),
    );

    // ─── plantings ───────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'plantings',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'farm_id', type: 'uuid' },
          { name: 'harvest_id', type: 'uuid' },
          { name: 'crop_id', type: 'uuid' },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
        ],
        uniques: [{ name: 'uq_plantings_farm_harvest_crop', columnNames: ['farm_id', 'harvest_id', 'crop_id'] }],
      }),
      true,
    );

    await queryRunner.createIndex(
      'plantings',
      new TableIndex({ name: 'plantings_farm_id_idx', columnNames: ['farm_id'] }),
    );
    await queryRunner.createIndex(
      'plantings',
      new TableIndex({ name: 'plantings_harvest_id_idx', columnNames: ['harvest_id'] }),
    );
    await queryRunner.createIndex(
      'plantings',
      new TableIndex({ name: 'plantings_crop_id_idx', columnNames: ['crop_id'] }),
    );

    await queryRunner.createForeignKey(
      'plantings',
      new TableForeignKey({
        name: 'fk_plantings_farm',
        columnNames: ['farm_id'],
        referencedTableName: 'farms',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'plantings',
      new TableForeignKey({
        name: 'fk_plantings_harvest',
        columnNames: ['harvest_id'],
        referencedTableName: 'harvests',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'plantings',
      new TableForeignKey({
        name: 'fk_plantings_crop',
        columnNames: ['crop_id'],
        referencedTableName: 'crops',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('plantings', true);
    await queryRunner.dropTable('crops', true);
    await queryRunner.dropTable('harvests', true);
    await queryRunner.dropTable('farms', true);
    await queryRunner.dropTable('producers', true);
  }
}
