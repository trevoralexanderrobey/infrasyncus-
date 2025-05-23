"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZettelkastenModule = void 0;
const common_1 = require("@nestjs/common");
const zettelkasten_service_1 = require("./zettelkasten.service");
const zettelkasten_controller_1 = require("./zettelkasten.controller");
const prisma_service_1 = require("../prisma/prisma.service");
const ollama_service_1 = require("./ollama.service");
let ZettelkastenModule = class ZettelkastenModule {
};
exports.ZettelkastenModule = ZettelkastenModule;
exports.ZettelkastenModule = ZettelkastenModule = __decorate([
    (0, common_1.Module)({
        providers: [zettelkasten_service_1.ZettelkastenService, prisma_service_1.PrismaService, ollama_service_1.OllamaService],
        controllers: [zettelkasten_controller_1.ZettelkastenController],
        exports: [zettelkasten_service_1.ZettelkastenService]
    })
], ZettelkastenModule);
//# sourceMappingURL=zettelkasten.module.js.map