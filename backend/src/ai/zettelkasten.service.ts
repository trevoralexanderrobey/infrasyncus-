import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OllamaService } from './ollama.service';
import { NetworkNode, NetworkEdge, GraphMetrics, TextNetworkAnalysis } from './types';

// Re-export for backward compatibility
export { NetworkNode, NetworkEdge, GraphMetrics, TextNetworkAnalysis } from './types';

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

  async suggestRelatedNotes(noteId: string): Promise<string[]> {
    const note = await this.prisma.note.findUnique({ 
      where: { id: noteId } 
    });
    
    if (!note) return [];
    
    const prompt = `Analyze this note and suggest 3-5 related concepts or topics that would make good connections in a knowledge graph:\n\n${note.content}`;
    
    try {
      const response = await this.ollamaService.generateText(prompt);
      return response.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return ['Related concept 1', 'Related concept 2', 'Related concept 3'];
    }
  }

  async analyzeTextNetwork(text: string): Promise<TextNetworkAnalysis> {
    // Advanced text processing inspired by InfraNodus methodology
    const processedText = this.preprocessText(text);
    const words = this.extractWords(processedText);
    const nGrams = this.generateNGrams(words, 4); // 4-gram sliding window like InfraNodus
    
    const { nodes, edges } = this.buildNetwork(words, nGrams);
    const communities = this.detectCommunities(nodes, edges);
    const topicClusters = this.extractTopics(nodes, communities);
    const contentGaps = this.identifyContentGaps(nodes, edges, communities);
    const keyTerms = this.extractKeyTerms(nodes);
    const diversity = this.calculateDiversity(communities);
    
    // Add default metrics and structural gaps for compatibility
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

  async importFromFile(content: string, fileName: string): Promise<any[]> {
    const importedNotes: any[] = [];
    
    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      // Split content into paragraphs and create notes
      const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
      
      for (const paragraph of paragraphs) {
        if (paragraph.trim().length > 10) { // Only create notes for substantial content
          const note = await this.createAtomicNote(paragraph.trim(), [`imported:${fileName}`]);
          importedNotes.push(note);
        }
      }
    } else if (fileName.endsWith('.csv')) {
      // Basic CSV parsing - assumes first column is content
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

  private preprocessText(text: string): string {
    // Remove punctuation, normalize whitespace, convert to lowercase
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractWords(text: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me',
      'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
    ]);

    return text
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .map(word => this.lemmatize(word)); // Basic lemmatization
  }

  private lemmatize(word: string): string {
    // Basic lemmatization - remove common suffixes
    if (word.endsWith('ing')) return word.slice(0, -3);
    if (word.endsWith('ed')) return word.slice(0, -2);
    if (word.endsWith('s') && word.length > 3) return word.slice(0, -1);
    return word;
  }

  private generateNGrams(words: string[], n: number): string[][] {
    const ngrams: string[][] = [];
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.push(words.slice(i, i + n));
    }
    return ngrams;
  }

  private buildNetwork(words: string[], nGrams: string[][]): { nodes: NetworkNode[], edges: NetworkEdge[] } {
    const wordFreq = new Map<string, number>();
    const coOccurrence = new Map<string, Map<string, number>>();

    // Count word frequencies
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    // Build co-occurrence matrix from n-grams
    nGrams.forEach(ngram => {
      for (let i = 0; i < ngram.length; i++) {
        for (let j = i + 1; j < ngram.length; j++) {
          const word1 = ngram[i];
          const word2 = ngram[j];
          const distance = j - i;
          const weight = Math.max(0, 4 - distance); // Weight decreases with distance
          
          if (!coOccurrence.has(word1)) {
            coOccurrence.set(word1, new Map());
          }
          const word1Connections = coOccurrence.get(word1)!;
          word1Connections.set(word2, (word1Connections.get(word2) || 0) + weight);
        }
      }
    });

    // Create nodes
    const nodes: NetworkNode[] = Array.from(wordFreq.entries())
      .map(([word, freq]) => ({
        id: word,
        label: word,
        size: Math.min(freq * 3, 20), // Scale size based on frequency
        color: this.getRandomColor(),
        betweenness: 0,
        community: 0
      }));

    // Create edges
    const edges: NetworkEdge[] = [];
    coOccurrence.forEach((connections, source) => {
      connections.forEach((weight, target) => {
        if (weight > 1) { // Only include edges with meaningful weight
          edges.push({
            source,
            target,
            weight,
            label: `${weight}`
          });
        }
      });
    });

    return { nodes, edges };
  }

  private detectCommunities(nodes: NetworkNode[], edges: NetworkEdge[]): Map<string, number> {
    // Simplified community detection using modularity
    const communities = new Map<string, number>();
    let communityId = 0;

    // Group nodes by their connections (simplified Louvain-like approach)
    const nodeConnections = new Map<string, Set<string>>();
    
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

    // Assign communities
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
    
    const connections = nodeConnections.get(nodeId);
    if (connections) {
      connections.forEach(connectedNodeId => {
        if (!visited.has(connectedNodeId)) {
          this.assignCommunity(connectedNodeId, communityId, communities, nodeConnections, visited);
        }
      });
    }
  }

  private extractTopics(nodes: NetworkNode[], communities: Map<string, number>): string[][] {
    const topicMap = new Map<number, string[]>();
    
    communities.forEach((communityId, nodeId) => {
      if (!topicMap.has(communityId)) {
        topicMap.set(communityId, []);
      }
      topicMap.get(communityId)!.push(nodeId);
    });

    return Array.from(topicMap.values())
      .filter(topic => topic.length > 1) // Only return topics with multiple terms
      .sort((a, b) => b.length - a.length); // Sort by topic size
  }

  private identifyContentGaps(nodes: NetworkNode[], edges: NetworkEdge[], communities: Map<string, number>): string[] {
    // Identify structural gaps between communities (simplified)
    const communityConnections = new Map<number, Set<number>>();
    
    edges.forEach(edge => {
      const sourceCommunity = communities.get(edge.source);
      const targetCommunity = communities.get(edge.target);
      
      if (sourceCommunity !== undefined && targetCommunity !== undefined && sourceCommunity !== targetCommunity) {
        if (!communityConnections.has(sourceCommunity)) {
          communityConnections.set(sourceCommunity, new Set());
        }
        communityConnections.get(sourceCommunity)!.add(targetCommunity);
      }
    });

    const gaps: string[] = [];
    const allCommunities = new Set(communities.values());
    
    allCommunities.forEach(comm1 => {
      allCommunities.forEach(comm2 => {
        if (comm1 !== comm2) {
          const hasConnection = communityConnections.get(comm1)?.has(comm2) || 
                               communityConnections.get(comm2)?.has(comm1);
          if (!hasConnection) {
            gaps.push(`Gap between topic ${comm1} and topic ${comm2}`);
          }
        }
      });
    });

    return gaps.slice(0, 5); // Return top 5 gaps
  }

  private extractKeyTerms(nodes: NetworkNode[]): string[] {
    return nodes
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .map(node => node.label);
  }

  private calculateDiversity(communities: Map<string, number>): number {
    const communityCounts = new Map<number, number>();
    communities.forEach(communityId => {
      communityCounts.set(communityId, (communityCounts.get(communityId) || 0) + 1);
    });

    const totalNodes = communities.size;
    if (totalNodes === 0) return 0;
    
    let diversity = 0;
    
    communityCounts.forEach(count => {
      const proportion = count / totalNodes;
      diversity -= proportion * Math.log2(proportion);
    });

    return diversity;
  }

  private async generateInsights(topics: string[][], contentGaps: string[]): Promise<string[]> {
    const insights: string[] = [];
    
    if (topics.length > 0) {
      insights.push(`Identified ${topics.length} main topics in the text`);
      insights.push(`Largest topic contains: ${topics[0].join(', ')}`);
    }
    
    if (contentGaps.length > 0) {
      insights.push('Potential areas for development:');
      insights.push(...contentGaps.slice(0, 3));
    }
    
    return insights;
  }

  private getRandomColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}