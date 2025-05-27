const fetch = require("node-fetch");

async function testWebSearch() {
  console.log("🔍 Testing Chrome-based web search integration...");
  console.log('Query: "what day is today"');

  try {
    const response = await fetch(
      "http://localhost:3000/zettelkasten/search/create-notes",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "what day is today",
          context: "testing simple date query",
          password: process.env.ZETTELKASTEN_PASSWORD || "your_password",
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Web search successful!");
      console.log("\n📊 Results:");
      console.log("- Query optimized to:", data.searchResults.query);
      console.log("- Search results found:", data.searchResults.results.length);
      console.log(
        "- Synthesis:",
        data.searchResults.synthesis.substring(0, 200) + "..."
      );
      console.log(
        "- Key insights:",
        data.searchResults.keyInsights.slice(0, 2)
      );
      console.log("- Created notes:", data.createdNotes.length);

      if (data.createdNotes.length > 0) {
        console.log("\n📝 First created note:");
        console.log(
          "Title:",
          data.createdNotes[0].content.substring(0, 100) + "..."
        );
        console.log("Tags:", JSON.parse(data.createdNotes[0].tags || "[]"));
      }
    } else {
      const errorText = await response.text();
      console.log("❌ API Error:", response.status, response.statusText);
      console.log("Error details:", errorText);
    }
  } catch (error) {
    console.log("❌ Connection error:", error.message);
    console.log("\n💡 To start the backend:");
    console.log("   cd backend && npm run start:dev");
  }
}

// Also test direct Google search
async function testDirectGoogleSearch() {
  console.log("\n🌐 Testing direct Google search...");

  try {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    const response = await fetch(
      "https://www.google.com/search?q=what+day+is+today",
      { headers }
    );
    console.log("✅ Google search status:", response.status);
    console.log(
      "✅ Response size:",
      response.headers.get("content-length") || "Unknown"
    );

    const html = await response.text();
    const hasResults = html.includes("<h3") && html.includes("href=");
    console.log("✅ Contains search results:", hasResults ? "Yes" : "No");
  } catch (error) {
    console.log("❌ Direct Google search failed:", error.message);
  }
}

async function runTests() {
  console.log("🚀 Starting Web Search Integration Tests\n");

  await testDirectGoogleSearch();
  await testWebSearch();

  console.log("\n✨ Tests completed!");
}

runTests();
