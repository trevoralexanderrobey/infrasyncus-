import { ZettelkastenService } from './zettelkasten.service';
export declare class ZettelkastenController {
    private readonly zettelkastenService;
    constructor(zettelkastenService: ZettelkastenService);
    createNote(content: string, password: string): Promise<any>;
    createLink(noteId1: string, noteId2: string, password: string): Promise<any>;
    getConnections(noteId: string, password: string): Promise<any>;
    getGraph(noteId: string, password: string): Promise<any>;
    getSuggestions(noteId: string, password: string): Promise<any>;
}
