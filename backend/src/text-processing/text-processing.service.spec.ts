import { Test, TestingModule } from '@nestjs/testing';
import { TextProcessingService } from './text-processing.service';
import { JanusGraphService } from '../janusgraph/janusgraph.service';

describe('TextProcessingService', () => {
  let service: TextProcessingService;
  let janusGraphService: JanusGraphService;
  let consoleErrorSpy: jest.SpyInstance;

  const mockJanusGraphService = {
    getVertexByProperty: jest.fn(),
    createVertex: jest.fn(),
    createEdge: jest.fn(),
    getVertices: jest.fn(),
    getEdges: jest.fn(),
  };

  beforeEach(async () => {
    // Spy on console.error to suppress expected error messages during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextProcessingService,
        {
          provide: JanusGraphService,
          useValue: mockJanusGraphService,
        },
      ],
    }).compile();

    service = module.get<TextProcessingService>(TextProcessingService);
    janusGraphService = module.get<JanusGraphService>(JanusGraphService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  describe('processTextToNetwork', () => {
    it('should process simple text and create network structure', async () => {
      const text = 'artificial intelligence machine learning algorithms';
      
      // Mock JanusGraph responses
      mockJanusGraphService.getVertexByProperty.mockResolvedValue(null);
      mockJanusGraphService.createVertex.mockResolvedValue({ id: 'vertex-123' });
      mockJanusGraphService.createEdge.mockResolvedValue({ id: 'edge-456' });

      const result = await service.processTextToNetwork(text);

      expect(result).toHaveProperty('nodes');
      expect(result).toHaveProperty('edges');
      expect(result.nodes).toHaveLength(5); // artificial, intelligence, machine, learning, algorithms
      expect(result.nodes[0]).toHaveProperty('id');
      expect(result.nodes[0]).toHaveProperty('label');
      expect(result.nodes[0]).toHaveProperty('type');
      expect(result.nodes[0].type).toBe('concept');
    });

    it('should handle empty text input', async () => {
      const text = '';
      
      const result = await service.processTextToNetwork(text);

      expect(result.nodes).toHaveLength(0);
      expect(result.edges).toHaveLength(0);
      expect(janusGraphService.createVertex).not.toHaveBeenCalled();
      expect(janusGraphService.createEdge).not.toHaveBeenCalled();
    });

    it('should filter out short words (length <= 2)', async () => {
      const text = 'AI is a big technology';
      
      mockJanusGraphService.getVertexByProperty.mockResolvedValue(null);
      mockJanusGraphService.createVertex.mockResolvedValue({ id: 'vertex-123' });
      mockJanusGraphService.createEdge.mockResolvedValue({ id: 'edge-456' });

      const result = await service.processTextToNetwork(text);

      // Should exclude 'AI', 'is', 'a' (length <= 2)
      expect(result.nodes).toHaveLength(2); // 'big', 'technology'
      expect(result.nodes.find(node => node.label === 'big')).toBeDefined();
      expect(result.nodes.find(node => node.label === 'technology')).toBeDefined();
      expect(result.nodes.find(node => node.label === 'ai')).toBeUndefined();
    });

    it('should create edges between consecutive words', async () => {
      const text = 'machine learning algorithms';
      
      mockJanusGraphService.getVertexByProperty.mockResolvedValue(null);
      mockJanusGraphService.createVertex.mockResolvedValue({ id: 'vertex-123' });
      mockJanusGraphService.createEdge.mockResolvedValue({ id: 'edge-456' });

      const result = await service.processTextToNetwork(text);

      expect(result.edges).toHaveLength(2);
      expect(result.edges[0]).toEqual({
        source: 'concept-machine',
        target: 'concept-learning',
        label: 'follows'
      });
      expect(result.edges[1]).toEqual({
        source: 'concept-learning',
        target: 'concept-algorithms',
        label: 'follows'
      });
    });

    it('should handle existing vertices in JanusGraph', async () => {
      const text = 'machine learning';
      
      const existingVertex = { id: 'existing-vertex-123' };
      mockJanusGraphService.getVertexByProperty.mockResolvedValue(existingVertex);
      mockJanusGraphService.createEdge.mockResolvedValue({ id: 'edge-456' });

      const result = await service.processTextToNetwork(text);

      expect(result.nodes).toHaveLength(2);
      expect(janusGraphService.getVertexByProperty).toHaveBeenCalledWith(
        'conceptId',
        'concept-machine',
        'Concept'
      );
      expect(janusGraphService.createVertex).not.toHaveBeenCalled(); // Should use existing vertex
    });

    it('should handle JanusGraph vertex creation errors gracefully', async () => {
      const text = 'test word';
      
      mockJanusGraphService.getVertexByProperty.mockResolvedValue(null);
      mockJanusGraphService.createVertex.mockRejectedValue(new Error('Database error'));

      const result = await service.processTextToNetwork(text);

      // Should still return nodes and edges even if JanusGraph operations fail
      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
    });

    it('should handle JanusGraph edge creation errors gracefully', async () => {
      const text = 'test word';
      
      mockJanusGraphService.getVertexByProperty.mockResolvedValue(null);
      mockJanusGraphService.createVertex.mockResolvedValue({ id: 'vertex-123' });
      mockJanusGraphService.createEdge.mockRejectedValue(new Error('Edge creation failed'));

      const result = await service.processTextToNetwork(text);

      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
      // Should log error but not throw
    });

    it('should handle case insensitive text processing', async () => {
      const text = 'Machine LEARNING Algorithms';
      
      mockJanusGraphService.getVertexByProperty.mockResolvedValue(null);
      mockJanusGraphService.createVertex.mockResolvedValue({ id: 'vertex-123' });

      const result = await service.processTextToNetwork(text);

      expect(result.nodes[0].label).toBe('machine');
      expect(result.nodes[1].label).toBe('learning');
      expect(result.nodes[2].label).toBe('algorithms');
    });

    it('should handle punctuation and special characters', async () => {
      const text = 'machine-learning, algorithms! and data-science.';
      
      mockJanusGraphService.getVertexByProperty.mockResolvedValue(null);
      mockJanusGraphService.createVertex.mockResolvedValue({ id: 'vertex-123' });

      const result = await service.processTextToNetwork(text);

      // Should split on whitespace and include words with hyphens/punctuation
      expect(result.nodes.length).toBeGreaterThan(0);
      expect(result.nodes.some(node => node.label.includes('machine-learning'))).toBe(true);
    });
  });

  describe('getGraphData', () => {
    it('should retrieve and format graph data from JanusGraph', async () => {
      const mockVertices = [
        {
          id: 'vertex-1',
          properties: {
            conceptId: [{ value: 'concept-machine' }],
            label: [{ value: 'machine' }],
            type: [{ value: 'concept' }]
          }
        },
        {
          id: 'vertex-2',
          properties: {
            conceptId: [{ value: 'concept-learning' }],
            label: [{ value: 'learning' }],
            type: [{ value: 'concept' }]
          }
        }
      ];

      const mockEdges = [
        {
          outV: 'vertex-1',
          inV: 'vertex-2',
          properties: {
            label: [{ value: 'follows' }]
          }
        }
      ];

      mockJanusGraphService.getVertices.mockResolvedValue(mockVertices);
      mockJanusGraphService.getEdges.mockResolvedValue(mockEdges);

      const result = await service.getGraphData();

      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
      
      expect(result.nodes[0]).toEqual({
        id: 'concept-machine',
        label: 'machine',
        type: 'concept'
      });
      
      expect(result.edges[0]).toEqual({
        source: 'vertex-1',
        target: 'vertex-2',
        label: 'follows'
      });
    });

    it('should handle missing vertex properties gracefully', async () => {
      const mockVertices = [
        {
          id: 'vertex-1',
          properties: {} // Missing properties
        }
      ];

      const mockEdges = [];

      mockJanusGraphService.getVertices.mockResolvedValue(mockVertices);
      mockJanusGraphService.getEdges.mockResolvedValue(mockEdges);

      const result = await service.getGraphData();

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0]).toEqual({
        id: 'vertex-1',
        label: 'Unknown',
        type: 'concept'
      });
    });

    it('should handle missing edge properties gracefully', async () => {
      const mockVertices = [];
      const mockEdges = [
        {
          outV: 'vertex-1',
          inV: 'vertex-2',
          properties: {} // Missing properties
        }
      ];

      mockJanusGraphService.getVertices.mockResolvedValue(mockVertices);
      mockJanusGraphService.getEdges.mockResolvedValue(mockEdges);

      const result = await service.getGraphData();

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]).toEqual({
        source: 'vertex-1',
        target: 'vertex-2',
        label: 'follows'
      });
    });

    it('should handle JanusGraph retrieval errors gracefully', async () => {
      mockJanusGraphService.getVertices.mockRejectedValue(new Error('Database connection failed'));
      mockJanusGraphService.getEdges.mockRejectedValue(new Error('Database connection failed'));

      const result = await service.getGraphData();

      expect(result.nodes).toHaveLength(0);
      expect(result.edges).toHaveLength(0);
    });

    it('should handle empty graph data', async () => {
      mockJanusGraphService.getVertices.mockResolvedValue([]);
      mockJanusGraphService.getEdges.mockResolvedValue([]);

      const result = await service.getGraphData();

      expect(result.nodes).toHaveLength(0);
      expect(result.edges).toHaveLength(0);
    });

    it('should call JanusGraph with correct parameters', async () => {
      mockJanusGraphService.getVertices.mockResolvedValue([]);
      mockJanusGraphService.getEdges.mockResolvedValue([]);

      await service.getGraphData();

      expect(janusGraphService.getVertices).toHaveBeenCalledWith('Concept');
      expect(janusGraphService.getEdges).toHaveBeenCalledWith('FOLLOWS');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null and undefined text input', async () => {
      // Test null input - should handle gracefully without throwing
      const resultNull = await service.processTextToNetwork(null as any);
      expect(resultNull.nodes).toHaveLength(0);
      expect(resultNull.edges).toHaveLength(0);

      // Test undefined input - should handle gracefully without throwing
      const resultUndefined = await service.processTextToNetwork(undefined as any);
      expect(resultUndefined.nodes).toHaveLength(0);
      expect(resultUndefined.edges).toHaveLength(0);
    });

    it('should handle very long text input', async () => {
      const longText = 'word '.repeat(1000) + 'final';
      
      mockJanusGraphService.getVertexByProperty.mockResolvedValue(null);
      mockJanusGraphService.createVertex.mockResolvedValue({ id: 'vertex-123' });

      const result = await service.processTextToNetwork(longText);

      expect(result.nodes).toHaveLength(2); // 'word' and 'final'
      expect(result.edges.length).toBeGreaterThan(0);
    });

    it('should handle repeated words correctly', async () => {
      const text = 'test test test word';
      
      mockJanusGraphService.getVertexByProperty.mockResolvedValue(null);
      mockJanusGraphService.createVertex.mockResolvedValue({ id: 'vertex-123' });

      const result = await service.processTextToNetwork(text);

      // Should only create unique nodes
      expect(result.nodes).toHaveLength(2); // 'test' and 'word'
      expect(result.edges).toHaveLength(3); // Multiple edges for repeated 'test'
    });
  });
}); 