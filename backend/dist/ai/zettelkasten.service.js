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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZettelkastenService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ollama_service_1 = require("./ollama.service");
let ZettelkastenService = class ZettelkastenService {
    constructor(prisma, ollamaService) {
        this.prisma = prisma;
        this.ollamaService = ollamaService;
    }
    async getAllNotes() {
        return this.prisma.note.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    async createAtomicNote(content, tags = [], createdAt) {
        const noteData = {
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
    async createBidirectionalLink(noteId1, noteId2) {
        return this.prisma.link.create({
            data: {
                sourceNoteId: noteId1,
                targetNoteId: noteId2,
            }
        });
    }
    async getConnectedNotes(noteId) {
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
    async visualizeKnowledgeGraph(noteId) {
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
        const connectedNoteIds = new Set();
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
    async analyzeTextNetwork(text) {
        const processedText = this.preprocessText(text);
        const words = this.extractWords(processedText);
        const nGrams = this.generateNGrams(words, 4);
        const { nodes, edges } = this.buildNetwork(words, nGrams);
        const communities = this.detectCommunities(nodes, edges);
        const topicClusters = this.extractTopics(nodes, communities);
        const contentGaps = this.identifyContentGaps(nodes, edges, communities);
        const keyTerms = this.extractKeyTerms(nodes);
        const diversity = this.calculateDiversity(communities);
        const metrics = {
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
    async getAvailableAIModels() {
        return this.ollamaService.getAvailableModels();
    }
    async getRecommendedModels() {
        return this.ollamaService.getRecommendedModels();
    }
    async analyzeCodeWithAI(code, language) {
        const analysis = await this.ollamaService.analyzeCode(code, language);
        const textAnalysis = await this.analyzeTextNetwork(analysis.explanation);
        return {
            ...analysis,
            network: textAnalysis,
            aiEnhanced: true
        };
    }
    async analyzeImageWithAI(imageBase64, query) {
        const analysis = await this.ollamaService.analyzeImage(imageBase64, query);
        const combinedText = `${analysis.textContent} ${analysis.concepts.join(' ')} ${analysis.reasoning}`;
        const textAnalysis = await this.analyzeTextNetwork(combinedText);
        return {
            ...analysis,
            network: textAnalysis,
            aiEnhanced: true,
            multimodal: true
        };
    }
    async generateConceptSuggestions(domain) {
        const notes = await this.getAllNotes();
        const existingConcepts = notes.map(note => note.content.substring(0, 100).replace(/[^\w\s]/g, ' ')).slice(0, 20);
        const suggestions = await this.ollamaService.generateConceptSuggestions(existingConcepts, domain);
        return {
            suggestions,
            domain: domain || 'general',
            basedOn: existingConcepts.length
        };
    }
    async generateKnowledgeInsights() {
        const notes = await this.getAllNotes();
        const links = await this.prisma.link.findMany();
        const concepts = notes.map(note => note.content.substring(0, 50));
        const relationships = links.map(link => ({ source: link.sourceNoteId, target: link.targetNoteId }));
        const aiInsights = await this.ollamaService.generateKnowledgeInsights(concepts, relationships);
        const conceptSuggestions = await this.ollamaService.generateConceptSuggestions(concepts.slice(0, 10), 'knowledge management');
        const insights = await this.ollamaService.generateKnowledgeInsights(concepts.slice(0, 15), relationships.slice(0, 20));
        return {
            aiInsights,
            structuralInsights: [
                `Network has ${concepts.length} concepts and ${relationships.length} connections`,
                'Consider adding cross-domain connections',
                'Look for isolated concept clusters'
            ],
            suggestions: conceptSuggestions,
            timestamp: new Date().toISOString()
        };
    }
    async analyzeTextWithAI(text, useAI = true) {
        const networkAnalysis = await this.analyzeTextNetwork(text);
        if (!useAI) {
            return {
                ...networkAnalysis,
                aiEnhanced: false
            };
        }
        try {
            const response = await this.ollamaService.generateText(`Analyze this text for key concepts and relationships:\n\n${text}`);
            const aiConcepts = response.split(/[,\n]/)
                .map(c => c.trim())
                .filter(c => c.length > 2)
                .slice(0, 10);
            return {
                ...networkAnalysis,
                aiConcepts,
                aiInsights: [response.substring(0, 200)],
                aiEnhanced: true
            };
        }
        catch (error) {
            console.error('AI analysis failed, using base analysis:', error);
            return {
                ...networkAnalysis,
                aiEnhanced: false,
                error: 'AI analysis unavailable'
            };
        }
    }
    async suggestRelatedNotes(noteId) {
        const note = await this.prisma.note.findUnique({
            where: { id: noteId }
        });
        if (!note)
            return [];
        try {
            const suggestions = await this.ollamaService.generateConceptSuggestions([note.content.substring(0, 100)]);
            return suggestions.slice(0, 5);
        }
        catch (error) {
            console.error('Error generating suggestions:', error);
            return ['Related concept 1', 'Related concept 2', 'Related concept 3'];
        }
    }
    async analyzeTextIncremental(text, previousAnalysis) {
        return this.analyzeTextNetwork(text);
    }
    async importFromFile(content, fileName) {
        const importedNotes = [];
        if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
            const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
            for (const paragraph of paragraphs) {
                if (paragraph.trim().length > 10) {
                    const note = await this.createAtomicNote(paragraph.trim(), [`imported:${fileName}`]);
                    importedNotes.push(note);
                }
            }
        }
        else if (fileName.endsWith('.csv')) {
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
    async getGraphVisualization() {
        const notes = await this.getAllNotes();
        const links = await this.prisma.link.findMany();
        return {
            nodes: notes.map(note => ({
                id: note.id,
                label: note.content.substring(0, 50),
                content: note.content
            })),
            edges: links.map(link => ({
                source: link.sourceNoteId,
                target: link.targetNoteId
            }))
        };
    }
    async getGraphStats() {
        const notes = await this.getAllNotes();
        const links = await this.prisma.link.findMany();
        return {
            nodeCount: notes.length,
            edgeCount: links.length,
            density: links.length / Math.max(1, notes.length * (notes.length - 1) / 2),
            lastUpdated: new Date().toISOString()
        };
    }
    async searchGraphNodes(query) {
        const notes = await this.prisma.note.findMany({
            where: {
                content: {
                    contains: query
                }
            }
        });
        return notes.map(note => ({
            id: note.id,
            content: note.content,
            relevance: note.content.toLowerCase().includes(query.toLowerCase()) ? 1 : 0.5
        }));
    }
    async getConceptClusters() {
        const notes = await this.getAllNotes();
        const text = notes.map(n => n.content).join(' ');
        const analysis = await this.analyzeTextNetwork(text);
        return analysis.topics.map((topic, index) => ({
            id: index,
            concepts: topic,
            size: topic.length
        }));
    }
    async getKnowledgePaths(source, target) {
        return [{
                path: [source, target],
                distance: 1,
                strength: 0.5
            }];
    }
    async getConceptNeighborhood(concept, depth = 2) {
        const notes = await this.searchGraphNodes(concept);
        return {
            center: concept,
            neighbors: notes.slice(0, 10),
            depth: depth
        };
    }
    async getConceptCentrality() {
        const notes = await this.getAllNotes();
        const links = await this.prisma.link.findMany();
        const centrality = new Map();
        links.forEach(link => {
            centrality.set(link.sourceNoteId, (centrality.get(link.sourceNoteId) || 0) + 1);
            centrality.set(link.targetNoteId, (centrality.get(link.targetNoteId) || 0) + 1);
        });
        return notes.map(note => ({
            id: note.id,
            content: note.content.substring(0, 50),
            centrality: centrality.get(note.id) || 0
        })).sort((a, b) => b.centrality - a.centrality);
    }
    async detectKnowledgeGaps() {
        const notes = await this.getAllNotes();
        const links = await this.prisma.link.findMany();
        const connectedNodes = new Set();
        links.forEach(link => {
            connectedNodes.add(link.sourceNoteId);
            connectedNodes.add(link.targetNoteId);
        });
        const isolatedNodes = notes.filter(note => !connectedNodes.has(note.id));
        return [{
                type: 'isolated_concepts',
                count: isolatedNodes.length,
                examples: isolatedNodes.slice(0, 5).map(n => n.content.substring(0, 50))
            }];
    }
    async getTemporalEvolution(timeframe = 'week') {
        const notes = await this.prisma.note.findMany({
            orderBy: { createdAt: 'asc' }
        });
        return notes.map(note => ({
            date: note.createdAt,
            concepts: [note.content.substring(0, 30)],
            growth: 1
        }));
    }
    async findSimilarConcepts(concept, limit = 5) {
        const notes = await this.searchGraphNodes(concept);
        return notes.slice(0, limit);
    }
    async getEnhancedVisualizationData() {
        const graph = await this.getGraphVisualization();
        const stats = await this.getGraphStats();
        return {
            ...graph,
            stats,
            layout: 'force-directed',
            enhanced: true
        };
    }
    preprocessText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
    extractWords(text) {
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
            'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
        ]);
        return text.split(' ')
            .filter(word => word.length > 2 && !stopWords.has(word))
            .slice(0, 200);
    }
    generateNGrams(words, n) {
        const nGrams = [];
        for (let i = 0; i <= words.length - n; i++) {
            nGrams.push(words.slice(i, i + n));
        }
        return nGrams;
    }
    buildNetwork(words, nGrams) {
        const wordFrequency = new Map();
        const connections = new Map();
        words.forEach(word => {
            wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
        });
        nGrams.forEach(gram => {
            for (let i = 0; i < gram.length - 1; i++) {
                const word1 = gram[i];
                const word2 = gram[i + 1];
                if (!connections.has(word1)) {
                    connections.set(word1, new Map());
                }
                const word1Connections = connections.get(word1);
                word1Connections.set(word2, (word1Connections.get(word2) || 0) + 1);
            }
        });
        const nodes = Array.from(wordFrequency.entries())
            .filter(([word, freq]) => freq > 1)
            .map(([word, freq], index) => ({
            id: word,
            label: word,
            frequency: freq,
            centrality: this.calculateCentrality(word, connections),
            group: index % 5,
            color: this.getRandomColor()
        }));
        const edges = [];
        connections.forEach((targets, source) => {
            targets.forEach((weight, target) => {
                if (wordFrequency.has(source) && wordFrequency.has(target) && weight > 1) {
                    edges.push({
                        source,
                        target,
                        weight,
                        type: 'textual'
                    });
                }
            });
        });
        return { nodes, edges };
    }
    calculateCentrality(word, connections) {
        const outgoing = connections.get(word)?.size || 0;
        const incoming = Array.from(connections.values())
            .reduce((count, targets) => count + (targets.has(word) ? 1 : 0), 0);
        return outgoing + incoming;
    }
    detectCommunities(nodes, edges) {
        const communities = new Map();
        const nodeConnections = new Map();
        edges.forEach(edge => {
            if (!nodeConnections.has(edge.source)) {
                nodeConnections.set(edge.source, new Set());
            }
            if (!nodeConnections.has(edge.target)) {
                nodeConnections.set(edge.target, new Set());
            }
            nodeConnections.get(edge.source).add(edge.target);
            nodeConnections.get(edge.target).add(edge.source);
        });
        let communityId = 0;
        const visited = new Set();
        nodes.forEach(node => {
            if (!visited.has(node.id)) {
                this.assignCommunity(node.id, communityId, communities, nodeConnections, visited);
                communityId++;
            }
        });
        return communities;
    }
    assignCommunity(nodeId, communityId, communities, nodeConnections, visited) {
        if (visited.has(nodeId))
            return;
        visited.add(nodeId);
        communities.set(nodeId, communityId);
        const neighbors = nodeConnections.get(nodeId) || new Set();
        neighbors.forEach(neighbor => {
            if (!visited.has(neighbor)) {
                this.assignCommunity(neighbor, communityId, communities, nodeConnections, visited);
            }
        });
    }
    extractTopics(nodes, communities) {
        const topics = [];
        const communityGroups = new Map();
        communities.forEach((communityId, nodeId) => {
            if (!communityGroups.has(communityId)) {
                communityGroups.set(communityId, []);
            }
            communityGroups.get(communityId).push(nodeId);
        });
        communityGroups.forEach(group => {
            topics.push(group.slice(0, 8));
        });
        return topics;
    }
    identifyContentGaps(nodes, edges, communities) {
        const gaps = [];
        const connectedNodes = new Set();
        edges.forEach(edge => {
            connectedNodes.add(edge.source);
            connectedNodes.add(edge.target);
        });
        const isolatedNodes = nodes.filter(node => !connectedNodes.has(node.id));
        if (isolatedNodes.length > 0) {
            gaps.push(`${isolatedNodes.length} isolated concepts need connections`);
        }
        const communityGroups = new Map();
        communities.forEach(communityId => {
            communityGroups.set(communityId, (communityGroups.get(communityId) || 0) + 1);
        });
        const smallCommunities = Array.from(communityGroups.entries())
            .filter(([_, size]) => size < 3);
        if (smallCommunities.length > 0) {
            gaps.push(`${smallCommunities.length} topic clusters are underdeveloped`);
        }
        return gaps;
    }
    extractKeyTerms(nodes) {
        return nodes
            .sort((a, b) => (b.frequency + b.centrality) - (a.frequency + a.centrality))
            .slice(0, 10)
            .map(node => node.label);
    }
    calculateDiversity(communities) {
        const communityGroups = new Map();
        communities.forEach(communityId => {
            communityGroups.set(communityId, (communityGroups.get(communityId) || 0) + 1);
        });
        const totalNodes = communities.size;
        if (totalNodes === 0)
            return 0;
        const entropy = Array.from(communityGroups.values())
            .map(size => {
            const p = size / totalNodes;
            return -p * Math.log2(p);
        })
            .reduce((sum, h) => sum + h, 0);
        return entropy / Math.log2(Math.max(1, communityGroups.size));
    }
    async generateInsights(topics, contentGaps) {
        const insights = [];
        insights.push(`Identified ${topics.length} main topic clusters`);
        if (contentGaps.length > 0) {
            insights.push(`Found ${contentGaps.length} content gaps to address`);
        }
        const topTopics = topics.slice(0, 3).map(topic => topic.slice(0, 3).join(', '));
        if (topTopics.length > 0) {
            insights.push(`Main topics: ${topTopics.join('; ')}`);
        }
        return insights;
    }
    getRandomColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
};
exports.ZettelkastenService = ZettelkastenService;
exports.ZettelkastenService = ZettelkastenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ollama_service_1.OllamaService])
], ZettelkastenService);
//# sourceMappingURL=zettelkasten.service.js.map