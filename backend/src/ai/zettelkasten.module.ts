import { Module } from '@nestjs/common';
import { ZettelkastenService } from './zettelkasten.service';
import { ZettelkastenController } from './zettelkasten.controller';
import { PrismaService } from '../prisma/prisma.service';
import { OllamaService } from './ollama.service';
import { JanusGraphModule } from '../janusgraph/janusgraph.module';

@Module({
  imports: [JanusGraphModule],
  providers: [ZettelkastenService, PrismaService, OllamaService],
  controllers: [ZettelkastenController],
  exports: [ZettelkastenService]
})
export class ZettelkastenModule {}