import { Injectable, Logger } from "@nestjs/common";
import { OllamaService } from "./ollama.service";

export interface WebSearchResult {
  title: string;
  url: string;
  content: string;
  relevanceScore: number;
  concepts: string[];
}

export interface EnhancedSearchResponse {
  query: string;
  results: WebSearchResult[];
  synthesis: string;
  suggestedNotes: string[];
  keyInsights: string[];
  relatedConcepts: string[];
}

@Injectable()
export class WebSearchService {
  private readonly logger = new Logger(WebSearchService.name);
  private readonly chromeUserAgent =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
  private readonly contentReader = "https://r.jina.ai/";

  constructor(private readonly ollamaService: OllamaService) {}

  async searchAndEnhance(
    userQuery: string,
    context?: string
  ): Promise<EnhancedSearchResponse> {
    try {
      // Step 1: Generate optimized search query using qwen2.5:3b
      const optimizedQuery = await this.generateSearchQuery(userQuery, context);

      // Step 2: Perform web search
      const rawResults = await this.performWebSearch(optimizedQuery);

      // Step 3: Process and score results
      const processedResults = await this.processSearchResults(
        rawResults,
        userQuery
      );

      // Step 4: Generate synthesis and insights
      const synthesis = await this.synthesizeResults(
        processedResults,
        userQuery
      );
      const insights = await this.extractKeyInsights(
        processedResults,
        userQuery
      );
      const relatedConcepts = await this.extractRelatedConcepts(
        processedResults
      );
      const suggestedNotes = await this.generateNoteSuggestions(
        processedResults,
        userQuery
      );

      return {
        query: optimizedQuery,
        results: processedResults,
        synthesis,
        suggestedNotes,
        keyInsights: insights,
        relatedConcepts,
      };
    } catch (error) {
      this.logger.error("Web search failed:", error);
      return this.getFallbackResponse(userQuery);
    }
  }

  async enrichNote(
    noteContent: string,
    domain?: string
  ): Promise<EnhancedSearchResponse> {
    const enrichmentQuery = await this.generateEnrichmentQuery(
      noteContent,
      domain
    );
    return this.searchAndEnhance(enrichmentQuery, noteContent);
  }

  async fillKnowledgeGap(
    gapDescription: string,
    existingConcepts: string[]
  ): Promise<EnhancedSearchResponse> {
    const gapQuery = await this.generateGapFillingQuery(
      gapDescription,
      existingConcepts
    );
    return this.searchAndEnhance(
      gapQuery,
      `Existing concepts: ${existingConcepts.join(", ")}`
    );
  }

  async findCurrentInformation(
    concept: string,
    timeframe: "recent" | "latest" = "recent"
  ): Promise<EnhancedSearchResponse> {
    const timeQuery = await this.generateTimeBasedQuery(concept, timeframe);
    return this.searchAndEnhance(timeQuery);
  }

  private async generateSearchQuery(
    userQuery: string,
    context?: string
  ): Promise<string> {
    const prompt = `You are an expert research assistant. Generate a precise, effective web search query for the following request.

User Query: ${userQuery}
${context ? `Context: ${context}` : ""}

Guidelines:
- Make it specific and searchable
- Include key terms and concepts
- Consider recent information needs
- Optimize for search engines

Respond with ONLY the search query, nothing else.`;

    try {
      return await this.ollamaService.generateText(prompt, "qwen2.5:3b");
    } catch (error) {
      this.logger.warn("Query generation failed, using original query");
      return userQuery;
    }
  }

  private async generateEnrichmentQuery(
    noteContent: string,
    domain?: string
  ): Promise<string> {
    const prompt = `Generate a search query to find additional information that would enrich this note:

Note Content: ${noteContent}
${domain ? `Domain: ${domain}` : ""}

Focus on finding:
- Supporting evidence
- Related research
- Current developments
- Additional perspectives

Generate a specific search query:`;

    try {
      return await this.ollamaService.generateText(prompt, "qwen2.5:3b");
    } catch (error) {
      return `research about ${noteContent.substring(0, 100)}`;
    }
  }

  private async generateGapFillingQuery(
    gapDescription: string,
    existingConcepts: string[]
  ): Promise<string> {
    const prompt = `Generate a search query to fill this knowledge gap:

Gap: ${gapDescription}
Existing Concepts: ${existingConcepts.join(", ")}

Find information that bridges concepts and fills missing knowledge.

Search query:`;

    try {
      return await this.ollamaService.generateText(prompt, "qwen2.5:3b");
    } catch (error) {
      return gapDescription;
    }
  }

  private async generateTimeBasedQuery(
    concept: string,
    timeframe: string
  ): Promise<string> {
    const timeModifier =
      timeframe === "recent" ? "recent developments" : "latest news";
    return `${timeModifier} ${concept} 2024 2025`;
  }

  private async performWebSearch(query: string): Promise<any[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Use Google search with Chrome user-agent
      const response = await fetch(
        `https://www.google.com/search?q=${encodeURIComponent(query)}&num=10`,
        {
          signal: controller.signal,
          headers: {
            "User-Agent": this.chromeUserAgent,
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
            "Upgrade-Insecure-Requests": "1",
          },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Google search error: ${response.statusText}`);
      }

      const html = await response.text();
      return this.parseGoogleResults(html);
    } catch (error) {
      this.logger.error("Google search failed:", error);
      return [];
    }
  }

  private parseGoogleResults(html: string): any[] {
    const results: any[] = [];

    try {
      // Multiple parsing strategies for different Google layouts

      // Strategy 1: Standard Google result links with /url?q= redirect
      const linkPattern1 =
        /<a[^>]*href="\/url\?q=([^&"]*)"[^>]*>.*?<h3[^>]*>(.*?)<\/h3>/gs;
      this.extractResultsWithPattern(html, linkPattern1, results, "redirect");

      // Strategy 2: Direct links in h3 tags
      if (results.length === 0) {
        const linkPattern2 =
          /<h3[^>]*><a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a><\/h3>/gs;
        this.extractResultsWithPattern(html, linkPattern2, results, "direct");
      }

      // Strategy 3: Look for any links with meaningful text
      if (results.length === 0) {
        const linkPattern3 = /<a[^>]*href="(https?:\/\/[^"]*)"[^>]*>([^<]+)</gs;
        this.extractResultsWithPattern(html, linkPattern3, results, "general");
      }

      // Strategy 4: Generate fallback results if no results found
      if (results.length === 0) {
        this.logger.warn("No Google results parsed, generating fallback");
        return this.generateFallbackResults();
      }

      this.logger.log(`Google search found ${results.length} results`);
      return results.slice(0, 8); // Limit to 8 results
    } catch (error) {
      this.logger.error("Error parsing Google results:", error);
      return this.generateFallbackResults();
    }
  }

  private extractResultsWithPattern(
    html: string,
    pattern: RegExp,
    results: any[],
    type: string
  ): void {
    let match;
    let count = 0;

    while ((match = pattern.exec(html)) !== null && count < 8) {
      let url = match[1];
      const title = this.cleanHtmlText(match[2]);

      // Clean Google redirect URLs for redirect type
      if (type === "redirect" && url.startsWith("/url?q=")) {
        const urlMatch = url.match(/\/url\?q=([^&]*)/);
        url = urlMatch ? decodeURIComponent(urlMatch[1]) : url;
      } else if (type === "redirect") {
        url = decodeURIComponent(url);
      }

      // Filter out Google URLs and ensure valid URLs
      if (
        url &&
        title &&
        !url.includes("google.com") &&
        !url.includes("youtube.com/googleads") &&
        url.startsWith("http") &&
        title.length > 5
      ) {
        results.push({
          title: title,
          url: url,
          content: title, // Use title as initial content
        });
        count++;
      }
    }
  }

  private generateFallbackResults(): any[] {
    // Generate fallback results when Google parsing fails
    const fallbackResults = [
      {
        title: "Current Date and Time Information",
        url: "https://time.is/",
        content: "Real-time date and time information from around the world",
      },
      {
        title: "Wikipedia - Today",
        url: "https://en.wikipedia.org/wiki/Wikipedia:On_this_day/Today",
        content: "Historical events and notable facts about today's date",
      },
      {
        title: "Calendar and Date Resources",
        url: "https://www.timeanddate.com/today/",
        content: "Comprehensive calendar and date-related information",
      },
    ];

    this.logger.log(`Generated ${fallbackResults.length} fallback results`);
    return fallbackResults;
  }

  private cleanHtmlText(text: string): string {
    return text
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .trim();
  }

  private async processSearchResults(
    rawResults: any[],
    userQuery: string
  ): Promise<WebSearchResult[]> {
    const processedResults: WebSearchResult[] = [];

    for (const result of rawResults.slice(0, 5)) {
      // Process top 5 results
      try {
        const content = await this.fetchPageContent(result.url);
        const concepts = await this.extractConcepts(content);
        const relevanceScore = await this.calculateRelevance(
          content,
          userQuery
        );

        processedResults.push({
          title: result.title || "No title",
          url: result.url,
          content: content.substring(0, 1000), // Limit content length
          relevanceScore,
          concepts,
        });
      } catch (error) {
        this.logger.warn(`Failed to process result: ${result.url}`);
      }
    }

    return processedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private async fetchPageContent(url: string): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${this.contentReader}${url}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Content fetch failed: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      this.logger.warn(`Content fetch failed for ${url}`);
      return "Content unavailable";
    }
  }

  private async extractConcepts(content: string): Promise<string[]> {
    const prompt = `Extract 3-5 key concepts from this content. Return only the concepts separated by commas:

Content: ${content.substring(0, 500)}

Concepts:`;

    try {
      const response = await this.ollamaService.generateText(
        prompt,
        "qwen2.5:3b"
      );
      return response
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
        .slice(0, 5);
    } catch (error) {
      return ["web content", "information"];
    }
  }

  private async calculateRelevance(
    content: string,
    query: string
  ): Promise<number> {
    // Simple relevance scoring based on keyword matching
    const queryWords = query.toLowerCase().split(" ");
    const contentWords = content.toLowerCase().split(" ");

    let matches = 0;
    queryWords.forEach((word) => {
      if (contentWords.includes(word)) matches++;
    });

    return Math.min(matches / queryWords.length, 1.0);
  }

  private async synthesizeResults(
    results: WebSearchResult[],
    userQuery: string
  ): Promise<string> {
    const combinedContent = results
      .map((r) => `${r.title}: ${r.content.substring(0, 200)}`)
      .join("\n\n");

    const prompt = `Based on these search results about "${userQuery}", provide a comprehensive synthesis:

Results:
${combinedContent}

Create a clear, concise synthesis that:
- Answers the original query
- Highlights key findings
- Notes any conflicting information
- Provides actionable insights

Synthesis:`;

    try {
      return await this.ollamaService.generateText(prompt, "qwen2.5:3b");
    } catch (error) {
      return "Synthesis unavailable - please review individual results.";
    }
  }

  private async extractKeyInsights(
    results: WebSearchResult[],
    userQuery: string
  ): Promise<string[]> {
    const topResults = results.slice(0, 3);
    const insights: string[] = [];

    for (const result of topResults) {
      const prompt = `Extract 1-2 key insights from this content related to "${userQuery}":

Content: ${result.content}

Key insights:`;

      try {
        const response = await this.ollamaService.generateText(
          prompt,
          "qwen2.5:3b"
        );
        const resultInsights = response
          .split("\n")
          .filter((line) => line.trim().length > 0);
        insights.push(...resultInsights.slice(0, 2));
      } catch (error) {
        // Skip if insight extraction fails
      }
    }

    return insights.slice(0, 5); // Return top 5 insights
  }

  private async extractRelatedConcepts(
    results: WebSearchResult[]
  ): Promise<string[]> {
    const allConcepts = results.flatMap((r) => r.concepts);
    const conceptCounts = new Map<string, number>();

    allConcepts.forEach((concept) => {
      conceptCounts.set(concept, (conceptCounts.get(concept) || 0) + 1);
    });

    return Array.from(conceptCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([concept]) => concept);
  }

  private async generateNoteSuggestions(
    results: WebSearchResult[],
    userQuery: string
  ): Promise<string[]> {
    const prompt = `Based on these search results about "${userQuery}", suggest 3-5 atomic notes that should be created for a Zettelkasten system:

Results: ${results.map((r) => r.title).join(", ")}

Each suggestion should be:
- Atomic (one concept per note)
- Specific and actionable
- Connected to the research

Note suggestions:`;

    try {
      const response = await this.ollamaService.generateText(
        prompt,
        "qwen2.5:3b"
      );
      return response
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .slice(0, 5);
    } catch (error) {
      return [
        `Research findings on ${userQuery}`,
        `Key insights about ${userQuery}`,
      ];
    }
  }

  private getFallbackResponse(userQuery: string): EnhancedSearchResponse {
    return {
      query: userQuery,
      results: [],
      synthesis: "Web search temporarily unavailable. Please try again later.",
      suggestedNotes: [`Manual research needed: ${userQuery}`],
      keyInsights: ["Web search service is currently unavailable"],
      relatedConcepts: ["research", "information gathering"],
    };
  }
}
