"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const ollama_service_1 = require("./ollama.service");
const axios_1 = require("axios");
jest.mock('axios');
const mockedAxios = axios_1.default;
describe('OllamaService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [ollama_service_1.OllamaService],
        }).compile();
        service = module.get(ollama_service_1.OllamaService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('generateText', () => {
        it('should return generated text', async () => {
            const mockResponse = { response: 'test response' };
            jest.spyOn(axios_1.default, 'post').mockResolvedValue({ data: mockResponse });
            const result = await service.generateText('test prompt');
            expect(result).toBe(mockResponse.response);
        });
        it('should throw error when API fails', async () => {
            jest.spyOn(axios_1.default, 'post').mockRejectedValue(new Error('API error'));
            await expect(service.generateText('test prompt')).rejects.toThrow('Ollama API error: API error');
        });
    });
    describe('listModels', () => {
        it('should return list of models', async () => {
            const mockResponse = { models: [{ name: 'codellama:7b-instruct' }] };
            jest.spyOn(axios_1.default, 'get').mockResolvedValue({ data: mockResponse });
            const result = await service.listModels();
            expect(result).toEqual(mockResponse.models);
        });
        it('should throw error when API fails', async () => {
            jest.spyOn(axios_1.default, 'get').mockRejectedValue(new Error('API error'));
            await expect(service.listModels()).rejects.toThrow('Ollama API error: API error');
        });
    });
});
//# sourceMappingURL=ollama.service.spec.js.map