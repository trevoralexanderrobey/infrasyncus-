import { Controller, Get, Post, Body, Param, Query, UnauthorizedException } from '@nestjs/common';
import { ZettelkastenService } from './zettelkasten.service';

// Controller for Zettelkasten functionality
@Controller('zettelkasten')
export class ZettelkastenController {
  constructor(private readonly zettelkastenService: ZettelkastenService) {}

  @Get('notes')
  async getAllNotes(@Query('password') password: string) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.getAllNotes();
  }

  @Post('notes')
  async createNote(
    @Body('content') content: string, 
    @Body('tags') tags: string[],
    @Body('password') password: string,
    @Body('createdAt') createdAt: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.createAtomicNote(content, tags, createdAt);
  }

  @Post('links')
  async createLink(
    @Body('noteId1') noteId1: string,
    @Body('noteId2') noteId2: string,
    @Body('password') password: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.createBidirectionalLink(noteId1, noteId2);
  }

  @Get('notes/:id/connections')
  async getConnections(@Param('id') noteId: string, @Query('password') password: string) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.getConnectedNotes(noteId);
  }

  @Get('notes/:id/graph')
  async getGraph(@Param('id') noteId: string, @Query('password') password: string) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.visualizeKnowledgeGraph(noteId);
  }

  @Get('notes/:id/suggestions')
  async getSuggestions(@Param('id') noteId: string, @Query('password') password: string) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.suggestRelatedNotes(noteId);
  }

  @Post('text/analyze')
  async analyzeText(
    @Body('text') text: string,
    @Body('password') password: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.analyzeTextNetwork(text);
  }

  @Post('text/analyze-incremental')
  async analyzeTextIncremental(
    @Body('text') text: string,
    @Body('previousAnalysis') previousAnalysis: any,
    @Body('password') password: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    
    // For now, we'll use the same method since the service doesn't have incremental analysis yet
    return this.zettelkastenService.analyzeTextNetwork(text);
  }

  @Post('import/file')
  async importFile(
    @Body('content') content: string,
    @Body('fileName') fileName: string,
    @Body('password') password: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.importFromFile(content, fileName);
  }
}