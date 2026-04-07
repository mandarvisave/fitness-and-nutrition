"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, Edit2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useExerciseDiaryStore } from "@/lib/store/useExerciseDiaryStore";

// Minimal Date Helpers
function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function ExerciseDiaryPage() {
  // We use hydration-safe init
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>("");
  
  useEffect(() => {
    setCurrentDate(getTodayStr());
    setMounted(true);
  }, []);

  const { dates, dailyGoalMinutes, weeklyGoalMinutes, removeCardio, removeStrength, updateNotes, copyWorkout } = useExerciseDiaryStore();
  
  const dailyData = useMemo(() => dates[currentDate] || { cardio: [], strength: [], notes: "" }, [dates, currentDate]);

  const dailyCardioMinutes = dailyData.cardio.reduce((acc, curr) => acc + curr.minutes, 0);
  const dailyCardioCalories = dailyData.cardio.reduce((acc, curr) => acc + curr.calories, 0);

  // Simplified weekly logic for demonstration (assuming M-S week block for simplicity, here we just do rolling 7 days)
  const weeklyCardioMinutes = useMemo(() => {
    if (!currentDate) return 0;
    let total = 0;
    for (let i = 0; i < 7; i++) {
        const dStr = addDays(currentDate, -i);
        const data = dates[dStr];
        if (data) {
           total += data.cardio.reduce((acc, curr) => acc + curr.minutes, 0);
        }
    }
    return total;
  }, [dates, currentDate]);

  const [notesDraft, setNotesDraft] = useState(dailyData.notes);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  useEffect(() => {
    setNotesDraft(dailyData.notes);
  }, [dailyData.notes]);

  const handleSaveNotes = () => {
    updateNotes(currentDate, notesDraft);
    setIsEditingNotes(false);
  };

  const handleCopyYesterday = () => {
    const yesterday = addDays(currentDate, -1);
    copyWorkout(yesterday, currentDate);
  };

  if (!mounted || !currentDate) return <div className="flex min-h-screen bg-background"><Sidebar /><main className="flex-1" /></div>;

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-0 pb-24 md:p-6 lg:p-8">
        
        <div className="mx-auto w-full max-w-4xl bg-white shadow-sm border border-gray-200">
          
          {/* Header Navigation */}
          <div className="bg-[#00529b] text-white">
            <div className="flex items-center space-x-6 px-4 py-3 text-sm font-semibold">
              <span className="cursor-pointer font-bold">Exercise Diary</span>
              <span className="cursor-pointer font-normal hover:underline">Database</span>
              <span className="cursor-pointer font-normal hover:underline">My Exercises</span>
              <span className="cursor-pointer font-normal hover:underline">Settings</span>
            </div>
          </div>

          <div className="p-6">
            
            {/* Date Navigation */}
            <div className="flex items-center space-x-3 mb-8 text-[#00529b]">
               <h2 className="text-xl font-bold">Your Exercise Diary for:</h2>
               <div className="flex items-center bg-[#00529b] text-white rounded overflow-hidden shadow">
                 <button onClick={() => setCurrentDate(addDays(currentDate, -1))} className="px-2 py-1.5 hover:bg-[#004280]">
                    <ChevronLeft size={18} />
                 </button>
                 <div className="px-4 font-bold text-[15px] select-none min-w-[200px] text-center">
                    {formatDateLabel(currentDate)}
                 </div>
                 <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="px-2 py-1.5 hover:bg-[#004280]">
                    <ChevronRight size={18} />
                 </button>
               </div>
               <CalendarIcon className="text-gray-500 cursor-pointer hover:text-gray-700" size={24} />
            </div>

            {/* CARDIOVASCULAR SECTION */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                 <h3 className="text-[22px] font-bold text-[#00529b]">Cardiovascular</h3>
              </div>
              <div className="border-t-2 border-[#00529b]">
                 <table className="w-full text-sm">
                   <thead>
                     <tr className="bg-[#00529b] text-white">
                        <th className="py-2 px-3 text-left w-[50%]">Exercise</th>
                        <th className="py-2 px-3 text-center border-l border-[#004280]">Minutes</th>
                        <th className="py-2 px-3 text-center border-l border-[#004280]">Calories Burned</th>
                        <th className="py-2 px-3 w-10"></th>
                     </tr>
                   </thead>
                   <tbody>
                     {dailyData.cardio.map((ex, idx) => (
                       <tr key={ex.id} className={idx % 2 === 0 ? "bg-[#f6f6f6]" : "bg-white"}>
                          <td className="py-2.5 px-3 border-b text-[#00529b]">{ex.name}</td>
                          <td className="py-2.5 px-3 border-b text-center">{ex.minutes}</td>
                          <td className="py-2.5 px-3 border-b text-center">{ex.calories}</td>
                          <td className="py-2.5 px-3 border-b text-center">
                            <button onClick={() => removeCardio(currentDate, ex.id)} className="text-red-500 text-lg hover:text-red-700 font-bold" title="Remove">&times;</button>
                          </td>
                       </tr>
                     ))}
                     {!dailyData.cardio.length && (
                        <tr><td colSpan={4} className="py-4 px-3 border-b text-gray-500 italic">No cardiovascular exercises logged today.</td></tr>
                     )}
                   </tbody>
                 </table>
                 
                 <div className="py-3 text-[13px] font-bold text-[#00529b] flex space-x-3">
                    <Link href={`/workouts/diary/add?type=cardio&date=${currentDate}`} className="hover:underline">Add Exercise</Link>
                    <span className="text-gray-300">|</span>
                    <button onClick={handleCopyYesterday} className="hover:underline">Quick Tools: Copy Yesterday</button>
                 </div>
              </div>

              {/* Totals Box */}
              <div className="mt-2 bg-[#f6f6f6] border text-sm max-w-[50%] ml-auto">
                 <div className="flex py-2 px-4 border-b">
                    <span className="w-1/2 font-bold text-right pr-4 text-black">Daily Total <span className="font-normal text-[#00529b]">/ Goal</span></span>
                    <span className="w-1/4 text-center font-bold">{dailyCardioMinutes} <span className="font-normal text-[#00529b]">/ {dailyGoalMinutes}</span></span>
                    <span className="w-1/4 text-center font-bold">{dailyCardioCalories} <span className="font-normal text-[#00529b]">/ 0</span></span>
                 </div>
                 <div className="flex py-2 px-4">
                    <span className="w-1/2 font-bold text-right pr-4 text-black">Weekly Total <span className="font-normal text-[#00529b]">/ Goal</span></span>
                    <span className="w-1/4 text-center font-bold">{weeklyCardioMinutes} <span className="font-normal text-[#00529b]">/ {weeklyGoalMinutes}</span></span>
                    <span className="w-1/4 text-center font-bold">- <span className="font-normal text-[#00529b]">/ 0</span></span>
                 </div>
              </div>
            </div>

            {/* STRENGTH SECTION */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                 <h3 className="text-[22px] font-bold text-[#00529b]">Strength Training</h3>
              </div>
              <div className="border-t-2 border-[#00529b]">
                 <table className="w-full text-sm">
                   <thead>
                     <tr className="bg-[#00529b] text-white">
                        <th className="py-2 px-3 text-left w-[40%]">Exercise</th>
                        <th className="py-2 px-3 text-center border-l border-[#004280]">Sets</th>
                        <th className="py-2 px-3 text-center border-l border-[#004280]">Reps/Set</th>
                        <th className="py-2 px-3 text-center border-l border-[#004280]">Weight/Set</th>
                        <th className="py-2 px-3 w-10"></th>
                     </tr>
                   </thead>
                   <tbody>
                     {dailyData.strength.map((ex, idx) => (
                       <tr key={ex.id} className={idx % 2 === 0 ? "bg-[#f6f6f6]" : "bg-white"}>
                          <td className="py-2.5 px-3 border-b text-[#00529b]">{ex.name}</td>
                          <td className="py-2.5 px-3 border-b text-center">{ex.sets}</td>
                          <td className="py-2.5 px-3 border-b text-center">{ex.reps}</td>
                          <td className="py-2.5 px-3 border-b text-center">{ex.weight}</td>
                          <td className="py-2.5 px-3 border-b text-center">
                            <button onClick={() => removeStrength(currentDate, ex.id)} className="text-red-500 text-lg hover:text-red-700 font-bold" title="Remove">&times;</button>
                          </td>
                       </tr>
                     ))}
                     {!dailyData.strength.length && (
                        <tr><td colSpan={5} className="py-4 px-3 border-b text-gray-500 italic">No strength training exercises logged today.</td></tr>
                     )}
                   </tbody>
                 </table>
                 
                 <div className="py-3 text-[13px] font-bold text-[#00529b] flex space-x-3">
                    <Link href={`/workouts/diary/add?type=strength&date=${currentDate}`} className="hover:underline">Add Exercise</Link>
                    <span className="text-gray-300">|</span>
                    <button onClick={handleCopyYesterday} className="hover:underline">Quick Tools: Copy Yesterday</button>
                 </div>
              </div>
            </div>

            {/* NOTES SECTION */}
            <div className="mb-8">
               <div className="flex justify-between items-center bg-[#f6f6f6] border border-gray-200 px-3 py-2 text-[#00529b] font-bold text-sm">
                  <span>Today's Exercise Notes</span>
                  <button onClick={() => setIsEditingNotes(true)} className="flex items-center hover:underline text-[12px] font-normal">
                    <Edit2 size={12} className="mr-1" /> Edit Note
                  </button>
               </div>
               <div className="border border-t-0 p-3 min-h-[100px] text-sm">
                  {isEditingNotes ? (
                     <div className="flex flex-col">
                       <textarea 
                          className="w-full border p-2 mb-2 focus:outline-blue-500" 
                          rows={3} 
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                       />
                       <div className="flex space-x-2">
                         <button onClick={handleSaveNotes} className="bg-[#5cb85c] text-white px-3 py-1 text-sm font-bold rounded">Save</button>
                         <button onClick={() => { setIsEditingNotes(false); setNotesDraft(dailyData.notes); }} className="bg-gray-200 text-black px-3 py-1 text-sm font-bold rounded">Cancel</button>
                       </div>
                     </div>
                  ) : (
                     <div className="whitespace-pre-wrap">{dailyData.notes || <span className="text-gray-400 italic"></span>}</div>
                  )}
               </div>
            </div>

            <div className="flex justify-center mt-6">
              <button className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-6 py-2 rounded text-[15px] font-bold shadow-sm" onClick={() => window.print()}>
                 View Full Report (Printable)
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
