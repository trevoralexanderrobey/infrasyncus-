import { Injectable, Logger } from '@nestjs/common';

export interface ModelConfig {
  name: string;
  type: 'text' | 'code' | 'multimodal';
  ramUsage: number; // in GB
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

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly baseUrl: string;
  private availableModels: ModelConfig[] = [
    {
      name: 'codellama:7b',
      type: 'code',
      ramUsage: 4.1,
      description: 'CodeLlama for programming concepts and code analysis',
      available: false
    },
    {
      name: 'llava:7b',
      type: 'multimodal',
      ramUsage: 4.1,
      description: 'LLaVA for image + text analysis (RECOMMENDED)',
      available: false
    },
    {
      name: 'bakllava',
      type: 'multimodal',
      ramUsage: 4.1,
      description: 'BakLLaVA lightweight multimodal model',
      available: false
    },
    {
      name: 'moondream:1.8b',
      type: 'multimodal',
      ramUsage: 1.7,
      description: 'Tiny but capable multimodal model (FAST)',
      available: false
    }
  ];

  constructor() {
    this.baseUrl = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.checkAvailableModels();
  }

  async checkAvailableModels(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        const installedModels = data.models?.map((m: any) => m.name) || [];
        
        this.availableModels.forEach(model => {
          model.available = installedModels.some((installed: string) => 
            installed.startsWith(model.name.split(':')[0])
          );
        });

        this.logger.log(`Available models: ${this.availableModels.filter(m => m.available).map(m => m.name).join(', ')}`);
      }
    } catch (error) {
      this.logger.warn('Ollama not available - AI features will be limited');
    }
  }

  getAvailableModels(): ModelConfig[] {
    return this.availableModels.filter(m => m.available);
  }

  getRecommendedModels(): { text: string; multimodal: string } {
    const multimodalModels = this.availableModels.filter(m => m.type === 'multimodal' && m.available);
    const codeModels = this.availableModels.filter(m => m.type === 'code' && m.available);
    
    return {
      text: codeModels.length > 0 ? codeModels[0].name : 'No code model available',
      multimodal: multimodalModels.length > 0 ? multimodalModels[0].name : 'No multimodal model available'
    };
  }

  async generateText(prompt: string, modelName?: string): Promise<string> {
    const model = modelName || this.getPreferredTextModel();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 1000
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || 'No response generated';
    } catch (error) {
      this.logger.error('Failed to generate text:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  async analyzeCode(code: string, language?: string): Promise<{ concepts: string[]; explanation: string; complexity: string }> {
    const codeModel = this.availableModels.find(m => m.type === 'code' && m.available);
    
    if (!codeModel) {
      return {
        concepts: ['programming', 'code', language || 'unknown'].filter(Boolean),
        explanation: 'Code analysis requires CodeLlama model',
        complexity: 'Unknown'
      };
    }

    const prompt = `Analyze this ${language || 'code'} and extract:
1. Key programming concepts used
2. Brief explanation of what it does
3. Complexity level (Simple/Medium/Complex)

Code:
\`\`\`${language || ''}
${code}
\`\`\`

Respond in this format:
CONCEPTS: concept1, concept2, concept3
EXPLANATION: Brief explanation
COMPLEXITY: Simple|Medium|Complex`;

    try {
      const response = await this.generateText(prompt, codeModel.name);
      
      const concepts = this.extractFromResponse(response, 'CONCEPTS:')
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);
      
      const explanation = this.extractFromResponse(response, 'EXPLANATION:');
      const complexity = this.extractFromResponse(response, 'COMPLEXITY:');

      return { concepts, explanation, complexity };
    } catch (error) {
      this.logger.error('Code analysis failed:', error);
      return {
        concepts: ['programming', 'code'],
        explanation: 'Code analysis failed',
        complexity: 'Unknown'
      };
    }
  }

  async analyzeImage(imageBase64: string, query?: string): Promise<MultimodalAnalysis> {
    const multimodalModel = this.availableModels.find(m => m.type === 'multimodal' && m.available);
    
    if (!multimodalModel) {
      return {
        textContent: 'Image analysis requires multimodal model',
        concepts: ['image', 'visual', 'multimodal'],
        reasoning: 'No multimodal model available'
      };
    }

    const prompt = query || `Analyze this image and extract:
1. All text content visible
2. Key concepts, objects, or ideas shown
3. Any code snippets or technical diagrams
4. Overall meaning or purpose

Respond in this format:
TEXT: Any text visible in the image
CONCEPTS: concept1, concept2, concept3
CODE: Any code snippets found
DIAGRAMS: Description of any diagrams/charts
REASONING: What this image is about`;

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: multimodalModel.name,
          prompt,
          images: [imageBase64.replace(/^data:image\/[^;]+;base64,/, '')],
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const responseText = data.response || 'No analysis available';

      return {
        textContent: this.extractFromResponse(responseText, 'TEXT:'),
        concepts: this.extractFromResponse(responseText, 'CONCEPTS:')
          .split(',')
          .map(c => c.trim())
          .filter(c => c.length > 0),
        codeSnippets: [this.extractFromResponse(responseText, 'CODE:')].filter(c => c.length > 0),
        diagrams: [this.extractFromResponse(responseText, 'DIAGRAMS:')].filter(d => d.length > 0),
        reasoning: this.extractFromResponse(responseText, 'REASONING:')
      };
    } catch (error) {
      this.logger.error('Image analysis failed:', error);
      return {
        textContent: 'Image analysis failed',
        concepts: ['image', 'visual'],
        reasoning: 'Analysis failed: ' + error.message
      };
    }
  }

  async generateConceptSuggestions(existingConcepts: string[], domain?: string): Promise<string[]> {
    const model = this.getPreferredTextModel();
    
    const prompt = `Given these existing concepts: ${existingConcepts.join(', ')}
${domain ? `In the domain of: ${domain}` : ''}

Suggest 5-10 related concepts that would expand this knowledge network.
Focus on concepts that bridge different areas or reveal deeper connections.

Respond with only the concept names, one per line.`;

    try {
      const response = await this.generateText(prompt, model);
      return response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.includes(':'))
        .slice(0, 10);
    } catch (error) {
      this.logger.error('Concept suggestion failed:', error);
      return [];
    }
  }

  async generateKnowledgeInsights(concepts: string[], relationships: any[]): Promise<string[]> {
    const model = this.getPreferredTextModel();
    
    const prompt = `Analyze this knowledge network:
Concepts: ${concepts.join(', ')}
Relationships: ${relationships.length} connections

Provide insights about:
1. Knowledge gaps or missing connections
2. Central themes or patterns
3. Areas for deeper exploration
4. Cross-domain opportunities

Respond with bullet points.`;

    try {
      const response = await this.generateText(prompt, model);
      return response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 8);
    } catch (error) {
      this.logger.error('Knowledge insights failed:', error);
      return ['Knowledge analysis requires AI model connection'];
    }
  }

  private getPreferredTextModel(): string {
    const codeModel = this.availableModels.find(m => m.type === 'code' && m.available);
    return codeModel ? codeModel.name : 'codellama:7b';
  }

  private extractFromResponse(response: string, prefix: string): string {
    const lines = response.split('\n');
    const targetLine = lines.find(line => line.toLowerCase().includes(prefix.toLowerCase()));
    return targetLine ? targetLine.replace(new RegExp(prefix, 'i'), '').trim() : '';
  }

  private getFallbackResponse(prompt: string): string {
    if (prompt.toLowerCase().includes('concept')) {
      return 'concept analysis, knowledge extraction, semantic understanding';
    }
    return 'AI analysis requires Ollama connection';
  }
}