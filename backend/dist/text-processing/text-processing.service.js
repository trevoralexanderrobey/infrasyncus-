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
exports.TextProcessingService = void 0;
const common_1 = require("@nestjs/common");
const janusgraph_service_1 = require("../janusgraph/janusgraph.service");
let TextProcessingService = class TextProcessingService {
    constructor(janusGraphService) {
        this.janusGraphService = janusGraphService;
    }
    async processTextToNetwork(text) {
        if (!text || typeof text !== 'string') {
            return { nodes: [], edges: [] };
        }
        const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 2);
        const uniqueWords = [...new Set(words)];
        const nodes = uniqueWords.map((word, i) => ({
            id: `concept-${word}`,
            label: word,
            type: 'concept'
        }));
        const edges = [];
        for (let i = 0; i < words.length - 1; i++) {
            const sourceId = `concept-${words[i]}`;
            const targetId = `concept-${words[i + 1]}`;
            if (uniqueWords.includes(words[i]) && uniqueWords.includes(words[i + 1])) {
                edges.push({
                    source: sourceId,
                    target: targetId,
                    label: 'follows'
                });
            }
        }
        try {
            const vertexMap = new Map();
            for (const node of nodes) {
                try {
                    let vertex = await this.janusGraphService.getVertexByProperty('conceptId', node.id, 'Concept');
                    if (!vertex) {
                        vertex = await this.janusGraphService.createVertex('Concept', {
                            conceptId: node.id,
                            label: node.label,
                            type: node.type
                        });
                    }
                    if (vertex && vertex.id) {
                        vertexMap.set(node.id, vertex.id);
                    }
                }
                catch (error) {
                    console.error(`Error creating vertex for ${node.id}:`, error);
                }
            }
            for (const edge of edges) {
                try {
                    const sourceVertexId = vertexMap.get(edge.source);
                    const targetVertexId = vertexMap.get(edge.target);
                    if (sourceVertexId && targetVertexId) {
                        await this.janusGraphService.createEdge(sourceVertexId, targetVertexId, 'FOLLOWS', { weight: 1, label: edge.label });
                    }
                }
                catch (error) {
                    console.error(`Error creating edge from ${edge.source} to ${edge.target}:`, error);
                }
            }
        }
        catch (error) {
            console.error('Error storing graph in JanusGraph:', error);
        }
        return { nodes, edges };
    }
    async getGraphData() {
        try {
            const vertices = await this.janusGraphService.getVertices('Concept');
            const edges = await this.janusGraphService.getEdges('FOLLOWS');
            const nodes = vertices.map((vertex) => ({
                id: vertex.properties?.conceptId?.[0]?.value || vertex.id,
                label: vertex.properties?.label?.[0]?.value || 'Unknown',
                type: vertex.properties?.type?.[0]?.value || 'concept'
            }));
            const edgeList = edges.map((edge) => ({
                source: edge.outV,
                target: edge.inV,
                label: edge.properties?.label?.[0]?.value || 'follows'
            }));
            return { nodes, edges: edgeList };
        }
        catch (error) {
            console.error('Error retrieving graph data:', error);
            return { nodes: [], edges: [] };
        }
    }
};
exports.TextProcessingService = TextProcessingService;
exports.TextProcessingService = TextProcessingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [janusgraph_service_1.JanusGraphService])
], TextProcessingService);
//# sourceMappingURL=text-processing.service.js.map