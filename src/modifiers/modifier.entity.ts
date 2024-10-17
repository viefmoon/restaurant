import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { SelectedModifier } from '../selected_modifiers/selected-modifier.entity';
import { ModifierType } from '../modifier_types/modifier-type.entity';

@Entity({ name: 'modifiers' })
export class Modifier {
  @PrimaryColumn({ unique: true })
  id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => ModifierType, (modifierType) => modifierType.modifiers)
  modifierType: ModifierType;

  @OneToMany(
    () => SelectedModifier,
    (selectedModifier) => selectedModifier.modifier,
  )
  selectedModifiers: SelectedModifier[];
}
