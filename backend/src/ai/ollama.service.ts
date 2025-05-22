import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OllamaService {
  private readonly baseUrl = 'http://localhost:11434';

  async generateText(prompt: string, model = 'codellama:7b-instruct'): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model,
        prompt,
        stream: false
      });
      return response.data.response;
    } catch (error) {
      throw new Error(`Ollama API error: ${error.message}`);
    }
  }

  async listModels(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.data.models;
    } catch (error) {
      throw new Error(`Ollama API error: ${error.message}`);
    }
  }
}