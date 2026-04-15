"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Check, Info, Plus, Trash2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useExerciseDiaryStore } from "@/lib/store/useExerciseDiaryStore";
import { cardioDatabase, strengthDatabase, calculateCardioCalories } from "@/lib/data/exerciseDatabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from "uuid";

// We keep a separate type for UI state of sets
type BuilderSet = { id: string; reps: number; weight: number };

export default function AddExercisePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  const type = searchParams?.get("type") === "strength" ? "strength" : "cardio";
  const date = searchParams?.get("date") || new Date().toISOString().split("T")[0];

  const { addCardio, addStrength, getRecentCardio, getRecentStrength } = useExerciseDiaryStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  
  useEffect(() => {
    setMounted(true);
    if (type === "cardio") {
      setRecentEntries(getRecentCardio());
    } else {
      setRecentEntries(getRecentStrength());
    }
  }, [type, getRecentCardio, getRecentStrength]);

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  // For Cardio: { key: { minutes: 30, calories: 300 } }
  // For Strength: { key: [ { id: uuid, reps: 10, weight: 0 }, ... ] }
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  const handleSearch = async () => {
    setHasSearched(true);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
        const res = await fetch(`/api/exercises/search?q=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setSearchResults(data.results || []);
    } catch (err) {
        console.error(err);
        setSearchResults([]);
    }
  };

  const getCardioEdits = (key: string, entryName: string) => {
     const defaults = { minutes: 30, calories: calculateCardioCalories(entryName, 30) };
     return editValues[key] || defaults;
  };

  const getStrengthEdits = (key: string): BuilderSet[] => {
     const existing = editValues[key];
     if (Array.isArray(existing)) return existing;
     // Defaults to 1 empty set for WGER UX
     return [{ id: uuidv4(), reps: 10, weight: 0 }];
  };

  const initEditValuesForKeyIfMissing = (key: string, entryName: string) => {
      setEditValues(prev => {
          if (prev[key]) return prev;
          if (type === "cardio") {
              return { ...prev, [key]: { minutes: 30, calories: calculateCardioCalories(entryName, 30) } };
          } else {
              return { ...prev, [key]: [{ id: uuidv4(), reps: 10, weight: 0 }] };
          }
      });
  };

  const handleCardioChange = (key: string, field: string, val: string) => {
      setEditValues(prev => ({
         ...prev,
         [key]: { ...(prev[key] || { minutes: 30, calories: 0 }), [field]: Number(val) }
      }));
  };

  const handleStrengthChange = (key: string, setId: string, field: 'reps' | 'weight', val: string) => {
      setEditValues(prev => {
         const sets = getStrengthEdits(key);
         const updated = sets.map(s => s.id === setId ? { ...s, [field]: Number(val) } : s);
         return { ...prev, [key]: updated };
      });
  };

  const handleAddSet = (key: string, e: React.MouseEvent) => {
     e.stopPropagation();
     setEditValues(prev => {
         const sets = getStrengthEdits(key);
         const lastObj = sets.length > 0 ? sets[sets.length - 1] : { reps: 10, weight: 0 };
         return { ...prev, [key]: [...sets, { id: uuidv4(), reps: lastObj.reps, weight: lastObj.weight }] };
     });
     if (!checkedItems[key]) setCheckedItems(prev => ({...prev, [key]: true}));
  };

  const handleRemoveSet = (key: string, setId: string, e: React.MouseEvent) => {
     e.stopPropagation();
     setEditValues(prev => {
         const sets = getStrengthEdits(key).filter(s => s.id !== setId);
         return { ...prev, [key]: sets.length > 0 ? sets : [{ id: uuidv4(), reps: 10, weight: 0 }] };
     });
  };

  const handleToggleCheck = (key: string, entryName: string, state: boolean) => {
      setCheckedItems(prev => ({...prev, [key]: state}));
      if (state) initEditValuesForKeyIfMissing(key, entryName);
  };

  const handleAddChecked = () => {
    let addedCount = 0;
    
    const processEntry = (entry: any, key: string) => {
      if (!checkedItems[key]) return;
      if (type === "cardio") {
         const edits = getCardioEdits(key, entry.name);
         addCardio(date, { name: entry.name, minutes: edits.minutes, calories: edits.calories });
      } else {
         const sets = getStrengthEdits(key).map(s => ({ id: uuidv4(), reps: s.reps, weight: s.weight }));
         addStrength(date, { name: entry.name, trackingSets: sets });
      }
      addedCount++;
    };

    recentEntries.forEach((entry, idx) => processEntry(entry, `recent-${idx}`));
    searchResults.forEach((entry, idx) => processEntry(entry, `search-${idx}`));

    if (addedCount > 0) {
       router.push("/workouts/diary");
    }
  };

  const displayEntries = useMemo(() => {
    let list = [...recentEntries];
    if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [recentEntries, sortBy]);

  if (!mounted) return <div />;

  const renderCardioEdits = (key: string, entryName: string) => {
      const vals = getCardioEdits(key, entryName);
      return (
         <div className="flex space-x-3 items-center">
            <div className="flex flex-col">
                <span className="text-xs text-stone-500 font-medium mb-1">Mins</span>
                <Input type="number" className="w-20 h-9" value={vals.minutes} onChange={e => { handleCardioChange(key, 'minutes', e.target.value); if(!checkedItems[key]) handleToggleCheck(key, entryName, true); }} />
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-stone-500 font-medium mb-1">Kcal</span>
                <Input type="number" className="w-20 h-9" value={vals.calories} onChange={e => { handleCardioChange(key, 'calories', e.target.value); if(!checkedItems[key]) handleToggleCheck(key, entryName, true); }} />
            </div>
         </div>
      );
  };

  const renderStrengthEdits = (key: string, entryName: string) => {
      const sets = getStrengthEdits(key);
      const isChecked = checkedItems[key];
      
      // If not checked, we show a simplified single row for cleanliness, otherwise we show the builder
      if (!isChecked) {
          return (
             <div className="flex space-x-3 items-center opacity-50 pointer-events-none">
                 <div className="flex flex-col"><span className="text-xs text-stone-500 mb-1">Sets</span><Input disabled className="w-16 h-9" value="1"/></div>
                 <div className="flex flex-col"><span className="text-xs text-stone-500 mb-1">Reps</span><Input disabled className="w-16 h-9" value="10"/></div>
                 <div className="flex flex-col"><span className="text-xs text-stone-500 mb-1">Lbs</span><Input disabled className="w-16 h-9" value="0"/></div>
             </div>
          );
      }

      return (
         <div className="flex flex-col space-y-2 mt-4 sm:mt-0 w-full animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center bg-stone-100 rounded-t-lg px-3 py-2 border border-stone-200 border-b-0">
               <span className="text-xs font-bold text-stone-600 tracking-wider uppercase">Set Builder</span>
            </div>
            <div className="border border-stone-200 rounded-b-xl rounded-tr-xl overflow-hidden bg-white">
                <table className="w-full text-sm">
                   <thead className="bg-stone-50 border-b border-stone-200">
                     <tr>
                        <th className="py-2 px-3 text-center text-xs text-stone-500 font-semibold w-16">Set</th>
                        <th className="py-2 px-3 text-center text-xs text-stone-500 font-semibold w-24">Reps</th>
                        <th className="py-2 px-3 text-center text-xs text-stone-500 font-semibold w-24">Lbs</th>
                        <th className="py-2 px-3 text-center w-12"></th>
                     </tr>
                   </thead>
                   <tbody>
                      {sets.map((s, i) => (
                         <tr key={s.id} className="border-b last:border-0 border-stone-100">
                            <td className="py-2 px-3 text-center font-medium text-stone-600">{i + 1}</td>
                            <td className="py-2 px-3"><Input type="number" className="w-full h-8 text-center" value={s.reps} onChange={e => handleStrengthChange(key, s.id, 'reps', e.target.value)} /></td>
                            <td className="py-2 px-3"><Input type="number" className="w-full h-8 text-center" value={s.weight} onChange={e => handleStrengthChange(key, s.id, 'weight', e.target.value)} /></td>
                            <td className="py-2 px-3 text-center">
                               {sets.length > 1 && (
                                   <button onClick={(e) => handleRemoveSet(key, s.id, e)} className="text-stone-400 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                               )}
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
                <div className="p-2 border-t border-stone-100 bg-stone-50 flex justify-center">
                   <Button variant="ghost" size="sm" onClick={(e) => handleAddSet(key, e)} className="h-8 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                      <Plus size={14} className="mr-1"/> Add Set
                   </Button>
                </div>
            </div>
         </div>
      );
  };

  return (
    <div className="flex min-h-screen bg-stone-50 flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-6 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          
          <div className="flex items-center space-x-4 pb-6 border-b border-stone-100">
             <Button variant="ghost" asChild className="rounded-full text-stone-500 hover:text-stone-900 bg-stone-50 h-10 w-10 p-0">
               <Link href="/workouts/diary" className="flex items-center justify-center">
                  <ArrowLeft size={20} />
               </Link>
             </Button>
             <div>
                <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Add {type === 'cardio' ? 'Cardio' : 'Strength'} Exercise</h1>
                <p className="text-sm text-stone-500 mt-1">Search the live WGER database or select recent.</p>
             </div>
          </div>

          <div className="flex space-x-3 pt-2">
              <div className="relative flex-1">
                 <Search className="absolute left-3 top-2.5 text-stone-400" size={18} />
                 <Input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                   placeholder="Search exercise database by name..." 
                   className="pl-10 h-10 w-full bg-stone-50 border-stone-200 rounded-xl focus-visible:ring-orange-500"
                 />
              </div>
              <Button onClick={handleSearch} className="h-10 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white shadow-sm">
                 Search
              </Button>
          </div>

          {hasSearched && searchResults.length > 0 && (
            <div className="pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <h3 className="font-semibold text-stone-900 mb-3 text-lg flex justify-between items-center">
                 Search Results
                 <Button onClick={handleAddChecked} size="sm" className="bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm">
                    Add Selected to Diary
                 </Button>
              </h3>
              <div className="space-y-3">
                {searchResults.map((entry, idx) => {
                  const key = `search-${idx}`;
                  const isChecked = !!checkedItems[key];
                  return (
                    <div key={key} className={`flex flex-col sm:flex-row p-4 rounded-2xl border transition-colors ${isChecked ? 'bg-orange-50/30 border-orange-200 shadow-sm' : 'bg-white border-stone-200 hover:border-stone-300'}`}>
                      <div className="flex items-center flex-1 mb-3 sm:mb-0 cursor-pointer" onClick={() => handleToggleCheck(key, entry.name, !isChecked)}>
                         <div className={`w-6 h-6 mr-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-orange-600 border-orange-600' : 'border-stone-300 bg-white'}`}>
                            {isChecked && <Check size={16} className="text-white" />}
                         </div>
                         <div>
                            <span className="text-stone-900 font-bold block">{entry.name}</span>
                            <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">{entry.category || "General"}</span>
                         </div>
                      </div>
                      <div className="sm:w-[60%] sm:pl-4">
                        {type === "cardio" ? renderCardioEdits(key, entry.name) : renderStrengthEdits(key, entry.name)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-end">
                 <Button onClick={handleAddChecked} className="bg-orange-600 hover:bg-orange-700 rounded-xl px-8 shadow-sm h-11">
                    Add Selected to Diary
                 </Button>
              </div>
            </div>
          )}

          <div className="pt-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-4 border-b border-stone-100 pb-2">
               <h3 className="font-semibold text-stone-900 text-lg">Recent Exercises</h3>
               {displayEntries.length > 0 && (
                 <div className="text-xs font-medium text-stone-500 flex items-center space-x-3 mt-3 sm:mt-0 bg-stone-100 px-3 py-1.5 rounded-full">
                   <span>Sort:</span>
                   <label className="flex items-center space-x-1 cursor-pointer"><input type="radio" name="sort" className="accent-stone-500" checked={sortBy === "recent"} onChange={() => setSortBy("recent")}/> <span>Recent</span></label>
                   <label className="flex items-center space-x-1 cursor-pointer"><input type="radio" name="sort" className="accent-stone-500" checked={sortBy === "name"} onChange={() => setSortBy("name")}/> <span>A-Z</span></label>
                 </div>
               )}
            </div>

            {displayEntries.length === 0 ? (
              <div className="bg-stone-50 rounded-2xl border border-stone-200 border-dashed p-8 text-center flex flex-col items-center">
                 <div className="bg-white p-3 rounded-full mb-3 text-stone-300">
                    <Info size={24} />
                 </div>
                 <p className="text-stone-600 font-medium mb-1">No recent exercises found</p>
                 <p className="text-sm text-stone-500 max-w-sm">As you log exercises to your diary, your most frequently used items will appear here for fast logging.</p>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <div className="space-y-3 mb-4">
                  {displayEntries.map((entry, idx) => {
                    const key = `recent-${idx}`;
                    const isChecked = !!checkedItems[key];
                    return (
                       <div key={key} className={`flex flex-col sm:flex-row p-4 rounded-2xl border transition-colors ${isChecked ? 'bg-orange-50/30 border-orange-200 shadow-sm' : 'bg-white border-stone-200 hover:border-stone-300'}`}>
                         <div className="flex items-center flex-1 mb-3 sm:mb-0 cursor-pointer" onClick={() => handleToggleCheck(key, entry.name, !isChecked)}>
                            <div className={`w-6 h-6 mr-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-orange-600 border-orange-600' : 'border-stone-300 bg-white'}`}>
                               {isChecked && <Check size={16} className="text-white" />}
                            </div>
                            <span className="text-stone-900 font-bold block">{entry.name}</span>
                         </div>
                         <div className="sm:w-[60%] sm:pl-4">
                           {type === "cardio" ? renderCardioEdits(key, entry.name) : renderStrengthEdits(key, entry.name)}
                         </div>
                       </div>
                    );
                  })}
                </div>
                <div className="flex justify-end">
                   <Button onClick={handleAddChecked} className="bg-orange-600 hover:bg-orange-700 rounded-xl px-8 shadow-sm h-11">
                      Add Selected to Diary
                   </Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
