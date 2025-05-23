import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ZettelkastenController } from './zettelkasten.controller';
import { ZettelkastenService, TextNetworkAnalysis } from './zettelkasten.service';

describe('ZettelkastenController', () => {
  let controller: ZettelkastenController;
  let service: ZettelkastenService;

  const mockZettelkastenService = {
    getAllNotes: jest.fn(),
    createAtomicNote: jest.fn(),
    createBidirectionalLink: jest.fn(),
    getConnectedNotes: jest.fn(),
    visualizeKnowledgeGraph: jest.fn(),
    suggestRelatedNotes: jest.fn(),
    analyzeTextNetwork: jest.fn(),
    analyzeTextIncremental: jest.fn(),
    importFromFile: jest.fn(),
    getGraphVisualization: jest.fn(),
    getGraphStats: jest.fn(),
    searchGraphNodes: jest.fn(),
    getConceptClusters: jest.fn(),
    getKnowledgePaths: jest.fn(),
    getConceptNeighborhood: jest.fn(),
    getConceptCentrality: jest.fn(),
    detectKnowledgeGaps: jest.fn(),
    getTemporalEvolution: jest.fn(),
    findSimilarConcepts: jest.fn(),
    getEnhancedVisualizationData: jest.fn(),
    getAvailableAIModels: jest.fn(),
    getRecommendedModels: jest.fn(),
    analyzeCodeWithAI: jest.fn(),
    analyzeImageWithAI: jest.fn(),
    generateConceptSuggestions: jest.fn(),
    generateKnowledgeInsights: jest.fn(),
    analyzeTextWithAI: jest.fn(),
  };

  const validPassword = 'test-password';
  const invalidPassword = 'wrong-password';

  beforeEach(async () => {
    // Set environment variable for testing
    process.env.ZETTELKASTEN_PASSWORD = validPassword;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZettelkastenController],
      providers: [
        {
          provide: ZettelkastenService,
          useValue: mockZettelkastenService,
        },
      ],
    }).compile();

    controller = module.get<ZettelkastenController>(ZettelkastenController);
    service = module.get<ZettelkastenService>(ZettelkastenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllNotes', () => {
    it('should return notes when valid password is provided', async () => {
      const mockNotes = [
        { id: '1', content: 'Test note 1', tags: '[]', createdAt: new Date() },
        { id: '2', content: 'Test note 2', tags: '[]', createdAt: new Date() },
      ];
      mockZettelkastenService.getAllNotes.mockResolvedValue(mockNotes);

      const result = await controller.getAllNotes(validPassword);

      expect(result).toEqual(mockNotes);
      expect(service.getAllNotes).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when invalid password is provided', async () => {
      await expect(controller.getAllNotes(invalidPassword)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(service.getAllNotes).not.toHaveBeenCalled();
    });
  });

  describe('createNote', () => {
    it('should create a note when valid password is provided', async () => {
      const mockNote = { id: '1', content: 'New note', tags: '["test"]', createdAt: new Date() };
      mockZettelkastenService.createAtomicNote.mockResolvedValue(mockNote);

      const result = await controller.createNote(
        'New note',
        ['test'],
        validPassword,
        '2024-01-01T00:00:00Z',
      );

      expect(result).toEqual(mockNote);
      expect(service.createAtomicNote).toHaveBeenCalledWith(
        'New note',
        ['test'],
        '2024-01-01T00:00:00Z',
      );
    });

    it('should throw UnauthorizedException when invalid password is provided', async () => {
      await expect(
        controller.createNote('New note', ['test'], invalidPassword, '2024-01-01T00:00:00Z'),
      ).rejects.toThrow(UnauthorizedException);
      expect(service.createAtomicNote).not.toHaveBeenCalled();
    });
  });

  describe('createLink', () => {
    it('should create a link when valid password is provided', async () => {
      const mockLink = { id: '1', sourceNoteId: 'note1', targetNoteId: 'note2' };
      mockZettelkastenService.createBidirectionalLink.mockResolvedValue(mockLink);

      const result = await controller.createLink('note1', 'note2', validPassword);

      expect(result).toEqual(mockLink);
      expect(service.createBidirectionalLink).toHaveBeenCalledWith('note1', 'note2');
    });

    it('should throw UnauthorizedException when invalid password is provided', async () => {
      await expect(
        controller.createLink('note1', 'note2', invalidPassword),
      ).rejects.toThrow(UnauthorizedException);
      expect(service.createBidirectionalLink).not.toHaveBeenCalled();
    });
  });

  describe('getConnections', () => {
    it('should return connections when valid password is provided', async () => {
      const mockConnections = [
        { source: 'note1', target: 'note2' },
        { source: 'note1', target: 'note3' },
      ];
      mockZettelkastenService.getConnectedNotes.mockResolvedValue(mockConnections);

      const result = await controller.getConnections('note1', validPassword);

      expect(result).toEqual(mockConnections);
      expect(service.getConnectedNotes).toHaveBeenCalledWith('note1');
    });

    it('should throw UnauthorizedException when invalid password is provided', async () => {
      await expect(controller.getConnections('note1', invalidPassword)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(service.getConnectedNotes).not.toHaveBeenCalled();
    });
  });

  describe('analyzeText', () => {
    it('should analyze text when valid password is provided', async () => {
      const mockAnalysis: TextNetworkAnalysis = {
        nodes: [{ id: 'test', label: 'test', frequency: 1, centrality: 0.5, group: 1 }],
        edges: [{ source: 'test1', target: 'test2', weight: 1, type: 'connection' }],
        topics: [['topic1', 'topic2']],
        insights: ['Insight 1'],
        contentGaps: ['Gap 1'],
        keyTerms: ['key1', 'key2'],
        diversity: 0.8,
        metrics: {
          modularity: 0.3,
          density: 0.5,
          averageClustering: 0.4,
          averagePathLength: 2.1,
          diameter: 4,
          nodeCount: 10,
          edgeCount: 15,
        },
        structuralGaps: [],
      };
      mockZettelkastenService.analyzeTextNetwork.mockResolvedValue(mockAnalysis);

      const result = await controller.analyzeText('Sample text', validPassword);

      expect(result).toEqual(mockAnalysis);
      expect(service.analyzeTextNetwork).toHaveBeenCalledWith('Sample text');
    });

    it('should throw UnauthorizedException when invalid password is provided', async () => {
      await expect(controller.analyzeText('Sample text', invalidPassword)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(service.analyzeTextNetwork).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      mockZettelkastenService.analyzeTextNetwork.mockRejectedValue(
        new Error('Analysis failed'),
      );

      await expect(controller.analyzeText('Sample text', validPassword)).rejects.toThrow(
        'Analysis failed',
      );
    });
  });

  describe('analyzeTextIncremental', () => {
    it('should perform incremental analysis when valid password is provided', async () => {
      const previousAnalysis = { nodes: [], edges: [] };
      const mockAnalysis: TextNetworkAnalysis = {
        nodes: [{ id: 'test', label: 'test', frequency: 1, centrality: 0.5, group: 1 }],
        edges: [],
        topics: [],
        insights: [],
        contentGaps: [],
        keyTerms: [],
        diversity: 0,
        metrics: {
          modularity: 0,
          density: 0,
          averageClustering: 0,
          averagePathLength: 0,
          diameter: 0,
          nodeCount: 1,
          edgeCount: 0,
        },
        structuralGaps: [],
      };
      mockZettelkastenService.analyzeTextIncremental.mockResolvedValue(mockAnalysis);

      const result = await controller.analyzeTextIncremental(
        'New text',
        previousAnalysis,
        validPassword,
      );

      expect(result).toEqual(mockAnalysis);
      expect(service.analyzeTextIncremental).toHaveBeenCalledWith('New text', previousAnalysis);
    });

    it('should throw UnauthorizedException when invalid password is provided', async () => {
      await expect(
        controller.analyzeTextIncremental('New text', {}, invalidPassword),
      ).rejects.toThrow(UnauthorizedException);
      expect(service.analyzeTextIncremental).not.toHaveBeenCalled();
    });
  });

  describe('getGraphStats', () => {
    it('should return graph statistics when valid password is provided', async () => {
      const mockStats = {
        nodeCount: 50,
        edgeCount: 75,
        density: 0.3,
        averageDegree: 3.0,
      };
      mockZettelkastenService.getGraphStats.mockResolvedValue(mockStats);

      const result = await controller.getGraphStats(validPassword);

      expect(result).toEqual(mockStats);
      expect(service.getGraphStats).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when invalid password is provided', async () => {
      await expect(controller.getGraphStats(invalidPassword)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(service.getGraphStats).not.toHaveBeenCalled();
    });
  });

  describe('searchGraph', () => {
    it('should search graph nodes when valid password is provided', async () => {
      const mockResults = [
        { id: 'node1', label: 'matching term', relevance: 0.9 },
        { id: 'node2', label: 'another match', relevance: 0.7 },
      ];
      mockZettelkastenService.searchGraphNodes.mockResolvedValue(mockResults);

      const result = await controller.searchGraph('search term', validPassword);

      expect(result).toEqual(mockResults);
      expect(service.searchGraphNodes).toHaveBeenCalledWith('search term');
    });

    it('should throw UnauthorizedException when invalid password is provided', async () => {
      await expect(controller.searchGraph('search term', invalidPassword)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(service.searchGraphNodes).not.toHaveBeenCalled();
    });
  });

  describe('getAvailableModels', () => {
    it('should return available AI models when valid password is provided', async () => {
      const mockModels = [
        { name: 'model1', size: '7B', type: 'chat' },
        { name: 'model2', size: '13B', type: 'code' },
      ];
      mockZettelkastenService.getAvailableAIModels.mockResolvedValue(mockModels);

      const result = await controller.getAvailableModels(validPassword);

      expect(result).toEqual(mockModels);
      expect(service.getAvailableAIModels).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when invalid password is provided', async () => {
      await expect(controller.getAvailableModels(invalidPassword)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(service.getAvailableAIModels).not.toHaveBeenCalled();
    });
  });

  describe('analyzeCode', () => {
    it('should analyze code when valid password is provided', async () => {
      const mockAnalysis = {
        complexity: 'medium',
        suggestions: ['Use more descriptive variable names'],
        network: { nodes: [], edges: [] },
      };
      mockZettelkastenService.analyzeCodeWithAI.mockResolvedValue(mockAnalysis);

      const result = await controller.analyzeCode(
        'function test() { return true; }',
        'javascript',
        validPassword,
      );

      expect(result).toEqual(mockAnalysis);
      expect(service.analyzeCodeWithAI).toHaveBeenCalledWith(
        'function test() { return true; }',
        'javascript',
      );
    });

    it('should throw UnauthorizedException when invalid password is provided', async () => {
      await expect(
        controller.analyzeCode('code', 'javascript', invalidPassword),
      ).rejects.toThrow(UnauthorizedException);
      expect(service.analyzeCodeWithAI).not.toHaveBeenCalled();
    });
  });

  describe('generateInsights', () => {
    it('should generate insights when valid password is provided', async () => {
      const mockInsights = [
        'The text shows high connectivity in technology topics',
        'Knowledge gaps detected in implementation details',
      ];
      mockZettelkastenService.generateKnowledgeInsights.mockResolvedValue(mockInsights);

      const result = await controller.generateInsights(validPassword);

      expect(result).toEqual(mockInsights);
      expect(service.generateKnowledgeInsights).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when invalid password is provided', async () => {
      await expect(controller.generateInsights(invalidPassword)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(service.generateKnowledgeInsights).not.toHaveBeenCalled();
    });
  });
}); 