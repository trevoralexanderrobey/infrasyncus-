import { Module } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { ZettelkastenModule } from './zettelkasten.module';

@Module({
  imports: [ZettelkastenModule],
  providers: [OllamaService],
  exports: [OllamaService, ZettelkastenModule]
})
export class AiModule {}