import { Test, TestingModule } from '@nestjs/testing';
import { OllamaService } from './ollama.service';

describe('OllamaService', () => {
  let service: OllamaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OllamaService],
    }).compile();

    service = module.get<OllamaService>(OllamaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateText', () => {
    it('should return generated text', async () => {
      const mockResponse = { response: 'test response' };
      jest.spyOn(axios, 'post').mockResolvedValue({ data: mockResponse });
      
      const result = await service.generateText('test prompt');
      expect(result).toBe(mockResponse.response);
    });

    it('should throw error when API fails', async () => {
      jest.spyOn(axios, 'post').mockRejectedValue(new Error('API error'));
      
      await expect(service.generateText('test prompt')).rejects.toThrow('Ollama API error: API error');
    });
  });

  describe('listModels', () => {
    it('should return list of models', async () => {
      const mockResponse = { models: [{ name: 'codellama:7b-instruct' }] };
      jest.spyOn(axios, 'get').mockResolvedValue({ data: mockResponse });
      
      const result = await service.listModels();
      expect(result).toEqual(mockResponse.models);
    });

    it('should throw error when API fails', async () => {
      jest.spyOn(axios, 'get').mockRejectedValue(new Error('API error'));
      
      await expect(service.listModels()).rejects.toThrow('Ollama API error: API error');
    });
  });
});