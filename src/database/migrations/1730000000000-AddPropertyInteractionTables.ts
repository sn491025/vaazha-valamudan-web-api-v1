import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropertyInteractionTables1730000000000 implements MigrationInterface {
  name = 'AddPropertyInteractionTables1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create property_saved_searches table
    await queryRunner.query(`
      CREATE TABLE "property_saved_searches" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "searchCriteria" jsonb NOT NULL,
        "name" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "notifyOnNew" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_property_saved_searches" PRIMARY KEY ("id")
      )
    `);

    // Create property_favorites table
    await queryRunner.query(`
      CREATE TABLE "property_favorites" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "property_id" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_property_favorites" PRIMARY KEY ("id")
      )
    `);

    // Create property_enquiries table
    await queryRunner.query(`
      CREATE TABLE "property_enquiries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "property_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying,
        "message" text NOT NULL,
        "status" character varying NOT NULL DEFAULT 'new',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_property_enquiries" PRIMARY KEY ("id")
      )
    `);

    // Create property_lead_statuses table
    await queryRunner.query(`
      CREATE TABLE "property_lead_statuses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "enquiry_id" uuid NOT NULL,
        "status" character varying NOT NULL,
        "notes" text,
        "assigned_to_id" uuid NOT NULL,
        "followUpDate" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_property_lead_statuses" PRIMARY KEY ("id")
      )
    `);

    // Add indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_property_saved_searches_user_id" ON "property_saved_searches" ("user_id")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_property_favorites_user_property" ON "property_favorites" ("user_id", "property_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_property_enquiries_property_id" ON "property_enquiries" ("property_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_property_enquiries_user_id" ON "property_enquiries" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_property_enquiries_status" ON "property_enquiries" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_property_lead_statuses_enquiry_id" ON "property_lead_statuses" ("enquiry_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_property_lead_statuses_assigned_to_id" ON "property_lead_statuses" ("assigned_to_id")
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "property_saved_searches" 
      ADD CONSTRAINT "FK_property_saved_searches_user_id" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "property_favorites" 
      ADD CONSTRAINT "FK_property_favorites_user_id" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "property_favorites" 
      ADD CONSTRAINT "FK_property_favorites_property_id" 
      FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "property_enquiries" 
      ADD CONSTRAINT "FK_property_enquiries_user_id" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "property_enquiries" 
      ADD CONSTRAINT "FK_property_enquiries_property_id" 
      FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "property_lead_statuses" 
      ADD CONSTRAINT "FK_property_lead_statuses_enquiry_id" 
      FOREIGN KEY ("enquiry_id") REFERENCES "property_enquiries"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "property_lead_statuses" 
      ADD CONSTRAINT "FK_property_lead_statuses_assigned_to_id" 
      FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "property_lead_statuses" DROP CONSTRAINT "FK_property_lead_statuses_assigned_to_id"`);
    await queryRunner.query(`ALTER TABLE "property_lead_statuses" DROP CONSTRAINT "FK_property_lead_statuses_enquiry_id"`);
    await queryRunner.query(`ALTER TABLE "property_enquiries" DROP CONSTRAINT "FK_property_enquiries_property_id"`);
    await queryRunner.query(`ALTER TABLE "property_enquiries" DROP CONSTRAINT "FK_property_enquiries_user_id"`);
    await queryRunner.query(`ALTER TABLE "property_favorites" DROP CONSTRAINT "FK_property_favorites_property_id"`);
    await queryRunner.query(`ALTER TABLE "property_favorites" DROP CONSTRAINT "FK_property_favorites_user_id"`);
    await queryRunner.query(`ALTER TABLE "property_saved_searches" DROP CONSTRAINT "FK_property_saved_searches_user_id"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_property_lead_statuses_assigned_to_id"`);
    await queryRunner.query(`DROP INDEX "IDX_property_lead_statuses_enquiry_id"`);
    await queryRunner.query(`DROP INDEX "IDX_property_enquiries_status"`);
    await queryRunner.query(`DROP INDEX "IDX_property_enquiries_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_property_enquiries_property_id"`);
    await queryRunner.query(`DROP INDEX "IDX_property_favorites_user_property"`);
    await queryRunner.query(`DROP INDEX "IDX_property_saved_searches_user_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "property_lead_statuses"`);
    await queryRunner.query(`DROP TABLE "property_enquiries"`);
    await queryRunner.query(`DROP TABLE "property_favorites"`);
    await queryRunner.query(`DROP TABLE "property_saved_searches"`);
  }
}
