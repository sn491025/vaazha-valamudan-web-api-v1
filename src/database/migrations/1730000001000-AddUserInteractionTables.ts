import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserInteractionTables1730000001000 implements MigrationInterface {
  name = 'AddUserInteractionTables1730000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create saved_searches table
    await queryRunner.query(`
      CREATE TABLE "saved_searches" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "entity_type" character varying(50) NOT NULL,
        "search_criteria" jsonb NOT NULL,
        "name" character varying,
        "is_active" boolean NOT NULL DEFAULT true,
        "notify_on_new" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_saved_searches" PRIMARY KEY ("id")
      )
    `);

    // Create favorites table
    await queryRunner.query(`
      CREATE TABLE "favorites" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "entity_type" character varying(50) NOT NULL,
        "entity_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_favorites" PRIMARY KEY ("id")
      )
    `);

    // Create enquiries table
    await queryRunner.query(`
      CREATE TABLE "enquiries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "entity_type" character varying(50) NOT NULL,
        "entity_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying,
        "message" text NOT NULL,
        "status" character varying NOT NULL DEFAULT 'new',
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_enquiries" PRIMARY KEY ("id")
      )
    `);

    // Create lead_statuses table
    await queryRunner.query(`
      CREATE TABLE "lead_statuses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "enquiry_id" uuid NOT NULL,
        "status" character varying NOT NULL,
        "notes" text,
        "assigned_to_id" uuid NOT NULL,
        "follow_up_date" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_lead_statuses" PRIMARY KEY ("id")
      )
    `);

    // Add indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_saved_searches_user_id" ON "saved_searches" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_saved_searches_entity_type" ON "saved_searches" ("entity_type")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_favorites_user_entity" ON "favorites" ("user_id", "entity_type", "entity_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_enquiries_entity" ON "enquiries" ("entity_type", "entity_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_enquiries_user_id" ON "enquiries" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_enquiries_status" ON "enquiries" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_lead_statuses_enquiry_id" ON "lead_statuses" ("enquiry_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_lead_statuses_assigned_to_id" ON "lead_statuses" ("assigned_to_id")
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "saved_searches" 
      ADD CONSTRAINT "FK_saved_searches_user_id" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "favorites" 
      ADD CONSTRAINT "FK_favorites_user_id" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "enquiries" 
      ADD CONSTRAINT "FK_enquiries_user_id" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "lead_statuses" 
      ADD CONSTRAINT "FK_lead_statuses_enquiry_id" 
      FOREIGN KEY ("enquiry_id") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "lead_statuses" 
      ADD CONSTRAINT "FK_lead_statuses_assigned_to_id" 
      FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "lead_statuses" DROP CONSTRAINT "FK_lead_statuses_assigned_to_id"`);
    await queryRunner.query(`ALTER TABLE "lead_statuses" DROP CONSTRAINT "FK_lead_statuses_enquiry_id"`);
    await queryRunner.query(`ALTER TABLE "enquiries" DROP CONSTRAINT "FK_enquiries_user_id"`);
    await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_favorites_user_id"`);
    await queryRunner.query(`ALTER TABLE "saved_searches" DROP CONSTRAINT "FK_saved_searches_user_id"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_lead_statuses_assigned_to_id"`);
    await queryRunner.query(`DROP INDEX "IDX_lead_statuses_enquiry_id"`);
    await queryRunner.query(`DROP INDEX "IDX_enquiries_status"`);
    await queryRunner.query(`DROP INDEX "IDX_enquiries_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_enquiries_entity"`);
    await queryRunner.query(`DROP INDEX "IDX_favorites_user_entity"`);
    await queryRunner.query(`DROP INDEX "IDX_saved_searches_entity_type"`);
    await queryRunner.query(`DROP INDEX "IDX_saved_searches_user_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "lead_statuses"`);
    await queryRunner.query(`DROP TABLE "enquiries"`);
    await queryRunner.query(`DROP TABLE "favorites"`);
    await queryRunner.query(`DROP TABLE "saved_searches"`);
  }
}
