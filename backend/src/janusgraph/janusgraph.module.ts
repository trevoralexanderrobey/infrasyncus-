import { Module } from '@nestjs/common';
import { JanusGraphService } from './janusgraph.service';

@Module({
  providers: [JanusGraphService],
  exports: [JanusGraphService]
})
export class JanusGraphModule {} 