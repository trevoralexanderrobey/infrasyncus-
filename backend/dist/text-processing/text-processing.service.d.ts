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
export declare class TextProcessingService {
    private readonly neo4jService;
    constructor(neo4jService: Neo4jService);
    processTextToNetwork(text: string): Promise<{
        nodes: Node[];
        edges: Edge[];
    }>;
}
export {};
