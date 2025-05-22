"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextProcessingModule = void 0;
const common_1 = require("@nestjs/common");
const text_processing_service_1 = require("./text-processing.service");
const text_processing_controller_1 = require("./text-processing.controller");
const neo4j_module_1 = require("../neo4j/neo4j.module");
let TextProcessingModule = class TextProcessingModule {
};
exports.TextProcessingModule = TextProcessingModule;
exports.TextProcessingModule = TextProcessingModule = __decorate([
    (0, common_1.Module)({
        imports: [neo4j_module_1.Neo4jModule],
        controllers: [text_processing_controller_1.TextProcessingController],
        providers: [text_processing_service_1.TextProcessingService]
    })
], TextProcessingModule);
//# sourceMappingURL=text-processing.module.js.map