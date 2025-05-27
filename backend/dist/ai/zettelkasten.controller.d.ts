import { TextNetworkAnalysis, ZettelkastenService } from "./zettelkasten.service";
export declare class ZettelkastenController {
    private readonly zettelkastenService;
    constructor(zettelkastenService: ZettelkastenService);
    getAllNotes(password: string): Promise<any[]>;
    createNote(content: string, tags: string[], password: string, createdAt: string): Promise<any>;
    createLink(noteId1: string, noteId2: string, password: string): Promise<any>;
    getConnections(noteId: string, password: string): Promise<any[]>;
    getGraph(noteId: string, password: string): Promise<any>;
    getSuggestions(noteId: string, password: string): Promise<string[]>;
    analyzeText(text: string, password: string): Promise<TextNetworkAnalysis>;
    analyzeTextIncremental(text: string, previousAnalysis: any, password: string): Promise<TextNetworkAnalysis>;
    importFile(content: string, fileName: string, password: string): Promise<any[]>;
    exportGraph(text: string, format: "json" | "gexf" | "csv", password: string): Promise<string | TextNetworkAnalysis | {
        nodes: string;
        edges: string;
    }>;
    getGraphVisualization(password: string): Promise<{
        nodes: any[];
        edges: any[];
    }>;
    getGraphStats(password: string): Promise<any>;
    searchGraph(query: string, password: string): Promise<any[]>;
    getConceptClusters(password: string): Promise<any[]>;
    getKnowledgePaths(source: string, target: string, password: string): Promise<any[]>;
    getConceptNeighborhood(concept: string, depth: string, password: string): Promise<any>;
    getConceptCentrality(password: string): Promise<any[]>;
    detectKnowledgeGaps(password: string): Promise<any[]>;
    getTemporalEvolution(timeframe: "day" | "week" | "month", password: string): Promise<any[]>;
    findSimilarConcepts(concept: string, limit: string, password: string): Promise<any[]>;
    getEnhancedVisualization(password: string): Promise<any>;
    getAvailableModels(password: string): Promise<any[]>;
    getRecommendedModels(password: string): Promise<any>;
    analyzeCode(code: string, language: string, password: string): Promise<any>;
    analyzeImage(imageBase64: string, query: string, password: string): Promise<any>;
    suggestConcepts(domain: string, password: string): Promise<any>;
    generateInsights(password: string): Promise<any>;
    analyzeTextEnhanced(text: string, useAI: boolean, password: string): Promise<any>;
    searchAndCreateNotes(query: string, context: string, password: string): Promise<{
        searchResults: import("./web-search.service").EnhancedSearchResponse;
        createdNotes: any[];
    }>;
    enrichNote(noteId: string, domain: string, password: string): Promise<{
        originalNote: any;
        enrichmentResults: import("./web-search.service").EnhancedSearchResponse;
        connections: any[];
    }>;
    fillKnowledgeGaps(gapDescription: string, password: string): Promise<{
        searchResults: import("./web-search.service").EnhancedSearchResponse;
        suggestedConnections: any[];
    }>;
    getCurrentInformation(concept: string, timeframe: "recent" | "latest", password: string): Promise<import("./web-search.service").EnhancedSearchResponse>;
    private generateGEXF;
    private generateCSV;
}
