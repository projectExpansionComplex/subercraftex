import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  uid: string;

  @Column({ unique: true, length: 25 })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: 'user' })
  user_type: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true, default: 'https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png' })
  profile_picture_url: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'simple-array', nullable: true })
  specialties: string[];

  @Column({ nullable: true })
  years_experience: number;

  @Column({ nullable: true })
  portfolio_link: string;

  @Column({ nullable: true })
  company_name: string;

  @Column({ nullable: true })
  company_size: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ unique: true, nullable: true })
  google_id: string;

  @Column({ nullable: true })
  file_name: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  mobile: string;

  @Column({ nullable: true })
  address: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  zip: string;

  @Column({ default: false })
  is_deleted: boolean;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
