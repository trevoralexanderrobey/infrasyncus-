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
const neo4j_service_1 = require("../neo4j/neo4j.service");
let TextProcessingService = class TextProcessingService {
    constructor(neo4jService) {
        this.neo4jService = neo4jService;
    }
    async processTextToNetwork(text) {
        const words = text.toLowerCase().split(/\s+/);
        const uniqueWords = [...new Set(words)];
        const nodes = uniqueWords.map((word, i) => ({
            id: `node-${i}`,
            label: word,
            type: 'concept'
        }));
        const edges = [];
        for (let i = 0; i < words.length - 1; i++) {
            const sourceIndex = uniqueWords.indexOf(words[i]);
            const targetIndex = uniqueWords.indexOf(words[i + 1]);
            if (sourceIndex !== -1 && targetIndex !== -1) {
                edges.push({
                    source: `node-${sourceIndex}`,
                    target: `node-${targetIndex}`,
                    label: 'related'
                });
            }
        }
        const session = this.neo4jService.getSession();
        try {
            await session.writeTransaction(async (tx) => {
                for (const node of nodes) {
                    await tx.run('MERGE (n:Concept {id: $id, label: $label, type: $type})', node);
                }
                for (const edge of edges) {
                    await tx.run('MATCH (a:Concept {id: $source}), (b:Concept {id: $target}) MERGE (a)-[r:RELATED]->(b)', edge);
                }
            });
        }
        finally {
            await session.close();
        }
        return { nodes, edges };
    }
};
exports.TextProcessingService = TextProcessingService;
exports.TextProcessingService = TextProcessingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [neo4j_service_1.Neo4jService])
], TextProcessingService);
//# sourceMappingURL=text-processing.service.js.map