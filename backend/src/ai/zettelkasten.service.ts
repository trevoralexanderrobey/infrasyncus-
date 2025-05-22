import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { Link } from './entities/link.entity';
import { OllamaService } from './ollama.service';

@Injectable()
export class ZettelkastenService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
    @InjectRepository(Link)
    private linkRepository: Repository<Link>,
    private readonly ollamaService: OllamaService,
  ) {}`},{

  async createAtomicNote(content: string): Promise<Note> {
    const note = this.noteRepository.create({ content });
    return this.noteRepository.save(note);
  }

  async createBidirectionalLink(noteId1: string, noteId2: string): Promise<Link> {
    const link = this.linkRepository.create({
      sourceNoteId: noteId1,
      targetNoteId: noteId2,
    });
    return this.linkRepository.save(link);
  }

  async getConnectedNotes(noteId: string): Promise<Note[]> {
    const links = await this.linkRepository.find({
      where: [{ sourceNoteId: noteId }, { targetNoteId: noteId }],
    });
    
    const connectedNoteIds = links.map(link => 
      link.sourceNoteId === noteId ? link.targetNoteId : link.sourceNoteId
    );
    
    return this.noteRepository.findByIds(connectedNoteIds);
  }

  async visualizeKnowledgeGraph(noteId: string): Promise<any> {
    const notes = await this.getConnectedNotes(noteId);
    const links = await this.linkRepository.find({
      where: [{ sourceNoteId: noteId }, { targetNoteId: noteId }],
    });
    
    return {
      nodes: notes.map(note => ({
        id: note.id,
        content: note.content,
      })),
      links: links.map(link => ({
        source: link.sourceNoteId,
        target: link.targetNoteId,
      })),
    };
  }

  async suggestRelatedNotes(noteId: string): Promise<string[]> {
    const note = await this.noteRepository.findOne(noteId);
    if (!note) return [];
    
    const prompt = `Analyze this note and suggest 3-5 related concepts or topics that would make good connections in a knowledge graph:\n\n${note.content}`;
    const response = await this.ollamaService.generateText(prompt);
    
    // Parse the response into an array of suggestions
    return response.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }
}