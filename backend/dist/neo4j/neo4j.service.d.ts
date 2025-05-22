import { OnModuleInit } from '@nestjs/common';
import { Session } from 'neo4j-driver';
export declare class Neo4jService implements OnModuleInit {
    private driver;
    constructor();
    onModuleInit(): Promise<void>;
    getSession(): Session;
    close(): Promise<void>;
}
