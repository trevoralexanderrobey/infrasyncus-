export interface NetworkNode {
  id: string;
  label: string;
  size: number;
  color: string;
  betweenness?: number;
  community?: number;
  degree?: number;
  closeness?: number;
  eigenvector?: number;
  x?: number;
  y?: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  label?: string;
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
  structuralGaps: Array<{
    community1: number;
    community2: number;
    bridgingConcepts: string[];
  }>;
} 