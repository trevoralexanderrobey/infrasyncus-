import { Controller, Post, Body } from '@nestjs/common';
import { TextProcessingService } from './text-processing.service';

@Controller('text-processing')
export class TextProcessingController {
  constructor(private readonly textProcessingService: TextProcessingService) {}

  @Post('process')
  async processText(@Body() body: { text: string }) {
    return this.textProcessingService.processTextToNetwork(body.text);
  }
}