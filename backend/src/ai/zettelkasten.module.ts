import { Module } from '@nestjs/common';
import { GraphModule } from '../graph/graph.module';
import { PrismaService } from '../prisma/prisma.service';
import { OllamaService } from './ollama.service';
import { WebSearchService } from './web-search.service';
import { ZettelkastenController } from './zettelkasten.controller';
import { ZettelkastenService } from './zettelkasten.service';

@Module({
  imports: [GraphModule],
  providers: [ZettelkastenService, PrismaService, OllamaService, WebSearchService],
  controllers: [ZettelkastenController],
  exports: [ZettelkastenService]
})
export class ZettelkastenModule {}