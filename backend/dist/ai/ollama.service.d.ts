export interface ModelConfig {
    name: string;
    type: 'text' | 'code' | 'multimodal';
    ramUsage: number;
    description: string;
    available: boolean;
}
export interface MultimodalAnalysis {
    textContent: string;
    concepts: string[];
    codeSnippets?: string[];
    diagrams?: string[];
    reasoning: string;
}
export declare class OllamaService {
    private readonly logger;
    private readonly baseUrl;
    private availableModels;
    constructor();
    checkAvailableModels(): Promise<void>;
    getAvailableModels(): ModelConfig[];
    getRecommendedModels(): {
        text: string;
        multimodal: string;
    };
    generateText(prompt: string, modelName?: string): Promise<string>;
    analyzeCode(code: string, language?: string): Promise<{
        concepts: string[];
        explanation: string;
        complexity: string;
    }>;
    analyzeImage(imageBase64: string, query?: string): Promise<MultimodalAnalysis>;
    generateConceptSuggestions(existingConcepts: string[], domain?: string): Promise<string[]>;
    generateKnowledgeInsights(concepts: string[], relationships: any[]): Promise<string[]>;
    private getPreferredTextModel;
    private extractFromResponse;
    private getFallbackResponse;
}
