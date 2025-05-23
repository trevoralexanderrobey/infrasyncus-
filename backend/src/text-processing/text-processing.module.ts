import { Module } from '@nestjs/common';
import { TextProcessingService } from './text-processing.service';
import { TextProcessingController } from './text-processing.controller';
import { JanusGraphModule } from '../janusgraph/janusgraph.module';

@Module({
  imports: [JanusGraphModule],
  controllers: [TextProcessingController],
  providers: [TextProcessingService],
  exports: [TextProcessingService]
})
export class TextProcessingModule {}