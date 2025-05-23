import { Module } from '@nestjs/common';
import { EmbeddedGraphService } from './embedded-graph.service';

@Module({
  providers: [EmbeddedGraphService],
  exports: [EmbeddedGraphService],
})
export class GraphModule {} 