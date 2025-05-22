"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let OllamaService = class OllamaService {
    constructor() {
        this.baseUrl = 'http://localhost:11434';
    }
    async generateText(prompt, model = 'codellama:7b-instruct') {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/api/generate`, {
                model,
                prompt,
                stream: false
            });
            return response.data.response;
        }
        catch (error) {
            throw new Error(`Ollama API error: ${error.message}`);
        }
    }
    async listModels() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/api/tags`);
            return response.data.models;
        }
        catch (error) {
            throw new Error(`Ollama API error: ${error.message}`);
        }
    }
};
exports.OllamaService = OllamaService;
exports.OllamaService = OllamaService = __decorate([
    (0, common_1.Injectable)()
], OllamaService);
//# sourceMappingURL=ollama.service.js.map