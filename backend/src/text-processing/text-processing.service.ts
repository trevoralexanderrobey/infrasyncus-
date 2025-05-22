import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';

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
  constructor(private readonly neo4jService: Neo4jService) {}

  async processTextToNetwork(text: string): Promise<{ nodes: Node[]; edges: Edge[] }> {
    // Basic text processing to extract concepts and relationships
    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = [...new Set(words)];
    
    // Create nodes for each unique word
    const nodes = uniqueWords.map((word, i) => ({
      id: `node-${i}`,
      label: word,
      type: 'concept'
    }));
    
    // Create edges between consecutive words
    const edges = [];
    for (let i = 0; i < words.length - 1; i++) {
      const sourceIndex = uniqueWords.indexOf(words[i]);
      const targetIndex = uniqueWords.indexOf(words[i+1]);
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        edges.push({
          source: `node-${sourceIndex}`,
          target: `node-${targetIndex}`,
          label: 'related'
        });
      }
    }
    
    // Store in Neo4j
    const session = this.neo4jService.getSession();
    try {
      await session.writeTransaction(async tx => {
        // Create nodes
        for (const node of nodes) {
          await tx.run(
            'MERGE (n:Concept {id: $id, label: $label, type: $type})',
            node
          );
        }
        
        // Create relationships
        for (const edge of edges) {
          await tx.run(
            'MATCH (a:Concept {id: $source}), (b:Concept {id: $target}) MERGE (a)-[r:RELATED]->(b)',
            edge
          );
        }
      });
    } finally {
      await session.close();
    }
    
    return { nodes, edges };
  }
}