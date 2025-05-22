import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { Link } from './entities/link.entity';
import { ZettelkastenService } from './zettelkasten.service';
import { ZettelkastenController } from './zettelkasten.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Note, Link])],
  providers: [ZettelkastenService],
  controllers: [ZettelkastenController],
  exports: [ZettelkastenService]
})
export class ZettelkastenModule {}