import { TextProcessingService } from './text-processing.service';
export declare class TextProcessingController {
    private readonly textProcessingService;
    constructor(textProcessingService: TextProcessingService);
    processText(body: {
        text: string;
    }): Promise<{
        nodes: {
            id: string;
            label: string;
            type: string;
        }[];
        edges: {
            source: string;
            target: string;
            label: string;
        }[];
    }>;
}
