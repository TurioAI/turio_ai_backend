import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ nullable: true })
  firebaseUid: string;

  @Column({ default: 'freemium' })
  membershipLevel: 'freemium' | 'explorer' | 'premium';

  @Column({ default: 0 })
  globalPoints: number;

  @Column({ default: 1 })
  userLevel: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
