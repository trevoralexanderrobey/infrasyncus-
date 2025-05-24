import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface GraphNode {
  id: string;
  label: string;
  type: 'concept' | 'note' | 'text';
  properties: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'related' | 'contains' | 'follows' | 'co_occurs';
  weight: number;
  properties: Record<string, any>;
  createdAt: Date;
}

export interface GraphData {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  nodesByType: Map<string, Set<string>>;
  edgesBySource: Map<string, Set<string>>;
  edgesByTarget: Map<string, Set<string>>;
}

@Injectable()
export class EmbeddedGraphService {
  private readonly logger = new Logger(EmbeddedGraphService.name);
  private graph: GraphData;
  private dataPath: string;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.dataPath = path.join(process.cwd(), 'data', 'graph.json');
    this.initializeGraph();
    this.loadGraphData();
  }

  private initializeGraph(): void {
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      nodesByType: new Map(),
      edgesBySource: new Map(),
      edgesByTarget: new Map(),
    };
  }

  private async loadGraphData(): Promise<void> {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dataPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.dataPath)) {
        const data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
        
        // Restore nodes
        if (data.nodes) {
          for (const [id, node] of Object.entries(data.nodes as Record<string, any>)) {
            this.graph.nodes.set(id, {
              ...node,
              createdAt: new Date(node.createdAt),
              updatedAt: new Date(node.updatedAt),
            });
            
            // Update indexes
            if (!this.graph.nodesByType.has(node.type)) {
              this.graph.nodesByType.set(node.type, new Set());
            }
            this.graph.nodesByType.get(node.type)!.add(id);
          }
        }

        // Restore edges
        if (data.edges) {
          for (const [id, edge] of Object.entries(data.edges as Record<string, any>)) {
            this.graph.edges.set(id, {
              ...edge,
              createdAt: new Date(edge.createdAt),
            });
            
            // Update indexes
            if (!this.graph.edgesBySource.has(edge.source)) {
              this.graph.edgesBySource.set(edge.source, new Set());
            }
            if (!this.graph.edgesByTarget.has(edge.target)) {
              this.graph.edgesByTarget.set(edge.target, new Set());
            }
            this.graph.edgesBySource.get(edge.source)!.add(id);
            this.graph.edgesByTarget.get(edge.target)!.add(id);
          }
        }

        this.logger.log(`Loaded graph with ${this.graph.nodes.size} nodes and ${this.graph.edges.size} edges`);
      } else {
        this.logger.log('No existing graph data found, starting with empty graph');
      }
    } catch (error) {
      this.logger.error('Failed to load graph data:', error);
      this.initializeGraph();
    }
  }

  private scheduleSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(() => {
      this.saveGraphData();
    }, 1000); // Debounce saves by 1 second
  }

  private async saveGraphData(): Promise<void> {
    try {
      const data = {
        nodes: Object.fromEntries(this.graph.nodes),
        edges: Object.fromEntries(this.graph.edges),
        metadata: {
          savedAt: new Date().toISOString(),
          nodeCount: this.graph.nodes.size,
          edgeCount: this.graph.edges.size,
        },
      };

      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
      this.logger.debug(`Graph data saved to ${this.dataPath}`);
    } catch (error) {
      this.logger.error('Failed to save graph data:', error);
    }
  }

  // Node operations
  async createNode(label: string, type: string, properties: Record<string, any> = {}): Promise<GraphNode> {
    const id = this.generateId();
    const node: GraphNode = {
      id,
      label,
      type: type as any,
      properties,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.graph.nodes.set(id, node);
    
    // Update indexes
    if (!this.graph.nodesByType.has(type)) {
      this.graph.nodesByType.set(type, new Set());
    }
    this.graph.nodesByType.get(type)!.add(id);

    this.scheduleSave();
    return node;
  }

  async getNode(id: string): Promise<GraphNode | null> {
    return this.graph.nodes.get(id) || null;
  }

  async updateNode(id: string, updates: Partial<GraphNode>): Promise<GraphNode | null> {
    const node = this.graph.nodes.get(id);
    if (!node) return null;

    const updatedNode = {
      ...node,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };

    this.graph.nodes.set(id, updatedNode);
    this.scheduleSave();
    return updatedNode;
  }

  async deleteNode(id: string): Promise<boolean> {
    const node = this.graph.nodes.get(id);
    if (!node) return false;

    // Remove from indexes
    this.graph.nodesByType.get(node.type)?.delete(id);
    
    // Remove all connected edges
    const connectedEdges = [
      ...(this.graph.edgesBySource.get(id) || []),
      ...(this.graph.edgesByTarget.get(id) || []),
    ];
    
    for (const edgeId of connectedEdges) {
      await this.deleteEdge(edgeId);
    }

    this.graph.nodes.delete(id);
    this.scheduleSave();
    return true;
  }

  // Edge operations
  async createEdge(source: string, target: string, type: string, weight: number = 1, properties: Record<string, any> = {}): Promise<GraphEdge> {
    const id = this.generateId();
    const edge: GraphEdge = {
      id,
      source,
      target,
      type: type as any,
      weight,
      properties,
      createdAt: new Date(),
    };

    this.graph.edges.set(id, edge);
    
    // Update indexes
    if (!this.graph.edgesBySource.has(source)) {
      this.graph.edgesBySource.set(source, new Set());
    }
    if (!this.graph.edgesByTarget.has(target)) {
      this.graph.edgesByTarget.set(target, new Set());
    }
    
    this.graph.edgesBySource.get(source)!.add(id);
    this.graph.edgesByTarget.get(target)!.add(id);

    this.scheduleSave();
    return edge;
  }

  async getEdge(id: string): Promise<GraphEdge | null> {
    return this.graph.edges.get(id) || null;
  }

  async deleteEdge(id: string): Promise<boolean> {
    const edge = this.graph.edges.get(id);
    if (!edge) return false;

    // Remove from indexes
    this.graph.edgesBySource.get(edge.source)?.delete(id);
    this.graph.edgesByTarget.get(edge.target)?.delete(id);

    this.graph.edges.delete(id);
    this.scheduleSave();
    return true;
  }

  // Query operations
  async getNodesByType(type: string): Promise<GraphNode[]> {
    const nodeIds = this.graph.nodesByType.get(type) || new Set();
    return Array.from(nodeIds).map(id => this.graph.nodes.get(id)!).filter(Boolean);
  }

  async getConnectedNodes(nodeId: string, direction: 'in' | 'out' | 'both' = 'both'): Promise<GraphNode[]> {
    const connectedNodeIds = new Set<string>();

    if (direction === 'out' || direction === 'both') {
      const outgoingEdges = this.graph.edgesBySource.get(nodeId) || new Set();
      for (const edgeId of outgoingEdges) {
        const edge = this.graph.edges.get(edgeId);
        if (edge) {
          connectedNodeIds.add(edge.target);
        }
      }
    }

    if (direction === 'in' || direction === 'both') {
      const incomingEdges = this.graph.edgesByTarget.get(nodeId) || new Set();
      for (const edgeId of incomingEdges) {
        const edge = this.graph.edges.get(edgeId);
        if (edge) {
          connectedNodeIds.add(edge.source);
        }
      }
    }

    return Array.from(connectedNodeIds).map(id => this.graph.nodes.get(id)!).filter(Boolean);
  }

  async findNodesByLabel(labelPattern: string): Promise<GraphNode[]> {
    const pattern = new RegExp(labelPattern, 'i');
    return Array.from(this.graph.nodes.values()).filter(node => 
      pattern.test(node.label)
    );
  }

  async getShortestPath(sourceId: string, targetId: string): Promise<GraphNode[]> {
    // Simple BFS for shortest path
    const visited = new Set<string>();
    const queue: { nodeId: string; path: string[] }[] = [{ nodeId: sourceId, path: [sourceId] }];

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      
      if (nodeId === targetId) {
        return path.map(id => this.graph.nodes.get(id)!).filter(Boolean);
      }

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const connectedNodes = await this.getConnectedNodes(nodeId);
      for (const connectedNode of connectedNodes) {
        if (!visited.has(connectedNode.id)) {
          queue.push({
            nodeId: connectedNode.id,
            path: [...path, connectedNode.id],
          });
        }
      }
    }

    return []; // No path found
  }

  // Text analysis integration
  async storeTextAnalysis(text: string, concepts: string[]): Promise<{ textNode: GraphNode; conceptNodes: GraphNode[] }> {
    // Create text node
    const textNode = await this.createNode(
      text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      'text',
      { fullText: text, wordCount: text.split(' ').length }
    );

    const conceptNodes: GraphNode[] = [];

    // Create or find concept nodes
    for (const concept of concepts) {
      let conceptNode = (await this.findNodesByLabel(`^${concept}$`))[0];
      
      if (!conceptNode) {
        conceptNode = await this.createNode(concept, 'concept', { frequency: 1 });
      } else {
        // Increment frequency
        await this.updateNode(conceptNode.id, {
          properties: {
            ...conceptNode.properties,
            frequency: (conceptNode.properties.frequency || 0) + 1,
          },
        });
      }

      conceptNodes.push(conceptNode);
      
      // Create edge from text to concept
      await this.createEdge(textNode.id, conceptNode.id, 'contains', 1);
    }

    // Create co-occurrence edges between concepts
    for (let i = 0; i < conceptNodes.length; i++) {
      for (let j = i + 1; j < conceptNodes.length; j++) {
        const existingEdges = await this.getEdgesBetween(conceptNodes[i].id, conceptNodes[j].id);
        
        if (existingEdges.length > 0) {
          // Increment weight of existing edge
          const edge = existingEdges[0];
          await this.updateEdge(edge.id, { weight: edge.weight + 1 });
        } else {
          // Create new co-occurrence edge
          await this.createEdge(conceptNodes[i].id, conceptNodes[j].id, 'co_occurs', 1);
        }
      }
    }

    return { textNode, conceptNodes };
  }

  async getEdgesBetween(nodeId1: string, nodeId2: string): Promise<GraphEdge[]> {
    const outgoingEdges = this.graph.edgesBySource.get(nodeId1) || new Set();
    const result: GraphEdge[] = [];

    for (const edgeId of outgoingEdges) {
      const edge = this.graph.edges.get(edgeId);
      if (edge && edge.target === nodeId2) {
        result.push(edge);
      }
    }

    // Check reverse direction
    const incomingEdges = this.graph.edgesBySource.get(nodeId2) || new Set();
    for (const edgeId of incomingEdges) {
      const edge = this.graph.edges.get(edgeId);
      if (edge && edge.target === nodeId1) {
        result.push(edge);
      }
    }

    return result;
  }

  async updateEdge(id: string, updates: Partial<GraphEdge>): Promise<GraphEdge | null> {
    const edge = this.graph.edges.get(id);
    if (!edge) return null;

    const updatedEdge = { ...edge, ...updates, id }; // Ensure ID doesn't change
    this.graph.edges.set(id, updatedEdge);
    this.scheduleSave();
    return updatedEdge;
  }

  // Statistics and visualization
  async getGraphStats(): Promise<any> {
    const nodesByType = {};
    for (const [type, nodeIds] of this.graph.nodesByType) {
      nodesByType[type] = nodeIds.size;
    }

    return {
      totalNodes: this.graph.nodes.size,
      totalEdges: this.graph.edges.size,
      nodesByType,
      lastSaved: fs.existsSync(this.dataPath) ? fs.statSync(this.dataPath).mtime : null,
    };
  }

  async exportForVisualization(): Promise<{ nodes: any[]; edges: any[] }> {
    const nodes = Array.from(this.graph.nodes.values()).map(node => ({
      id: node.id,
      label: node.label,
      type: node.type,
      size: Math.min(Math.max((node.properties.frequency || 1) * 2, 5), 20),
      color: this.getNodeColor(node.type),
      ...node.properties,
    }));

    const edges = Array.from(this.graph.edges.values()).map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.type,
      weight: edge.weight,
      color: this.getEdgeColor(edge.type),
    }));

    return { nodes, edges };
  }

  private getNodeColor(type: string): string {
    const colors = {
      concept: '#3498db',
      text: '#2ecc71',
      note: '#e74c3c',
    };
    return colors[type] || '#95a5a6';
  }

  private getEdgeColor(type: string): string {
    const colors = {
      contains: '#34495e',
      co_occurs: '#9b59b6',
      related: '#f39c12',
      follows: '#1abc9c',
    };
    return colors[type] || '#bdc3c7';
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Cleanup
  async onModuleDestroy(): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      await this.saveGraphData();
    }
  }

  // ===== ENHANCED DIGITAL GARDEN FEATURES =====

  // Knowledge Discovery & Navigation
  async getConceptClusters(minClusterSize: number = 3): Promise<{ cluster: GraphNode[]; centroid: string; strength: number }[]> {
    const nodes = Array.from(this.graph.nodes.values());
    const clusters = new Map<number, GraphNode[]>();
    
    // Group nodes by community and calculate cluster strength
    nodes.forEach(node => {
      const community = node.properties.community || 0;
      if (!clusters.has(community)) {
        clusters.set(community, []);
      }
      clusters.get(community)!.push(node);
    });

    const result = [];
    for (const [communityId, clusterNodes] of clusters) {
      if (clusterNodes.length >= minClusterSize) {
        // Find centroid (most connected node in cluster)
        let maxConnections = 0;
        let centroid = clusterNodes[0];
        
        for (const node of clusterNodes) {
          const connections = await this.getConnectedNodes(node.id);
          if (connections.length > maxConnections) {
            maxConnections = connections.length;
            centroid = node;
          }
        }

        // Calculate cluster strength (average node frequency)
        const avgFrequency = clusterNodes.reduce((sum, node) => 
          sum + (node.properties.frequency || 1), 0) / clusterNodes.length;

        result.push({
          cluster: clusterNodes,
          centroid: centroid.label,
          strength: avgFrequency
        });
      }
    }

    return result.sort((a, b) => b.strength - a.strength);
  }

  async getKnowledgePaths(sourceLabel: string, targetLabel: string): Promise<{ path: GraphNode[]; strength: number }[]> {
    const sourceNodes = await this.findNodesByLabel(sourceLabel);
    const targetNodes = await this.findNodesByLabel(targetLabel);
    
    const paths: { path: GraphNode[]; strength: number }[] = [];
    
    for (const source of sourceNodes) {
      for (const target of targetNodes) {
        const path = await this.getShortestPath(source.id, target.id);
        if (path.length > 0) {
          // Calculate path strength based on edge weights
          let strength = 0;
          for (let i = 0; i < path.length - 1; i++) {
            const edges = await this.getEdgesBetween(path[i].id, path[i + 1].id);
            if (edges.length > 0) {
              strength += edges[0].weight;
            }
          }
          paths.push({ path, strength: strength / Math.max(1, path.length - 1) });
        }
      }
    }

    return paths.sort((a, b) => b.strength - a.strength);
  }

  async getConceptNeighborhood(conceptLabel: string, depth: number = 2): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    const startNodes = await this.findNodesByLabel(conceptLabel);
    if (startNodes.length === 0) return { nodes: [], edges: [] };

    const visitedNodes = new Set<string>();
    const neighborhoodNodes = new Map<string, GraphNode>();
    const neighborhoodEdges = new Map<string, GraphEdge>();
    const queue: { nodeId: string; currentDepth: number }[] = [];

    // Initialize with start nodes
    for (const node of startNodes) {
      neighborhoodNodes.set(node.id, node);
      visitedNodes.add(node.id);
      queue.push({ nodeId: node.id, currentDepth: 0 });
    }

    while (queue.length > 0) {
      const { nodeId, currentDepth } = queue.shift()!;
      
      if (currentDepth >= depth) continue;

      const connectedNodes = await this.getConnectedNodes(nodeId);
      
      for (const connectedNode of connectedNodes) {
        // Add node to neighborhood
        neighborhoodNodes.set(connectedNode.id, connectedNode);
        
        // Add edges
        const edges = await this.getEdgesBetween(nodeId, connectedNode.id);
        edges.forEach(edge => neighborhoodEdges.set(edge.id, edge));
        
        // Continue exploration if not visited and within depth
        if (!visitedNodes.has(connectedNode.id)) {
          visitedNodes.add(connectedNode.id);
          queue.push({ nodeId: connectedNode.id, currentDepth: currentDepth + 1 });
        }
      }
    }

    return {
      nodes: Array.from(neighborhoodNodes.values()),
      edges: Array.from(neighborhoodEdges.values())
    };
  }

  async getConceptCentrality(): Promise<{ concept: string; centrality: number; connections: number }[]> {
    const nodes = Array.from(this.graph.nodes.values());
    const centralityScores = [];

    for (const node of nodes) {
      const connections = await this.getConnectedNodes(node.id);
      const frequency = node.properties.frequency || 1;
      
      // Calculate centrality as combination of connections and frequency
      const centrality = connections.length * Math.log(frequency + 1);
      
      centralityScores.push({
        concept: node.label,
        centrality,
        connections: connections.length
      });
    }

    return centralityScores.sort((a, b) => b.centrality - a.centrality);
  }

  // Knowledge Gap Detection
  async detectKnowledgeGaps(): Promise<{ gap: string; suggestedConnections: string[]; reasoning: string }[]> {
    const clusters = await this.getConceptClusters();
    const gaps = [];

    // Find weakly connected clusters
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const cluster1 = clusters[i];
        const cluster2 = clusters[j];
        
        // Check if clusters have weak connections
        let connectionCount = 0;
        for (const node1 of cluster1.cluster) {
          for (const node2 of cluster2.cluster) {
            const edges = await this.getEdgesBetween(node1.id, node2.id);
            connectionCount += edges.length;
          }
        }
        
        if (connectionCount < 2) { // Weak connection threshold
          gaps.push({
            gap: `Connection between ${cluster1.centroid} and ${cluster2.centroid}`,
            suggestedConnections: [cluster1.centroid, cluster2.centroid],
            reasoning: `These concept clusters are weakly connected but may have hidden relationships`
          });
        }
      }
    }

    return gaps.slice(0, 5); // Return top 5 gaps
  }

  // Temporal Analysis
  async getTemporalEvolution(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{ period: string; concepts: string[]; growth: number }[]> {
    const nodes = Array.from(this.graph.nodes.values());
    const timeGroups = new Map<string, GraphNode[]>();
    
    const now = new Date();
    const msPerUnit = timeframe === 'day' ? 24 * 60 * 60 * 1000 : 
                     timeframe === 'week' ? 7 * 24 * 60 * 60 * 1000 :
                     30 * 24 * 60 * 60 * 1000;

    nodes.forEach(node => {
      const nodeTime = new Date(node.createdAt);
      const timePeriod = Math.floor((now.getTime() - nodeTime.getTime()) / msPerUnit);
      const periodKey = `${timePeriod} ${timeframe}s ago`;
      
      if (!timeGroups.has(periodKey)) {
        timeGroups.set(periodKey, []);
      }
      timeGroups.get(periodKey)!.push(node);
    });

    const evolution = [];
    const sortedPeriods = Array.from(timeGroups.keys()).sort();
    
    for (let i = 0; i < sortedPeriods.length; i++) {
      const period = sortedPeriods[i];
      const concepts = timeGroups.get(period)!.map(node => node.label);
      const previousCount = i > 0 ? timeGroups.get(sortedPeriods[i-1])!.length : 0;
      const currentCount = concepts.length;
      const growth = previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 0;
      
      evolution.push({ period, concepts, growth });
    }

    return evolution;
  }

  // Content Similarity Analysis
  async findSimilarConcepts(conceptLabel: string, limit: number = 5): Promise<{ concept: string; similarity: number; commonConnections: string[] }[]> {
    const targetNodes = await this.findNodesByLabel(conceptLabel);
    if (targetNodes.length === 0) return [];

    const targetNode = targetNodes[0];
    const targetConnections = await this.getConnectedNodes(targetNode.id);
    const targetConnectionSet = new Set(targetConnections.map(n => n.id));

    const allNodes = Array.from(this.graph.nodes.values());
    const similarities = [];

    for (const node of allNodes) {
      if (node.id === targetNode.id) continue;

      const nodeConnections = await this.getConnectedNodes(node.id);
      const nodeConnectionSet = new Set(nodeConnections.map(n => n.id));
      
      // Calculate Jaccard similarity
      const intersection = new Set([...targetConnectionSet].filter(x => nodeConnectionSet.has(x)));
      const union = new Set([...targetConnectionSet, ...nodeConnectionSet]);
      const similarity = intersection.size / union.size;

      if (similarity > 0) {
        const commonConnections = Array.from(intersection)
          .map(id => this.graph.nodes.get(id)?.label)
          .filter(Boolean) as string[];

        similarities.push({
          concept: node.label,
          similarity,
          commonConnections
        });
      }
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Advanced Visualization Data
  async getEnhancedVisualizationData(): Promise<any> {
    const baseData = await this.exportForVisualization();
    const centrality = await this.getConceptCentrality();
    const clusters = await this.getConceptClusters();
    
    // Enhance nodes with centrality and cluster info
    const enhancedNodes = baseData.nodes.map(node => {
      const centralityInfo = centrality.find(c => c.concept === node.label);
      const clusterInfo = clusters.find(c => c.cluster.some(n => n.label === node.label));
      
      return {
        ...node,
        centrality: centralityInfo?.centrality || 0,
        connections: centralityInfo?.connections || 0,
        clusterStrength: clusterInfo?.strength || 0,
        isClusterCentroid: clusterInfo?.centroid === node.label
      };
    });

    return {
      ...baseData,
      nodes: enhancedNodes,
      clusters: clusters.map(c => ({
        centroid: c.centroid,
        members: c.cluster.map(n => n.label),
        strength: c.strength
      })),
      centrality: centrality.slice(0, 10) // Top 10 most central concepts
    };
  }
} 