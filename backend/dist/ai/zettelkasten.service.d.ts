import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { Link } from './entities/link.entity';
import { OllamaService } from './ollama.service';
export declare class ZettelkastenService {
    private noteRepository;
    private linkRepository;
    private readonly ollamaService;
    constructor(noteRepository: Repository<Note>, linkRepository: Repository<Link>, ollamaService: OllamaService);
}
