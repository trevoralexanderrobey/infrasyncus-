"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const neo4j_service_1 = require("./neo4j.service");
describe('Neo4jService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [neo4j_service_1.Neo4jService],
        }).compile();
        service = module.get(neo4j_service_1.Neo4jService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('getSession', () => {
        it('should return a session object', () => {
            const session = service.getSession();
            expect(session).toBeDefined();
            expect(typeof session.run).toBe('function');
        });
    });
    describe('close', () => {
        it('should close the driver connection', async () => {
            const mockClose = jest.fn();
            service['driver'] = { close: mockClose };
            await service.close();
            expect(mockClose).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=neo4j.service.spec.js.map