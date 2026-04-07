"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { useExerciseDiaryStore } from "@/lib/store/useExerciseDiaryStore";
import { cardioDatabase, strengthDatabase, calculateCardioCalories } from "@/lib/data/exerciseDatabase";

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

  // Load recent entries safely
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
  // Form overrides for checked items (minutes/calories for cardio, sets/reps/weight for strength)
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  const handleSearch = () => {
    setHasSearched(true);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    if (type === "cardio") {
       setSearchResults(cardioDatabase.filter(e => e.name.toLowerCase().includes(q)));
    } else {
       setSearchResults(strengthDatabase.filter(e => e.name.toLowerCase().includes(q)));
    }
  };

  const handleAddChecked = () => {
    let addedCount = 0;
    
    // Add from recent list
    recentEntries.forEach((entry, idx) => {
      const key = `recent-${idx}`;
      if (checkedItems[key]) {
        const edits = editValues[key] || {};
        if (type === "cardio") {
           addCardio(date, { 
              name: entry.name, 
              minutes: Number(edits.minutes || entry.minutes || 30), 
              calories: Number(edits.calories || entry.calories || calculateCardioCalories(entry.name, 30)) 
           });
        } else {
           addStrength(date, {
              name: entry.name,
              sets: Number(edits.sets || entry.sets || 3),
              reps: Number(edits.reps || entry.reps || 10),
              weight: Number(edits.weight || entry.weight || 0)
           });
        }
        addedCount++;
      }
    });

    // Add from search results
    searchResults.forEach((entry, idx) => {
      const key = `search-${idx}`;
      if (checkedItems[key]) {
        const edits = editValues[key] || {};
        if (type === "cardio") {
           const mins = Number(edits.minutes || 30);
           addCardio(date, { 
              name: entry.name, 
              minutes: mins, 
              calories: Number(edits.calories || calculateCardioCalories(entry.name, mins)) 
           });
        } else {
           addStrength(date, {
              name: entry.name,
              sets: Number(edits.sets || entry.defaultSets || 3),
              reps: Number(edits.reps || entry.defaultReps || 10),
              weight: Number(edits.weight || 0)
           });
        }
        addedCount++;
      }
    });

    if (addedCount > 0) {
       router.push("/workouts/diary");
    }
  };

  const handleValueChange = (key: string, field: string, value: string) => {
    setEditValues(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
    // Auto-check if they type
    if (!checkedItems[key]) {
      setCheckedItems(prev => ({ ...prev, [key]: true }));
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

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-0 pb-24 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-4xl bg-white shadow-sm border border-gray-200">
          
          <div className="bg-[#00529b] text-white">
            <div className="flex items-center space-x-6 px-4 py-3 text-sm font-semibold">
              <Link href="/workouts/diary" className="cursor-pointer font-bold hover:underline">Exercise Diary</Link>
              <span className="cursor-pointer font-normal hover:underline">Database</span>
              <span className="cursor-pointer font-normal hover:underline">My Exercises</span>
              <span className="cursor-pointer font-normal hover:underline">Settings</span>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-bold text-[#00529b] mb-6 tracking-tight">Add Exercise</h2>

            <div className="mb-8">
               <label className="font-bold text-sm text-[#333] block mb-2">Search our exercise database by name:</label>
               <div className="flex space-x-2">
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                   className="flex-1 border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#00529b]" 
                 />
                 <button onClick={handleSearch} className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-6 font-bold rounded shadow-sm text-sm shrink-0">
                    Search
                 </button>
               </div>
            </div>

            {hasSearched && searchResults.length > 0 && (
              <div className="mb-10">
                <h3 className="font-bold text-[#00529b] mb-3">Search Results:</h3>
                <div className="border border-gray-200">
                  {searchResults.map((entry, idx) => {
                    const key = `search-${idx}`;
                    return (
                      <div key={key} className={`flex items-center p-2 text-sm border-b ${idx % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'}`}>
                        <input type="checkbox" className="mr-3" checked={!!checkedItems[key]} onChange={(e) => setCheckedItems(prev => ({...prev, [key]: e.target.checked}))} />
                        <span className="flex-1 text-[#00529b] font-medium">{entry.name}</span>
                        {type === "cardio" ? (
                          <div className="flex space-x-4 items-center">
                            <span>Minutes: <input type="number" className="border w-16 px-1 ml-1" value={editValues[key]?.minutes || 30} onChange={e => handleValueChange(key, 'minutes', e.target.value)} /></span>
                            <span>Calories: <input type="number" className="border w-16 px-1 ml-1" value={editValues[key]?.calories || calculateCardioCalories(entry.name, parseInt(editValues[key]?.minutes || 30))} onChange={e => handleValueChange(key, 'calories', e.target.value)} /></span>
                          </div>
                        ) : (
                          <div className="flex space-x-4 items-center">
                            <span>Sets: <input type="number" className="border w-12 px-1 ml-1" value={editValues[key]?.sets || entry.defaultSets} onChange={e => handleValueChange(key, 'sets', e.target.value)} /></span>
                            <span>Reps: <input type="number" className="border w-12 px-1 ml-1" value={editValues[key]?.reps || entry.defaultReps} onChange={e => handleValueChange(key, 'reps', e.target.value)} /></span>
                            <span>Weight: <input type="number" className="border w-12 px-1 ml-1" value={editValues[key]?.weight || 0} onChange={e => handleValueChange(key, 'weight', e.target.value)} /></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3">
                   <button onClick={handleAddChecked} className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-4 py-1.5 font-bold rounded shadow-sm text-sm">Add Checked</button>
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-4">
                 <p className="font-bold text-sm text-[#333]">
                   Or, add your most recently used {type === "strength" ? "strength training" : "cardio"} exercises.
                 </p>
              </div>

              {displayEntries.length === 0 ? (
                <div className="bg-[#f6f6f6] border border-gray-200 p-6 text-sm text-gray-600">
                   <p className="mb-4">You have not added any {type === "strength" ? "strength training" : "cardio"} exercises yet.</p>
                   <p><strong>TIP:</strong> As you add entries to your exercise diary, the exercises you've performed most recently will appear in this list so that you can quickly add them to your diary.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-end mb-2">
                    <button onClick={handleAddChecked} className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-4 py-1.5 font-bold rounded shadow-sm text-sm">Add Checked</button>
                    <div className="text-[11px] font-bold flex items-center space-x-2">
                      <span>Sort by:</span>
                      <label className="flex items-center space-x-1 cursor-pointer font-normal"><input type="radio" name="sort" checked={sortBy === "recent"} onChange={() => setSortBy("recent")}/> <span>Most Recent</span></label>
                      <label className="flex items-center space-x-1 cursor-pointer font-normal"><input type="radio" name="sort" checked={sortBy === "name"} onChange={() => setSortBy("name")}/> <span>Name</span></label>
                    </div>
                  </div>

                  <div className="border border-gray-200 mb-3">
                    {displayEntries.map((entry, idx) => {
                      const key = `recent-${idx}`;
                      return (
                        <div key={key} className={`flex items-center p-2 text-sm border-b ${idx % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'}`}>
                          <input type="checkbox" className="mr-3" checked={!!checkedItems[key]} onChange={(e) => setCheckedItems(prev => ({...prev, [key]: e.target.checked}))} />
                           <span className="flex-1 text-gray-600 font-medium">{entry.name}</span>
                          {type === "cardio" ? (
                            <div className="flex space-x-4 items-center">
                              <span className="text-gray-500 text-xs">Minutes: <input type="number" className="border w-12 px-1 ml-1 text-black text-sm" value={editValues[key]?.minutes || entry.minutes} onChange={e => handleValueChange(key, 'minutes', e.target.value)} /></span>
                              <span className="text-gray-500 text-xs">Calories: <input type="number" className="border w-12 px-1 ml-1 text-black text-sm" value={editValues[key]?.calories || entry.calories} onChange={e => handleValueChange(key, 'calories', e.target.value)} /></span>
                            </div>
                          ) : (
                            <div className="flex space-x-4 items-center gap-1">
                              <span className="text-gray-500 text-xs">Sets: <input type="number" className="border w-10 px-1 text-black text-sm" value={editValues[key]?.sets || entry.sets} onChange={e => handleValueChange(key, 'sets', e.target.value)} /></span>
                              <span className="text-gray-500 text-xs">Reps: <input type="number" className="border w-10 px-1 text-black text-sm" value={editValues[key]?.reps || entry.reps} onChange={e => handleValueChange(key, 'reps', e.target.value)} /></span>
                              <span className="text-gray-500 text-xs">Weight: <input type="number" className="border w-10 px-1 text-black text-sm" value={editValues[key]?.weight || entry.weight} onChange={e => handleValueChange(key, 'weight', e.target.value)} /></span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <button onClick={handleAddChecked} className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-4 py-1.5 font-bold rounded shadow-sm text-sm">Add Checked</button>
                </>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
