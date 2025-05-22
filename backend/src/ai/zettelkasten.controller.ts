import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ZettelkastenService } from './zettelkasten.service';

@Controller('zettelkasten')
export class ZettelkastenController {
  constructor(private readonly zettelkastenService: ZettelkastenService) {}

  @Post('notes')
  async createNote(@Body('content') content: string, @Body('password') password: string) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.createAtomicNote(content);
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
}