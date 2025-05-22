"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZettelkastenService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const note_entity_1 = require("./entities/note.entity");
const link_entity_1 = require("./entities/link.entity");
const ollama_service_1 = require("./ollama.service");
let ZettelkastenService = class ZettelkastenService {
    constructor(noteRepository, linkRepository, ollamaService) {
        this.noteRepository = noteRepository;
        this.linkRepository = linkRepository;
        this.ollamaService = ollamaService;
    }
};
exports.ZettelkastenService = ZettelkastenService;
exports.ZettelkastenService = ZettelkastenService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(note_entity_1.Note)),
    __param(1, (0, typeorm_1.InjectRepository)(link_entity_1.Link)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, ollama_service_1.OllamaService])
], ZettelkastenService);
`},{

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
    
    const prompt = `;
Analyze;
this;
note;
and;
suggest;
3 - 5;
related;
concepts;
or;
topics;
that;
would;
make;
good;
connections in a;
knowledge;
graph: ;
n;
n$;
{
    note.content;
}
`;
    const response = await this.ollamaService.generateText(prompt);
    
    // Parse the response into an array of suggestions
    return response.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }
};
//# sourceMappingURL=zettelkasten.service.js.map