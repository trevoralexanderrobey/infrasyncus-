import { JanusGraphService } from '../janusgraph/janusgraph.service';
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
    private readonly janusGraphService;
    constructor(janusGraphService: JanusGraphService);
    processTextToNetwork(text: string): Promise<{
        nodes: Node[];
        edges: Edge[];
    }>;
    getGraphData(): Promise<{
        nodes: Node[];
        edges: Edge[];
    }>;
}
export {};
