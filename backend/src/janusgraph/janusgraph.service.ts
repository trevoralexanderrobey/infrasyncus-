import { Injectable, OnModuleInit } from '@nestjs/common';

// Dynamic require fallback for gremlin dependency
let gremlin: any;
try {
  gremlin = require('gremlin');
} catch (error) {
  console.error('⚠️  Gremlin dependency not available:', error.message);
  console.error('📦 Install with: npm install gremlin');
  console.error('🚀 Application will continue without JanusGraph functionality');
  // Create mock gremlin object to prevent TypeScript errors
  gremlin = {
    driver: {
      Client: class MockClient { constructor() {} },
      DriverRemoteConnection: class MockDriverRemoteConnection { constructor() {} }
    },
    process: {
      traversal: () => ({
        withRemote: () => null
      })
    }
  };
}

@Injectable()
export class JanusGraphService implements OnModuleInit {
  private client: any;
  private g: any;

  constructor() {
    const host = process.env.JANUSGRAPH_HOST || 'localhost';
    const port = process.env.JANUSGRAPH_PORT || '8182';
    
    // Check if gremlin is actually available (not our mock)
    if (!gremlin.driver.Client || gremlin.driver.Client.name === 'MockClient') {
      console.warn('🔧 JanusGraph client not available - using fallback mode');
      this.client = null;
      this.g = null;
      return;
    }
    
    try {
      this.client = new gremlin.driver.Client(
        `ws://${host}:${port}/gremlin`,
        {
          traversalSource: 'g',
        }
      );
      
      this.g = gremlin.process.traversal().withRemote(
        new gremlin.driver.DriverRemoteConnection(`ws://${host}:${port}/gremlin`)
      );
    } catch (error) {
      console.error('Error initializing JanusGraph client:', error);
      // Initialize with null values to prevent crashes
      this.client = null as any;
      this.g = null as any;
    }
  }

  async onModuleInit() {
    if (!this.client || !this.g) {
      console.error('JanusGraph client not initialized. Application will continue without graph functionality.');
      return;
    }

    try {
      // Test connection with a simple query
      await this.g.V().limit(1).toList();
      console.log('JanusGraph connection established successfully');
    } catch (error) {
      console.error('Failed to connect to JanusGraph:', error.message);
      console.error('Please ensure that:');
      console.error('1. JanusGraph server is installed and running');
      console.error('2. Gremlin Server is accessible at:', 
        `${process.env.JANUSGRAPH_HOST || 'localhost'}:${process.env.JANUSGRAPH_PORT || '8182'}`);
      // Don't throw error to allow app to start without JanusGraph
      console.error('Application will continue without JanusGraph functionality');
    }
  }

  async createVertex(label: string, properties: Record<string, any>) {
    if (!this.g) {
      console.warn('JanusGraph not available, skipping vertex creation');
      return null;
    }

    try {
      let traversal = this.g.addV(label);
      
      for (const [key, value] of Object.entries(properties)) {
        traversal = traversal.property(key, value);
      }
      
      const result = await traversal.next();
      return result.value;
    } catch (error) {
      console.error('Error creating vertex:', error);
      return null;
    }
  }

  async createEdge(fromVertexId: any, toVertexId: any, label: string, properties: Record<string, any> = {}) {
    if (!this.g) {
      console.warn('JanusGraph not available, skipping edge creation');
      return null;
    }

    try {
      let traversal = this.g.V(fromVertexId).addE(label).to(this.g.V(toVertexId));
      
      for (const [key, value] of Object.entries(properties)) {
        traversal = traversal.property(key, value);
      }
      
      const result = await traversal.next();
      return result.value;
    } catch (error) {
      console.error('Error creating edge:', error);
      return null;
    }
  }

  async getVertex(id: any) {
    if (!this.g) {
      return null;
    }

    try {
      const result = await this.g.V(id).next();
      return result.value;
    } catch (error) {
      console.error('Error getting vertex:', error);
      return null;
    }
  }

  async getVertices(label?: string) {
    if (!this.g) {
      return [];
    }

    try {
      let traversal = this.g.V();
      if (label) {
        traversal = traversal.hasLabel(label);
      }
      return await traversal.toList();
    } catch (error) {
      console.error('Error getting vertices:', error);
      return [];
    }
  }

  async getEdges(label?: string) {
    if (!this.g) {
      return [];
    }

    try {
      let traversal = this.g.E();
      if (label) {
        traversal = traversal.hasLabel(label);
      }
      return await traversal.toList();
    } catch (error) {
      console.error('Error getting edges:', error);
      return [];
    }
  }

  async getConnectedVertices(id: any, direction: 'in' | 'out' | 'both' = 'both') {
    if (!this.g) {
      return [];
    }

    try {
      let traversal = this.g.V(id);
      
      switch (direction) {
        case 'in':
          traversal = traversal.in_();
          break;
        case 'out':
          traversal = traversal.out();
          break;
        case 'both':
          traversal = traversal.both();
          break;
      }
      
      return await traversal.toList();
    } catch (error) {
      console.error('Error getting connected vertices:', error);
      return [];
    }
  }

  async getVertexByProperty(property: string, value: any, label?: string) {
    if (!this.g) {
      return null;
    }

    try {
      let traversal = this.g.V();
      if (label) {
        traversal = traversal.hasLabel(label);
      }
      traversal = traversal.has(property, value);
      const result = await traversal.next();
      return result.value;
    } catch (error) {
      console.error('Error getting vertex by property:', error);
      return null;
    }
  }

  async close() {
    if (!this.client) {
      return;
    }

    try {
      await this.client.close();
    } catch (error) {
      console.error('Error closing JanusGraph connection:', error);
    }
  }
} 