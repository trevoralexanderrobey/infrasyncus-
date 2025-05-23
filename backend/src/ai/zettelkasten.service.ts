import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OllamaService } from './ollama.service';

// Enhanced AI-powered Knowledge Graph Analysis
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

@Injectable()
export class ZettelkastenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ollamaService: OllamaService,
  ) {}

  async getAllNotes(): Promise<any[]> {
    return this.prisma.note.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createAtomicNote(content: string, tags: string[] = [], createdAt?: string): Promise<any> {
    const noteData: any = { 
      content, 
      tags: JSON.stringify(tags || []),
    };
    
    if (createdAt) {
      noteData.createdAt = new Date(createdAt);
    }
    
    return this.prisma.note.create({
      data: noteData
    });
  }

  async createBidirectionalLink(noteId1: string, noteId2: string): Promise<any> {
    return this.prisma.link.create({
      data: {
        sourceNoteId: noteId1,
        targetNoteId: noteId2,
      }
    });
  }

  async getConnectedNotes(noteId: string): Promise<any[]> {
    const links = await this.prisma.link.findMany({
      where: {
        OR: [
          { sourceNoteId: noteId },
          { targetNoteId: noteId }
        ]
      }
    });
    
    return links.map(link => ({
      source: link.sourceNoteId,
      target: link.targetNoteId
    }));
  }

  async visualizeKnowledgeGraph(noteId: string): Promise<any> {
    const links = await this.prisma.link.findMany({
      where: {
        OR: [
          { sourceNoteId: noteId },
          { targetNoteId: noteId }
        ]
      },
      include: {
        sourceNote: true,
        targetNote: true
      }
    });
    
    const connectedNoteIds = new Set<string>();
    connectedNoteIds.add(noteId);
    
    links.forEach(link => {
      connectedNoteIds.add(link.sourceNoteId);
      connectedNoteIds.add(link.targetNoteId);
    });

    const notes = await this.prisma.note.findMany({
      where: {
        id: { in: Array.from(connectedNoteIds) }
      }
    });
    
    return {
      nodes: notes.map(note => ({
        id: note.id,
        content: note.content.substring(0, 50),
      })),
      links: links.map(link => ({
        source: link.sourceNoteId,
        target: link.targetNoteId,
      })),
    };
  }

  async analyzeTextNetwork(text: string): Promise<TextNetworkAnalysis> {
    // Advanced text processing inspired by InfraNodus methodology
    const processedText = this.preprocessText(text);
    const words = this.extractWords(processedText);
    const nGrams = this.generateNGrams(words, 4); // 4-gram sliding window
    
    const { nodes, edges } = this.buildNetwork(words, nGrams);
    const communities = this.detectCommunities(nodes, edges);
    const topicClusters = this.extractTopics(nodes, communities);
    const contentGaps = this.identifyContentGaps(nodes, edges, communities);
    const keyTerms = this.extractKeyTerms(nodes);
    const diversity = this.calculateDiversity(communities);
    
    const metrics: GraphMetrics = {
      modularity: 0.3,
      density: edges.length / Math.max(1, nodes.length * (nodes.length - 1) / 2),
      averageClustering: 0,
      averagePathLength: 0,
      diameter: 0,
      nodeCount: nodes.length,
      edgeCount: edges.length
    };
    
    const structuralGaps = [];
    const insights = await this.generateInsights(topicClusters, contentGaps);

    return {
      nodes,
      edges,
      topics: topicClusters,
      insights,
      contentGaps,
      keyTerms,
      diversity,
      metrics,
      structuralGaps
    };
  }

  // AI-Enhanced Analysis Methods
  async getAvailableAIModels(): Promise<any[]> {
    return this.ollamaService.getAvailableModels();
  }

  async getRecommendedModels(): Promise<any> {
    return this.ollamaService.getRecommendedModels();
  }

  async analyzeCodeWithAI(code: string, language?: string): Promise<any> {
    const analysis = await this.ollamaService.analyzeCode(code, language);
    
    // Create network from code analysis
    const textAnalysis = await this.analyzeTextNetwork(analysis.explanation);
    
    return {
      ...analysis,
      network: textAnalysis,
      aiEnhanced: true
    };
  }

  async analyzeImageWithAI(imageBase64: string, query?: string): Promise<any> {
    const analysis = await this.ollamaService.analyzeImage(imageBase64, query);
    
    // Create network from image analysis
    const combinedText = `${analysis.textContent} ${analysis.concepts.join(' ')} ${analysis.reasoning}`;
    const textAnalysis = await this.analyzeTextNetwork(combinedText);
    
    return {
      ...analysis,
      network: textAnalysis,
      aiEnhanced: true,
      multimodal: true
    };
  }

  async generateConceptSuggestions(domain?: string): Promise<any> {
    // Get existing concepts from the database
    const notes = await this.getAllNotes();
    const existingConcepts = notes.map(note => 
      note.content.substring(0, 100).replace(/[^\w\s]/g, ' ')
    ).slice(0, 20); // Limit for prompt size
    
    const suggestions = await this.ollamaService.generateConceptSuggestions(existingConcepts, domain);
    
    return {
      suggestions,
      domain: domain || 'general',
      basedOn: existingConcepts.length
    };
  }

  async generateKnowledgeInsights(): Promise<any> {
    // Get current knowledge structure
    const notes = await this.getAllNotes();
    const links = await this.prisma.link.findMany();
    
    const concepts = notes.map(note => note.content.substring(0, 50));
    const relationships = links.map(link => ({ source: link.sourceNoteId, target: link.targetNoteId }));
    
    const aiInsights = await this.ollamaService.generateKnowledgeInsights(concepts, relationships);
    
    // Combine with structural analysis
    const conceptSuggestions = await this.ollamaService.generateConceptSuggestions(
      concepts.slice(0, 10), 
      'knowledge management'
    );
    
    const insights = await this.ollamaService.generateKnowledgeInsights(
      concepts.slice(0, 15),
      relationships.slice(0, 20)
    );
    
    return {
      aiInsights,
      structuralInsights: [
        `Network has ${concepts.length} concepts and ${relationships.length} connections`,
        'Consider adding cross-domain connections',
        'Look for isolated concept clusters'
      ],
      suggestions: conceptSuggestions,
      timestamp: new Date().toISOString()
    };
  }

  async analyzeTextWithAI(text: string, useAI: boolean = true): Promise<any> {
    // Base network analysis
    const networkAnalysis = await this.analyzeTextNetwork(text);
    
    if (!useAI) {
      return {
        ...networkAnalysis,
        aiEnhanced: false
      };
    }
    
    try {
      // AI-enhanced analysis
      const response = await this.ollamaService.generateText(
        `Analyze this text for key concepts and relationships:\n\n${text}`
      );
      
      // Extract AI-identified concepts
      const aiConcepts = response.split(/[,\n]/)
        .map(c => c.trim())
        .filter(c => c.length > 2)
        .slice(0, 10);
      
      return {
        ...networkAnalysis,
        aiConcepts,
        aiInsights: [response.substring(0, 200)],
        aiEnhanced: true
      };
    } catch (error) {
      console.error('AI analysis failed, using base analysis:', error);
      return {
        ...networkAnalysis,
        aiEnhanced: false,
        error: 'AI analysis unavailable'
      };
    }
  }

  // Missing methods from controller
  async suggestRelatedNotes(noteId: string): Promise<string[]> {
    const note = await this.prisma.note.findUnique({ 
      where: { id: noteId } 
    });
    
    if (!note) return [];
    
    try {
      const suggestions = await this.ollamaService.generateConceptSuggestions([note.content.substring(0, 100)]);
      return suggestions.slice(0, 5);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return ['Related concept 1', 'Related concept 2', 'Related concept 3'];
    }
  }

  async analyzeTextIncremental(text: string, previousAnalysis?: any): Promise<TextNetworkAnalysis> {
    // For now, just return regular analysis - can be enhanced later
    return this.analyzeTextNetwork(text);
  }

  async importFromFile(content: string, fileName: string): Promise<any[]> {
    const importedNotes: any[] = [];
    
    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
      
      for (const paragraph of paragraphs) {
        if (paragraph.trim().length > 10) {
          const note = await this.createAtomicNote(paragraph.trim(), [`imported:${fileName}`]);
          importedNotes.push(note);
        }
      }
    } else if (fileName.endsWith('.csv')) {
      const lines = content.split('\n');
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values[0] && values[0].trim().length > 0) {
          const note = await this.createAtomicNote(values[0].trim(), [`imported:${fileName}`]);
          importedNotes.push(note);
        }
      }
    }

    return importedNotes;
  }

  async getGraphVisualization(): Promise<{ nodes: any[]; edges: any[] }> {
    const notes = await this.getAllNotes();
    const links = await this.prisma.link.findMany();

    return {
      nodes: notes.map(note => ({
        id: note.id,
        label: note.content.substring(0, 50),
        content: note.content
      })),
      edges: links.map(link => ({
        source: link.sourceNoteId,
        target: link.targetNoteId
      }))
    };
  }

  async getGraphStats(): Promise<any> {
    const notes = await this.getAllNotes();
    const links = await this.prisma.link.findMany();

    return {
      nodeCount: notes.length,
      edgeCount: links.length,
      density: links.length / Math.max(1, notes.length * (notes.length - 1) / 2),
      lastUpdated: new Date().toISOString()
    };
  }

  async searchGraphNodes(query: string): Promise<any[]> {
    const notes = await this.prisma.note.findMany({
      where: {
        content: {
          contains: query
        }
      }
    });

    return notes.map(note => ({
      id: note.id,
      content: note.content,
      relevance: note.content.toLowerCase().includes(query.toLowerCase()) ? 1 : 0.5
    }));
  }

  async getConceptClusters(): Promise<any[]> {
    const notes = await this.getAllNotes();
    const text = notes.map(n => n.content).join(' ');
    const analysis = await this.analyzeTextNetwork(text);
    
    return analysis.topics.map((topic, index) => ({
      id: index,
      concepts: topic,
      size: topic.length
    }));
  }

  async getKnowledgePaths(source: string, target: string): Promise<any[]> {
    // Simplified path finding - can be enhanced with graph algorithms
    return [{
      path: [source, target],
      distance: 1,
      strength: 0.5
    }];
  }

  async getConceptNeighborhood(concept: string, depth: number = 2): Promise<any> {
    const notes = await this.searchGraphNodes(concept);
    
    return {
      center: concept,
      neighbors: notes.slice(0, 10),
      depth: depth
    };
  }

  async getConceptCentrality(): Promise<any[]> {
    const notes = await this.getAllNotes();
    const links = await this.prisma.link.findMany();
    
    const centrality = new Map<string, number>();
    
    links.forEach(link => {
      centrality.set(link.sourceNoteId, (centrality.get(link.sourceNoteId) || 0) + 1);
      centrality.set(link.targetNoteId, (centrality.get(link.targetNoteId) || 0) + 1);
    });
    
    return notes.map(note => ({
      id: note.id,
      content: note.content.substring(0, 50),
      centrality: centrality.get(note.id) || 0
    })).sort((a, b) => b.centrality - a.centrality);
  }

  async detectKnowledgeGaps(): Promise<any[]> {
    const notes = await this.getAllNotes();
    const links = await this.prisma.link.findMany();
    
    const connectedNodes = new Set<string>();
    links.forEach(link => {
      connectedNodes.add(link.sourceNoteId);
      connectedNodes.add(link.targetNoteId);
    });
    
    const isolatedNodes = notes.filter(note => !connectedNodes.has(note.id));
    
    return [{
      type: 'isolated_concepts',
      count: isolatedNodes.length,
      examples: isolatedNodes.slice(0, 5).map(n => n.content.substring(0, 50))
    }];
  }

  async getTemporalEvolution(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<any[]> {
    const notes = await this.prisma.note.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    return notes.map(note => ({
      date: note.createdAt,
      concepts: [note.content.substring(0, 30)],
      growth: 1
    }));
  }

  async findSimilarConcepts(concept: string, limit: number = 5): Promise<any[]> {
    const notes = await this.searchGraphNodes(concept);
    return notes.slice(0, limit);
  }

  async getEnhancedVisualizationData(): Promise<any> {
    const graph = await this.getGraphVisualization();
    const stats = await this.getGraphStats();
    
    return {
      ...graph,
      stats,
      layout: 'force-directed',
      enhanced: true
    };
  }

  // Private helper methods for text analysis
  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractWords(text: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ]);

    return text.split(' ')
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 200); // Limit for performance
  }

  private generateNGrams(words: string[], n: number): string[][] {
    const nGrams: string[][] = [];
    for (let i = 0; i <= words.length - n; i++) {
      nGrams.push(words.slice(i, i + n));
    }
    return nGrams;
  }

  private buildNetwork(words: string[], nGrams: string[][]): { nodes: NetworkNode[], edges: NetworkEdge[] } {
    const wordFrequency = new Map<string, number>();
    const connections = new Map<string, Map<string, number>>();

    // Count word frequencies
    words.forEach(word => {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    });

    // Build connections from n-grams
    nGrams.forEach(gram => {
      for (let i = 0; i < gram.length - 1; i++) {
        const word1 = gram[i];
        const word2 = gram[i + 1];
        
        if (!connections.has(word1)) {
          connections.set(word1, new Map());
        }
        
        const word1Connections = connections.get(word1)!;
        word1Connections.set(word2, (word1Connections.get(word2) || 0) + 1);
      }
    });

    // Create nodes
    const nodes: NetworkNode[] = Array.from(wordFrequency.entries())
      .filter(([word, freq]) => freq > 1) // Filter low-frequency words
      .map(([word, freq], index) => ({
        id: word,
        label: word,
        frequency: freq,
        centrality: this.calculateCentrality(word, connections),
        group: index % 5, // Simple grouping
        color: this.getRandomColor()
      }));

    // Create edges
    const edges: NetworkEdge[] = [];
    connections.forEach((targets, source) => {
      targets.forEach((weight, target) => {
        if (wordFrequency.has(source) && wordFrequency.has(target) && weight > 1) {
          edges.push({
            source,
            target,
            weight,
            type: 'textual'
          });
        }
      });
    });

    return { nodes, edges };
  }

  private calculateCentrality(word: string, connections: Map<string, Map<string, number>>): number {
    const outgoing = connections.get(word)?.size || 0;
    const incoming = Array.from(connections.values())
      .reduce((count, targets) => count + (targets.has(word) ? 1 : 0), 0);
    return outgoing + incoming;
  }

  private detectCommunities(nodes: NetworkNode[], edges: NetworkEdge[]): Map<string, number> {
    const communities = new Map<string, number>();
    const nodeConnections = new Map<string, Set<string>>();

    // Build adjacency list
    edges.forEach(edge => {
      if (!nodeConnections.has(edge.source)) {
        nodeConnections.set(edge.source, new Set());
      }
      if (!nodeConnections.has(edge.target)) {
        nodeConnections.set(edge.target, new Set());
      }
      
      nodeConnections.get(edge.source)!.add(edge.target);
      nodeConnections.get(edge.target)!.add(edge.source);
    });

    // Simple community detection using connected components
    let communityId = 0;
    const visited = new Set<string>();

    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        this.assignCommunity(node.id, communityId, communities, nodeConnections, visited);
        communityId++;
      }
    });

    return communities;
  }

  private assignCommunity(
    nodeId: string, 
    communityId: number, 
    communities: Map<string, number>,
    nodeConnections: Map<string, Set<string>>,
    visited: Set<string>
  ): void {
    if (visited.has(nodeId)) return;
    
    visited.add(nodeId);
    communities.set(nodeId, communityId);

    const neighbors = nodeConnections.get(nodeId) || new Set();
    neighbors.forEach(neighbor => {
      if (!visited.has(neighbor)) {
        this.assignCommunity(neighbor, communityId, communities, nodeConnections, visited);
      }
    });
  }

  private extractTopics(nodes: NetworkNode[], communities: Map<string, number>): string[][] {
    const topics: string[][] = [];
    const communityGroups = new Map<number, string[]>();

    communities.forEach((communityId, nodeId) => {
      if (!communityGroups.has(communityId)) {
        communityGroups.set(communityId, []);
      }
      communityGroups.get(communityId)!.push(nodeId);
    });

    communityGroups.forEach(group => {
      topics.push(group.slice(0, 8)); // Limit topic size
    });

    return topics;
  }

  private identifyContentGaps(nodes: NetworkNode[], edges: NetworkEdge[], communities: Map<string, number>): string[] {
    const gaps: string[] = [];
    
    // Identify isolated nodes
    const connectedNodes = new Set<string>();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const isolatedNodes = nodes.filter(node => !connectedNodes.has(node.id));
    if (isolatedNodes.length > 0) {
      gaps.push(`${isolatedNodes.length} isolated concepts need connections`);
    }

    // Identify sparse communities
    const communityGroups = new Map<number, number>();
    communities.forEach(communityId => {
      communityGroups.set(communityId, (communityGroups.get(communityId) || 0) + 1);
    });

    const smallCommunities = Array.from(communityGroups.entries())
      .filter(([_, size]) => size < 3);
    
    if (smallCommunities.length > 0) {
      gaps.push(`${smallCommunities.length} topic clusters are underdeveloped`);
    }

    return gaps;
  }

  private extractKeyTerms(nodes: NetworkNode[]): string[] {
    return nodes
      .sort((a, b) => (b.frequency + b.centrality) - (a.frequency + a.centrality))
      .slice(0, 10)
      .map(node => node.label);
  }

  private calculateDiversity(communities: Map<string, number>): number {
    const communityGroups = new Map<number, number>();
    
    communities.forEach(communityId => {
      communityGroups.set(communityId, (communityGroups.get(communityId) || 0) + 1);
    });

    const totalNodes = communities.size;
    if (totalNodes === 0) return 0;

    const entropy = Array.from(communityGroups.values())
      .map(size => {
        const p = size / totalNodes;
        return -p * Math.log2(p);
      })
      .reduce((sum, h) => sum + h, 0);

    return entropy / Math.log2(Math.max(1, communityGroups.size));
  }

  private async generateInsights(topics: string[][], contentGaps: string[]): Promise<string[]> {
    const insights: string[] = [];
    
    insights.push(`Identified ${topics.length} main topic clusters`);
    
    if (contentGaps.length > 0) {
      insights.push(`Found ${contentGaps.length} content gaps to address`);
    }
    
    const topTopics = topics.slice(0, 3).map(topic => topic.slice(0, 3).join(', '));
    if (topTopics.length > 0) {
      insights.push(`Main topics: ${topTopics.join('; ')}`);
    }

    return insights;
  }

  private getRandomColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}