import { Controller, Get, Post, Body, Param, Query, UnauthorizedException } from '@nestjs/common';
import { ZettelkastenService, TextNetworkAnalysis } from './zettelkasten.service';

// Controller for Zettelkasten functionality
@Controller('zettelkasten')
export class ZettelkastenController {
  constructor(private readonly zettelkastenService: ZettelkastenService) {}

  @Get('notes')
  async getAllNotes(@Query('password') password: string) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.getAllNotes();
  }

  @Post('notes')
  async createNote(
    @Body('content') content: string, 
    @Body('tags') tags: string[],
    @Body('password') password: string,
    @Body('createdAt') createdAt: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.createAtomicNote(content, tags, createdAt);
  }

  @Post('links')
  async createLink(
    @Body('noteId1') noteId1: string,
    @Body('noteId2') noteId2: string,
    @Body('password') password: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.createBidirectionalLink(noteId1, noteId2);
  }

  @Get('notes/:id/connections')
  async getConnections(@Param('id') noteId: string, @Query('password') password: string) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.getConnectedNotes(noteId);
  }

  @Get('notes/:id/graph')
  async getGraph(@Param('id') noteId: string, @Query('password') password: string) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.visualizeKnowledgeGraph(noteId);
  }

  @Get('notes/:id/suggestions')
  async getSuggestions(@Param('id') noteId: string, @Query('password') password: string) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.suggestRelatedNotes(noteId);
  }

  @Post('text/analyze')
  async analyzeText(
    @Body('text') text: string,
    @Body('password') password: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.analyzeTextNetwork(text);
  }

  @Post('text/analyze-incremental')
  async analyzeTextIncremental(
    @Body('text') text: string,
    @Body('previousAnalysis') previousAnalysis: any,
    @Body('password') password: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    
    return this.zettelkastenService.analyzeTextIncremental(text, previousAnalysis);
  }

  @Post('import/file')
  async importFile(
    @Body('content') content: string,
    @Body('fileName') fileName: string,
    @Body('password') password: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.importFromFile(content, fileName);
  }

  // NEW: Export graph data in various formats
  @Post('graph/export')
  async exportGraph(
    @Body('text') text: string,
    @Body('format') format: 'json' | 'gexf' | 'csv',
    @Body('password') password: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    
    const analysis = await this.zettelkastenService.analyzeTextNetwork(text);
    
    switch (format) {
      case 'gexf':
        return this.generateGEXF(analysis);
      case 'csv':
        return this.generateCSV(analysis);
      default:
        return analysis;
    }
  }

  // NEW: Get embedded graph visualization data
  @Get('graph/visualization')
  async getGraphVisualization(@Query('password') password: string) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    
    return this.zettelkastenService.getGraphVisualization();
  }

  // NEW: Get graph statistics
  @Get('graph/stats')
  async getGraphStats(@Query('password') password: string) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    
    return this.zettelkastenService.getGraphStats();
  }

  // NEW: Search graph nodes
  @Get('graph/search')
  async searchGraph(
    @Query('query') query: string,
    @Query('password') password: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    
    return this.zettelkastenService.searchGraphNodes(query);
  }

  // ===== ENHANCED DIGITAL GARDEN FEATURES =====

  // Knowledge Discovery
  @Get('garden/clusters')
  async getConceptClusters(@Query('password') password: string) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.getConceptClusters();
  }

  @Get('garden/paths')
  async getKnowledgePaths(
    @Query('source') source: string,
    @Query('target') target: string,
    @Query('password') password: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.getKnowledgePaths(source, target);
  }

  @Get('garden/neighborhood')
  async getConceptNeighborhood(
    @Query('concept') concept: string,
    @Query('depth') depth: string,
    @Query('password') password: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.getConceptNeighborhood(concept, parseInt(depth) || 2);
  }

  @Get('garden/centrality')
  async getConceptCentrality(@Query('password') password: string) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.getConceptCentrality();
  }

  @Get('garden/gaps')
  async detectKnowledgeGaps(@Query('password') password: string) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.detectKnowledgeGaps();
  }

  @Get('garden/evolution')
  async getTemporalEvolution(
    @Query('timeframe') timeframe: 'day' | 'week' | 'month',
    @Query('password') password: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.getTemporalEvolution(timeframe || 'week');
  }

  @Get('garden/similar')
  async findSimilarConcepts(
    @Query('concept') concept: string,
    @Query('limit') limit: string,
    @Query('password') password: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.findSimilarConcepts(concept, parseInt(limit) || 5);
  }

  @Get('garden/enhanced-visualization')
  async getEnhancedVisualization(@Query('password') password: string) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.getEnhancedVisualizationData();
  }

  // ===== AI-ENHANCED FEATURES =====

  // Model Management
  @Get('ai/models')
  async getAvailableModels(@Query('password') password: string) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.getAvailableAIModels();
  }

  @Get('ai/models/recommended')
  async getRecommendedModels(@Query('password') password: string) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.getRecommendedModels();
  }

  // Code Analysis with CodeLlama
  @Post('ai/analyze-code')
  async analyzeCode(
    @Body('code') code: string,
    @Body('language') language: string,
    @Body('password') password: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.analyzeCodeWithAI(code, language);
  }

  // Multimodal Image Analysis
  @Post('ai/analyze-image')
  async analyzeImage(
    @Body('imageBase64') imageBase64: string,
    @Body('query') query: string,
    @Body('password') password: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.analyzeImageWithAI(imageBase64, query);
  }

  // AI-Powered Concept Suggestions
  @Post('ai/suggest-concepts')
  async suggestConcepts(
    @Body('domain') domain: string,
    @Body('password') password: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.generateConceptSuggestions(domain);
  }

  // Knowledge Insights Generation
  @Get('ai/insights')
  async generateInsights(@Query('password') password: string) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.generateKnowledgeInsights();
  }

  // Enhanced Text Analysis with AI
  @Post('ai/analyze-text-enhanced')
  async analyzeTextEnhanced(
    @Body('text') text: string,
    @Body('useAI') useAI: boolean,
    @Body('password') password: string
  ) {
    if (password !== process.env.ZETTELKASTEN_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.zettelkastenService.analyzeTextWithAI(text, useAI);
  }

  private generateGEXF(analysis: TextNetworkAnalysis): string {
    // Generate GEXF format for Gephi compatibility
    let gexf = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://www.gexf.net/1.2draft" version="1.2">
  <meta lastmodifieddate="${new Date().toISOString()}">
    <creator>InfraSyncus</creator>
    <description>Text Network Analysis</description>
  </meta>
  <graph mode="static" defaultedgetype="undirected">
    <nodes>`;
    
    analysis.nodes.forEach((node: any) => {
      gexf += `
    <node id="${node.id}" label="${node.label}">
      <attvalues>
        <attvalue for="size" value="${node.size || 5}"/>
        <attvalue for="color" value="${node.color || '#95a5a6'}"/>
        <attvalue for="community" value="${node.community || 0}"/>
      </attvalues>
    </node>`;
    });
    
    gexf += `
  </nodes>
  <edges>`;
    
    analysis.edges.forEach((edge: any, index: number) => {
      gexf += `
    <edge id="${index}" source="${edge.source}" target="${edge.target}" weight="${edge.weight || 1}"/>`;
    });
    
    gexf += `
  </edges>
</graph>
</gexf>`;
    
    return gexf;
  }

  private generateCSV(analysis: TextNetworkAnalysis): { nodes: string, edges: string } {
    // Generate CSV format
    let nodesCsv = 'id,label,size,color,community,betweenness\n';
    analysis.nodes.forEach((node: any) => {
      nodesCsv += `"${node.id}","${node.label}",${node.size || 5},"${node.color || '#95a5a6'}",${node.community || 0},${node.betweenness || 0}\n`;
    });

    let edgesCsv = 'source,target,weight,label\n';
    analysis.edges.forEach((edge: any) => {
      edgesCsv += `"${edge.source}","${edge.target}",${edge.weight || 1},"${edge.label || ''}"\n`;
    });

    return { nodes: nodesCsv, edges: edgesCsv };
  }
}