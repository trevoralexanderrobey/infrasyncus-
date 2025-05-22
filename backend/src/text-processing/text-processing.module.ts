import { Module } from '@nestjs/common';
import { TextProcessingService } from './text-processing.service';
import { TextProcessingController } from './text-processing.controller';
import { Neo4jModule } from '../neo4j/neo4j.module';

@Module({
  imports: [Neo4jModule],
  controllers: [TextProcessingController],
  providers: [TextProcessingService]
})
export class TextProcessingModule {}