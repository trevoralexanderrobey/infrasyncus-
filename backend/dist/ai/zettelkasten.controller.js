"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZettelkastenController = void 0;
const common_1 = require("@nestjs/common");
const zettelkasten_service_1 = require("./zettelkasten.service");
let ZettelkastenController = class ZettelkastenController {
    constructor(zettelkastenService) {
        this.zettelkastenService = zettelkastenService;
    }
    async getAllNotes(password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.getAllNotes();
    }
    async createNote(content, tags, password, createdAt) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.createAtomicNote(content, tags, createdAt);
    }
    async createLink(noteId1, noteId2, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.createBidirectionalLink(noteId1, noteId2);
    }
    async getConnections(noteId, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.getConnectedNotes(noteId);
    }
    async getGraph(noteId, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.visualizeKnowledgeGraph(noteId);
    }
    async getSuggestions(noteId, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.suggestRelatedNotes(noteId);
    }
    async analyzeText(text, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.analyzeTextNetwork(text);
    }
    async analyzeTextIncremental(text, previousAnalysis, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.analyzeTextIncremental(text, previousAnalysis);
    }
    async importFile(content, fileName, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.importFromFile(content, fileName);
    }
    async exportGraph(text, format, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        const analysis = await this.zettelkastenService.analyzeTextNetwork(text);
        switch (format) {
            case "gexf":
                return this.generateGEXF(analysis);
            case "csv":
                return this.generateCSV(analysis);
            default:
                return analysis;
        }
    }
    async getGraphVisualization(password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.getGraphVisualization();
    }
    async getGraphStats(password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.getGraphStats();
    }
    async searchGraph(query, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.searchGraphNodes(query);
    }
    async getConceptClusters(password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.getConceptClusters();
    }
    async getKnowledgePaths(source, target, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.getKnowledgePaths(source, target);
    }
    async getConceptNeighborhood(concept, depth, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.getConceptNeighborhood(concept, parseInt(depth) || 2);
    }
    async getConceptCentrality(password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.getConceptCentrality();
    }
    async detectKnowledgeGaps(password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.detectKnowledgeGaps();
    }
    async getTemporalEvolution(timeframe, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.getTemporalEvolution(timeframe || "week");
    }
    async findSimilarConcepts(concept, limit, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.findSimilarConcepts(concept, parseInt(limit) || 5);
    }
    async getEnhancedVisualization(password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.getEnhancedVisualizationData();
    }
    async getAvailableModels(password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.getAvailableAIModels();
    }
    async getRecommendedModels(password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.getRecommendedModels();
    }
    async analyzeCode(code, language, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.analyzeCodeWithAI(code, language);
    }
    async analyzeImage(imageBase64, query, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.analyzeImageWithAI(imageBase64, query);
    }
    async suggestConcepts(domain, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.generateConceptSuggestions(domain);
    }
    async generateInsights(password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.generateKnowledgeInsights();
    }
    async analyzeTextEnhanced(text, useAI, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.analyzeTextWithAI(text, useAI);
    }
    async searchAndCreateNotes(query, context, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.searchAndCreateNotes(query, context);
    }
    async enrichNote(noteId, domain, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.enrichExistingNote(noteId, domain);
    }
    async fillKnowledgeGaps(gapDescription, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.fillKnowledgeGapsWithSearch(gapDescription);
    }
    async getCurrentInformation(concept, timeframe, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new common_1.UnauthorizedException("Invalid password");
        }
        return this.zettelkastenService.findCurrentInformation(concept, timeframe);
    }
    generateGEXF(analysis) {
        let gexf = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://www.gexf.net/1.2draft" version="1.2">
  <meta lastmodifieddate="${new Date().toISOString()}">
    <creator>InfraSyncus</creator>
    <description>Text Network Analysis</description>
  </meta>
  <graph mode="static" defaultedgetype="undirected">
    <nodes>`;
        analysis.nodes.forEach((node) => {
            gexf += `
    <node id="${node.id}" label="${node.label}">
      <attvalues>
        <attvalue for="size" value="${node.size || 5}"/>
        <attvalue for="color" value="${node.color || "#95a5a6"}"/>
        <attvalue for="community" value="${node.community || 0}"/>
      </attvalues>
    </node>`;
        });
        gexf += `
  </nodes>
  <edges>`;
        analysis.edges.forEach((edge, index) => {
            gexf += `
    <edge id="${index}" source="${edge.source}" target="${edge.target}" weight="${edge.weight || 1}"/>`;
        });
        gexf += `
  </edges>
</graph>
</gexf>`;
        return gexf;
    }
    generateCSV(analysis) {
        let nodesCsv = "id,label,size,color,community,betweenness\n";
        analysis.nodes.forEach((node) => {
            nodesCsv += `"${node.id}","${node.label}",${node.size || 5},"${node.color || "#95a5a6"}",${node.community || 0},${node.betweenness || 0}\n`;
        });
        let edgesCsv = "source,target,weight,label\n";
        analysis.edges.forEach((edge) => {
            edgesCsv += `"${edge.source}","${edge.target}",${edge.weight || 1},"${edge.label || ""}"\n`;
        });
        return { nodes: nodesCsv, edges: edgesCsv };
    }
};
exports.ZettelkastenController = ZettelkastenController;
__decorate([
    (0, common_1.Get)("notes"),
    __param(0, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "getAllNotes", null);
__decorate([
    (0, common_1.Post)("notes"),
    __param(0, (0, common_1.Body)("content")),
    __param(1, (0, common_1.Body)("tags")),
    __param(2, (0, common_1.Body)("password")),
    __param(3, (0, common_1.Body)("createdAt")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "createNote", null);
__decorate([
    (0, common_1.Post)("links"),
    __param(0, (0, common_1.Body)("noteId1")),
    __param(1, (0, common_1.Body)("noteId2")),
    __param(2, (0, common_1.Body)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "createLink", null);
__decorate([
    (0, common_1.Get)("notes/:id/connections"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "getConnections", null);
__decorate([
    (0, common_1.Get)("notes/:id/graph"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "getGraph", null);
__decorate([
    (0, common_1.Get)("notes/:id/suggestions"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "getSuggestions", null);
__decorate([
    (0, common_1.Post)("text/analyze"),
    __param(0, (0, common_1.Body)("text")),
    __param(1, (0, common_1.Body)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "analyzeText", null);
__decorate([
    (0, common_1.Post)("text/analyze-incremental"),
    __param(0, (0, common_1.Body)("text")),
    __param(1, (0, common_1.Body)("previousAnalysis")),
    __param(2, (0, common_1.Body)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "analyzeTextIncremental", null);
__decorate([
    (0, common_1.Post)("import/file"),
    __param(0, (0, common_1.Body)("content")),
    __param(1, (0, common_1.Body)("fileName")),
    __param(2, (0, common_1.Body)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "importFile", null);
__decorate([
    (0, common_1.Post)("graph/export"),
    __param(0, (0, common_1.Body)("text")),
    __param(1, (0, common_1.Body)("format")),
    __param(2, (0, common_1.Body)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "exportGraph", null);
__decorate([
    (0, common_1.Get)("graph/visualization"),
    __param(0, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "getGraphVisualization", null);
__decorate([
    (0, common_1.Get)("graph/stats"),
    __param(0, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "getGraphStats", null);
__decorate([
    (0, common_1.Get)("graph/search"),
    __param(0, (0, common_1.Query)("query")),
    __param(1, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "searchGraph", null);
__decorate([
    (0, common_1.Get)("garden/clusters"),
    __param(0, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "getConceptClusters", null);
__decorate([
    (0, common_1.Get)("garden/paths"),
    __param(0, (0, common_1.Query)("source")),
    __param(1, (0, common_1.Query)("target")),
    __param(2, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "getKnowledgePaths", null);
__decorate([
    (0, common_1.Get)("garden/neighborhood"),
    __param(0, (0, common_1.Query)("concept")),
    __param(1, (0, common_1.Query)("depth")),
    __param(2, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "getConceptNeighborhood", null);
__decorate([
    (0, common_1.Get)("garden/centrality"),
    __param(0, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "getConceptCentrality", null);
__decorate([
    (0, common_1.Get)("garden/gaps"),
    __param(0, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "detectKnowledgeGaps", null);
__decorate([
    (0, common_1.Get)("garden/evolution"),
    __param(0, (0, common_1.Query)("timeframe")),
    __param(1, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "getTemporalEvolution", null);
__decorate([
    (0, common_1.Get)("garden/similar"),
    __param(0, (0, common_1.Query)("concept")),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "findSimilarConcepts", null);
__decorate([
    (0, common_1.Get)("garden/enhanced-visualization"),
    __param(0, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "getEnhancedVisualization", null);
__decorate([
    (0, common_1.Get)("ai/models"),
    __param(0, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "getAvailableModels", null);
__decorate([
    (0, common_1.Get)("ai/models/recommended"),
    __param(0, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "getRecommendedModels", null);
__decorate([
    (0, common_1.Post)("ai/analyze-code"),
    __param(0, (0, common_1.Body)("code")),
    __param(1, (0, common_1.Body)("language")),
    __param(2, (0, common_1.Body)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "analyzeCode", null);
__decorate([
    (0, common_1.Post)("ai/analyze-image"),
    __param(0, (0, common_1.Body)("imageBase64")),
    __param(1, (0, common_1.Body)("query")),
    __param(2, (0, common_1.Body)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "analyzeImage", null);
__decorate([
    (0, common_1.Post)("ai/suggest-concepts"),
    __param(0, (0, common_1.Body)("domain")),
    __param(1, (0, common_1.Body)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "suggestConcepts", null);
__decorate([
    (0, common_1.Get)("ai/insights"),
    __param(0, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "generateInsights", null);
__decorate([
    (0, common_1.Post)("ai/analyze-text-enhanced"),
    __param(0, (0, common_1.Body)("text")),
    __param(1, (0, common_1.Body)("useAI")),
    __param(2, (0, common_1.Body)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "analyzeTextEnhanced", null);
__decorate([
    (0, common_1.Post)("search/create-notes"),
    __param(0, (0, common_1.Body)("query")),
    __param(1, (0, common_1.Body)("context")),
    __param(2, (0, common_1.Body)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "searchAndCreateNotes", null);
__decorate([
    (0, common_1.Post)("notes/:id/enrich"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("domain")),
    __param(2, (0, common_1.Body)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "enrichNote", null);
__decorate([
    (0, common_1.Post)("search/fill-gaps"),
    __param(0, (0, common_1.Body)("gapDescription")),
    __param(1, (0, common_1.Body)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "fillKnowledgeGaps", null);
__decorate([
    (0, common_1.Get)("search/current-info"),
    __param(0, (0, common_1.Query)("concept")),
    __param(1, (0, common_1.Query)("timeframe")),
    __param(2, (0, common_1.Query)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "getCurrentInformation", null);
exports.ZettelkastenController = ZettelkastenController = __decorate([
    (0, common_1.Controller)("zettelkasten"),
    __metadata("design:paramtypes", [zettelkasten_service_1.ZettelkastenService])
], ZettelkastenController);
//# sourceMappingURL=zettelkasten.controller.js.map