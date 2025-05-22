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
    async createNote(content, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new UnauthorizedException('Invalid password');
        }
        return this.zettelkastenService.createAtomicNote(content);
    }
    async createLink(noteId1, noteId2, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new UnauthorizedException('Invalid password');
        }
        return this.zettelkastenService.createBidirectionalLink(noteId1, noteId2);
    }
    async getConnections(noteId, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new UnauthorizedException('Invalid password');
        }
        return this.zettelkastenService.getConnectedNotes(noteId);
    }
    async getGraph(noteId, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new UnauthorizedException('Invalid password');
        }
        return this.zettelkastenService.visualizeKnowledgeGraph(noteId);
    }
    async getSuggestions(noteId, password) {
        if (password !== process.env.ZETTELKASTEN_PASSWORD) {
            throw new UnauthorizedException('Invalid password');
        }
        return this.zettelkastenService.suggestRelatedNotes(noteId);
    }
};
exports.ZettelkastenController = ZettelkastenController;
__decorate([
    (0, common_1.Post)('notes'),
    __param(0, (0, common_1.Body)('content')),
    __param(1, (0, common_1.Body)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "createNote", null);
__decorate([
    (0, common_1.Post)('links'),
    __param(0, (0, common_1.Body)('noteId1')),
    __param(1, (0, common_1.Body)('noteId2')),
    __param(2, (0, common_1.Body)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "createLink", null);
__decorate([
    (0, common_1.Get)('notes/:id/connections'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, Query('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "getConnections", null);
__decorate([
    (0, common_1.Get)('notes/:id/graph'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, Query('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "getGraph", null);
__decorate([
    (0, common_1.Get)('notes/:id/suggestions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, Query('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ZettelkastenController.prototype, "getSuggestions", null);
exports.ZettelkastenController = ZettelkastenController = __decorate([
    (0, common_1.Controller)('zettelkasten'),
    __metadata("design:paramtypes", [zettelkasten_service_1.ZettelkastenService])
], ZettelkastenController);
//# sourceMappingURL=zettelkasten.controller.js.map