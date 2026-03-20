import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Renames columns that were created with Portuguese names in the initial
 * schema migration to match the English names now used in the TypeORM entities.
 *
 * producers: cpf_cnpj  → document
 * harvests:  ano       → year
 * crops:     nome      → name
 */
export class RenameColumnsToEnglish1710000000001 implements MigrationInterface {
  name = 'RenameColumnsToEnglish1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── producers: cpf_cnpj → document ──────────────────────────────────
    await queryRunner.dropIndex('producers', 'producers_cpf_cnpj_idx');
    await queryRunner.renameColumn('producers', 'cpf_cnpj', 'document');
    await queryRunner.query(
      `CREATE UNIQUE INDEX "producers_tax_id_idx" ON "producers" ("document")`,
    );

    // ─── harvests: ano → year ────────────────────────────────────────────
    await queryRunner.dropIndex('harvests', 'harvests_ano_idx');
    await queryRunner.renameColumn('harvests', 'ano', 'year');
    await queryRunner.query(`CREATE UNIQUE INDEX "harvests_year_idx" ON "harvests" ("year")`);

    // ─── crops: nome → name ──────────────────────────────────────────────
    await queryRunner.dropIndex('crops', 'crops_nome_idx');
    await queryRunner.renameColumn('crops', 'nome', 'name');
    await queryRunner.query(`CREATE UNIQUE INDEX "crops_name_idx" ON "crops" ("name")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ─── crops: name → nome ──────────────────────────────────────────────
    await queryRunner.dropIndex('crops', 'crops_name_idx');
    await queryRunner.renameColumn('crops', 'name', 'nome');
    await queryRunner.query(`CREATE UNIQUE INDEX "crops_nome_idx" ON "crops" ("nome")`);

    // ─── harvests: year → ano ────────────────────────────────────────────
    await queryRunner.dropIndex('harvests', 'harvests_year_idx');
    await queryRunner.renameColumn('harvests', 'year', 'ano');
    await queryRunner.query(`CREATE UNIQUE INDEX "harvests_ano_idx" ON "harvests" ("ano")`);

    // ─── producers: document → cpf_cnpj ─────────────────────────────────
    await queryRunner.dropIndex('producers', 'producers_tax_id_idx');
    await queryRunner.renameColumn('producers', 'document', 'cpf_cnpj');
    await queryRunner.query(
      `CREATE UNIQUE INDEX "producers_cpf_cnpj_idx" ON "producers" ("cpf_cnpj")`,
    );
  }
}
