import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @ApiProperty({
    description: 'Role unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Role name',
    example: 'ADMIN',
    enum: ['ADMIN', 'AGENT', 'BUYER', 'SELLER']
  })
  @Column({ unique: true })
  name: string; // e.g., ADMIN, AGENT, BUYER, SELLER

  @ApiProperty({
    description: 'Role description',
    example: 'System administrator with full access',
    required: false
  })
  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
