export declare class OllamaService {
    private readonly baseUrl;
    generateText(prompt: string, model?: string): Promise<string>;
    listModels(): Promise<any>;
}
