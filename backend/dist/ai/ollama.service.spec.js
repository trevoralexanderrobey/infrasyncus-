"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const ollama_service_1 = require("./ollama.service");
global.fetch = jest.fn();
describe('OllamaService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [ollama_service_1.OllamaService],
        }).compile();
        service = module.get(ollama_service_1.OllamaService);
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('generateText', () => {
        it('should return generated text', async () => {
            const mockResponse = { response: 'test response' };
            fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });
            const result = await service.generateText('test prompt');
            expect(result).toBe('test response');
        });
        it('should return fallback when API fails', async () => {
            fetch.mockRejectedValue(new Error('API error'));
            const result = await service.generateText('test concept prompt');
            expect(result).toContain('analysis');
        });
    });
    describe('getAvailableModels', () => {
        it('should return available models', async () => {
            const result = service.getAvailableModels();
            expect(Array.isArray(result)).toBe(true);
            expect(result.every(model => model.hasOwnProperty('name'))).toBe(true);
        });
    });
    describe('analyzeCode', () => {
        it('should analyze code with available model', async () => {
            const mockResponse = { response: 'CONCEPTS: programming, function\nEXPLANATION: Test function\nCOMPLEXITY: Simple' };
            fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });
            jest.spyOn(service, 'getAvailableModels').mockReturnValue([
                { name: 'codellama:7b', type: 'code', ramUsage: 4.1, description: 'Test', available: true }
            ]);
            const result = await service.analyzeCode('function test() {}', 'javascript');
            expect(result.concepts).toContain('programming');
            expect(result.explanation).toContain('Test function');
            expect(result.complexity).toBe('Simple');
        });
        it('should handle missing code model', async () => {
            jest.spyOn(service, 'getAvailableModels').mockReturnValue([]);
            const result = await service.analyzeCode('function test() {}', 'javascript');
            expect(result.concepts).toContain('programming');
            expect(result.explanation).toContain('CodeLlama');
        });
    });
    describe('analyzeImage', () => {
        it('should return fallback when no multimodal model available', async () => {
            jest.spyOn(service, 'getAvailableModels').mockReturnValue([]);
            const result = await service.analyzeImage('base64image');
            expect(result.concepts).toContain('image');
            expect(result.reasoning).toContain('No multimodal model available');
        });
    });
});
//# sourceMappingURL=ollama.service.spec.js.map