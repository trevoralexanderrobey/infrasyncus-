import { ZettelkastenService } from './zettelkasten.service';
export declare class ZettelkastenController {
    private readonly zettelkastenService;
    constructor(zettelkastenService: ZettelkastenService);
    getAllNotes(password: string): Promise<any[]>;
    createNote(content: string, tags: string[], password: string, createdAt: string): Promise<any>;
    createLink(noteId1: string, noteId2: string, password: string): Promise<any>;
    getConnections(noteId: string, password: string): Promise<any[]>;
    getGraph(noteId: string, password: string): Promise<any>;
    getSuggestions(noteId: string, password: string): Promise<string[]>;
    analyzeText(text: string, password: string): Promise<import("./types").TextNetworkAnalysis>;
    analyzeTextIncremental(text: string, previousAnalysis: any, password: string): Promise<import("./types").TextNetworkAnalysis>;
    importFile(content: string, fileName: string, password: string): Promise<any[]>;
}
