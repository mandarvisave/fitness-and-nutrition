"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Search, Utensils, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Recipe {
  id: string;
  title: string;
  source: string;
  cuisine: string;
  ingredients: string[];
}

export default function RecipesExplorerPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  
  const [query, setQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Expanded recipe state
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  const fetchRecipes = async (searchQuery: string, searchCuisine: string, searchPage: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
         q: searchQuery,
         cuisine: searchCuisine,
         page: searchPage.toString()
      });
      const res = await fetch(`/api/recipes/search?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRecipes(data.data);
      setTotalPages(data.totalPages);
      if (cuisines.length === 0 && data.cuisines) {
         setCuisines(data.cuisines);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchRecipes(query, selectedCuisine, page);
    }, 300); // debounce API calls
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedCuisine, page]);

  return (
    <div className="flex min-h-screen bg-stone-50 md:flex-row flex-col">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="mx-auto max-w-5xl">
          
          <div className="mb-8 p-6 bg-white rounded-3xl border border-orange-100 shadow-sm">
             <div className="flex items-start gap-4 mb-6">
                <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
                   <Utensils size={28} />
                </div>
                <div>
                   <h1 className="text-3xl font-bold tracking-tight text-stone-900">Recipe Explorer</h1>
                   <p className="text-stone-500 mt-1">Discover thousands of meals sourced from the CulinaryDB dataset. Find exactly what fits your macros.</p>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4 items-center">
                 <div className="relative flex-1 w-full">
                     <Search className="absolute left-3 top-3 text-stone-400" size={18} />
                     <input 
                       className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
                       placeholder="Search by recipe title or ingredient..."
                       value={query}
                       onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                     />
                 </div>
                 <select 
                    className="w-full sm:w-auto bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={selectedCuisine}
                    onChange={(e) => { setSelectedCuisine(e.target.value); setPage(1); }}
                 >
                    <option value="all">All Cuisines</option>
                    {cuisines.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                 </select>
             </div>
          </div>

          {loading && recipes.length === 0 ? (
            <div className="flex justify-center items-center py-20 text-orange-500">
               <Loader2 className="animate-spin" size={40} />
            </div>
          ) : recipes.length === 0 ? (
             <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
                <Info className="mx-auto text-stone-300 mb-3" size={48} />
                <h3 className="text-lg font-semibold text-stone-900">No recipes found</h3>
                <p className="text-stone-500">Try adjusting your filters or search terms.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {recipes.map((recipe) => (
                  <div key={recipe.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                     <div className="p-5 flex-1 relative">
                        <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-widest text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                           {recipe.cuisine || "Generic"}
                        </span>
                        
                        <h3 className="text-lg font-bold text-stone-900 pr-16 mb-2 mt-2 leading-tight">
                            {recipe.title}
                        </h3>
                        
                        <p className="text-xs text-stone-400 capitalize mb-4">Source: {recipe.source.replace(/_/g, " ")}</p>

                        <div className="text-sm text-stone-600 border-t pt-4">
                           <span className="font-semibold text-stone-800">Ingredients ({recipe.ingredients.length}):</span>
                           <p className="line-clamp-2 mt-1 italic opacity-80">
                               {recipe.ingredients.join(", ")}
                           </p>
                        </div>
                     </div>
                     <div className="bg-stone-50 border-t border-stone-100 p-3">
                         <button 
                            onClick={() => setExpandedRecipe(expandedRecipe === recipe.id ? null : recipe.id)}
                            className="w-full text-center text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                         >
                            {expandedRecipe === recipe.id ? "Hide Ingredients" : "View All Ingredients"}
                         </button>
                     </div>
                     {expandedRecipe === recipe.id && (
                         <div className="p-4 bg-stone-900 text-stone-200 text-sm max-h-48 overflow-y-auto custom-scrollbar">
                             <ul className="list-disc pl-4 space-y-1">
                                 {recipe.ingredients.map((ing, i) => (
                                     <li key={i} className="capitalize">{ing}</li>
                                 ))}
                             </ul>
                         </div>
                     )}
                  </div>
               ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 pb-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                     Previous
                  </Button>
                  <span className="text-sm font-medium text-stone-600">Page {page} of {totalPages}</span>
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                     Next
                  </Button>
              </div>
          )}
        </div>
      </main>
    </div>
  );
}
