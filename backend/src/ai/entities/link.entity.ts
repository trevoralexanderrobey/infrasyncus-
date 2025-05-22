import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Link {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sourceNoteId: string;

  @Column()
  targetNoteId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}