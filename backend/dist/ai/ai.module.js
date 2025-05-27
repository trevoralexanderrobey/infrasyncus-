"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const ollama_service_1 = require("./ollama.service");
const web_search_service_1 = require("./web-search.service");
const zettelkasten_module_1 = require("./zettelkasten.module");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [zettelkasten_module_1.ZettelkastenModule],
        providers: [ollama_service_1.OllamaService, web_search_service_1.WebSearchService],
        exports: [ollama_service_1.OllamaService, web_search_service_1.WebSearchService, zettelkasten_module_1.ZettelkastenModule],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map