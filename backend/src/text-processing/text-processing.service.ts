import { Injectable } from '@nestjs/common';
import { JanusGraphService } from '../janusgraph/janusgraph.service';

type Node = {
  id: string;
  label: string;
  type: string;
};

type Edge = {
  source: string;
  target: string;
  label: string;
};

@Injectable()
export class TextProcessingService {
  constructor(private readonly janusGraphService: JanusGraphService) {}

  async processTextToNetwork(text: string): Promise<{ nodes: Node[]; edges: Edge[] }> {
    // Basic text processing to extract concepts and relationships
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const uniqueWords = [...new Set(words)];
    
    // Create nodes for each unique word
    const nodes = uniqueWords.map((word, i) => ({
      id: `concept-${word}`,
      label: word,
      type: 'concept'
    }));
    
    // Create edges between consecutive words
    const edges = [];
    for (let i = 0; i < words.length - 1; i++) {
      const sourceId = `concept-${words[i]}`;
      const targetId = `concept-${words[i+1]}`;
      
      if (uniqueWords.includes(words[i]) && uniqueWords.includes(words[i+1])) {
        edges.push({
          source: sourceId,
          target: targetId,
          label: 'follows'
        });
      }
    }
    
    // Store in JanusGraph
    try {
      const vertexMap = new Map();
      
      // Create vertices and store their IDs
      for (const node of nodes) {
        try {
          // Check if vertex already exists
          let vertex = await this.janusGraphService.getVertexByProperty('conceptId', node.id, 'Concept');
          
          if (!vertex) {
            // Create new vertex
            vertex = await this.janusGraphService.createVertex('Concept', {
              conceptId: node.id,
              label: node.label,
              type: node.type
            });
          }
          
          if (vertex && vertex.id) {
            vertexMap.set(node.id, vertex.id);
          }
        } catch (error) {
          console.error(`Error creating vertex for ${node.id}:`, error);
        }
      }
      
      // Create edges using the vertex IDs
      for (const edge of edges) {
        try {
          const sourceVertexId = vertexMap.get(edge.source);
          const targetVertexId = vertexMap.get(edge.target);
          
          if (sourceVertexId && targetVertexId) {
            await this.janusGraphService.createEdge(
              sourceVertexId,
              targetVertexId,
              'FOLLOWS',
              { weight: 1, label: edge.label }
            );
          }
        } catch (error) {
          console.error(`Error creating edge from ${edge.source} to ${edge.target}:`, error);
        }
      }
    } catch (error) {
      console.error('Error storing graph in JanusGraph:', error);
    }
    
    return { nodes, edges };
  }

  async getGraphData(): Promise<{ nodes: Node[]; edges: Edge[] }> {
    try {
      // Get all concept vertices
      const vertices = await this.janusGraphService.getVertices('Concept');
      const edges = await this.janusGraphService.getEdges('FOLLOWS');
      
      const nodes = vertices.map(vertex => ({
        id: vertex.properties?.conceptId?.[0]?.value || vertex.id,
        label: vertex.properties?.label?.[0]?.value || 'Unknown',
        type: vertex.properties?.type?.[0]?.value || 'concept'
      }));
      
      const edgeList = edges.map(edge => ({
        source: edge.outV,
        target: edge.inV,
        label: edge.properties?.label?.[0]?.value || 'follows'
      }));
      
      return { nodes, edges: edgeList };
    } catch (error) {
      console.error('Error retrieving graph data:', error);
      return { nodes: [], edges: [] };
    }
  }
}