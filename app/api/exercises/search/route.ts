import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  if (!q || q.trim() === "") {
    return NextResponse.json({ results: [] });
  }

  try {
    // We use language=2 for English. Let's hit the main exercise endpoint which brings back detailed stats.
    const wgerUrl = `https://wger.de/api/v2/exercise/?language=2&limit=20&name=${encodeURIComponent(q.trim())}`;
    
    const response = await fetch(wgerUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      next: { revalidate: 3600 } // Cache results for an hour to reduce api calls
    });

    if (!response.ok) {
        throw new Error(`WGER API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Fallback: If 0 results, try hitting their specific search endpoint
    if (data.results && data.results.length === 0) {
        const searchUrl = `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(q.trim())}`;
        const searchResponse = await fetch(searchUrl, {
            headers: { "Accept": "application/json" }
        });
        if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            // The search endpoint returns: { suggestions: [ { data: { id, name, category, image } } ] }
            if (searchData.suggestions && searchData.suggestions.length > 0) {
                 const mapped = searchData.suggestions.map((s: any) => ({
                    id: s.data.id,
                    name: s.data.name,
                    category: s.data.category,
                    // WGER does not return Sets/Reps, so we attach defaults for our UI
                    defaultSets: 3,
                    defaultReps: 10
                 }));
                 return NextResponse.json({ results: mapped });
            }
        }
    }

    const mappedResults = data.results.map((ex: any) => ({
       id: ex.id,
       name: ex.name,
       category: ex.category || "Unknown",
       defaultSets: 3,
       defaultReps: 10
    }));

    return NextResponse.json({ results: mappedResults });

  } catch (error) {
    console.error("Exercise API Error:", error);
    return NextResponse.json({ results: [], error: "Failed to fetch from WGER API" }, { status: 500 });
  }
}
