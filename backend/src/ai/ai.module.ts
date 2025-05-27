import { Module } from "@nestjs/common";
import { OllamaService } from "./ollama.service";
import { WebSearchService } from "./web-search.service";
import { ZettelkastenModule } from "./zettelkasten.module";

@Module({
  imports: [ZettelkastenModule],
  providers: [OllamaService, WebSearchService],
  exports: [OllamaService, WebSearchService, ZettelkastenModule],
})
export class AiModule {}
