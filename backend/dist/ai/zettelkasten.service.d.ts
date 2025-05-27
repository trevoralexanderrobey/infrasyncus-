import { PrismaService } from "../prisma/prisma.service";
import { OllamaService } from "./ollama.service";
import { EnhancedSearchResponse, WebSearchService } from "./web-search.service";
export interface NetworkNode {
    id: string;
    label: string;
    frequency: number;
    centrality: number;
    group: number;
    x?: number;
    y?: number;
    color?: string;
}
export interface NetworkEdge {
    source: string;
    target: string;
    weight: number;
    type: string;
}
export interface GraphMetrics {
    modularity: number;
    density: number;
    averageClustering: number;
    averagePathLength: number;
    diameter: number;
    nodeCount: number;
    edgeCount: number;
}
export interface TextNetworkAnalysis {
    nodes: NetworkNode[];
    edges: NetworkEdge[];
    topics: string[][];
    insights: string[];
    contentGaps: string[];
    keyTerms: string[];
    diversity: number;
    metrics: GraphMetrics;
    structuralGaps: any[];
}
export declare class ZettelkastenService {
    private readonly prisma;
    private readonly ollamaService;
    private readonly webSearchService;
    constructor(prisma: PrismaService, ollamaService: OllamaService, webSearchService: WebSearchService);
    getAllNotes(): Promise<any[]>;
    createAtomicNote(content: string, tags?: string[], createdAt?: string): Promise<any>;
    createBidirectionalLink(noteId1: string, noteId2: string): Promise<any>;
    getConnectedNotes(noteId: string): Promise<any[]>;
    visualizeKnowledgeGraph(noteId: string): Promise<any>;
    analyzeTextNetwork(text: string): Promise<TextNetworkAnalysis>;
    getAvailableAIModels(): Promise<any[]>;
    getRecommendedModels(): Promise<any>;
    analyzeCodeWithAI(code: string, language?: string): Promise<any>;
    analyzeImageWithAI(imageBase64: string, query?: string): Promise<any>;
    generateConceptSuggestions(domain?: string): Promise<any>;
    generateKnowledgeInsights(): Promise<any>;
    analyzeTextWithAI(text: string, useAI?: boolean): Promise<any>;
    searchAndCreateNotes(query: string, context?: string): Promise<{
        searchResults: EnhancedSearchResponse;
        createdNotes: any[];
    }>;
    enrichExistingNote(noteId: string, domain?: string): Promise<{
        originalNote: any;
        enrichmentResults: EnhancedSearchResponse;
        connections: any[];
    }>;
    fillKnowledgeGapsWithSearch(gapDescription: string): Promise<{
        searchResults: EnhancedSearchResponse;
        suggestedConnections: any[];
    }>;
    findCurrentInformation(concept: string, timeframe?: "recent" | "latest"): Promise<EnhancedSearchResponse>;
    private findPotentialConnections;
    suggestRelatedNotes(noteId: string): Promise<string[]>;
    analyzeTextIncremental(text: string, previousAnalysis?: any): Promise<TextNetworkAnalysis>;
    importFromFile(content: string, fileName: string): Promise<any[]>;
    getGraphVisualization(): Promise<{
        nodes: any[];
        edges: any[];
    }>;
    getGraphStats(): Promise<any>;
    searchGraphNodes(query: string): Promise<any[]>;
    getConceptClusters(): Promise<any[]>;
    getKnowledgePaths(source: string, target: string): Promise<any[]>;
    getConceptNeighborhood(concept: string, depth?: number): Promise<any>;
    getConceptCentrality(): Promise<any[]>;
    detectKnowledgeGaps(): Promise<any[]>;
    getTemporalEvolution(timeframe?: "day" | "week" | "month"): Promise<any[]>;
    findSimilarConcepts(concept: string, limit?: number): Promise<any[]>;
    getEnhancedVisualizationData(): Promise<any>;
    private preprocessText;
    private extractWords;
    private generateNGrams;
    private buildNetwork;
    private calculateCentrality;
    private detectCommunities;
    private assignCommunity;
    private extractTopics;
    private identifyContentGaps;
    private extractKeyTerms;
    private calculateDiversity;
    private generateInsights;
    private getRandomColor;
}
