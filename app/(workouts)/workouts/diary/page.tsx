"use client";

import React, { useState, useMemo, useEffect, Fragment } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit2, Copy, FileText, Plus, Trash2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useExerciseDiaryStore } from "@/lib/store/useExerciseDiaryStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

  if (!mounted || !currentDate) return <div className="flex min-h-screen bg-stone-50"><Sidebar /><main className="flex-1" /></div>;

  return (
    <div className="flex min-h-screen bg-stone-50 flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200">
             <div>
                <h1 className="text-3xl font-bold tracking-tight text-stone-900">Exercise Diary</h1>
                <p className="text-stone-500 mt-1">Track your cardio and strength workouts over time.</p>
             </div>
             
             <div className="mt-4 sm:mt-0 flex items-center space-x-2 bg-white border border-stone-200 rounded-xl p-1 shadow-sm">
               <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -1))} className="h-8 w-8 text-stone-600">
                  <ChevronLeft size={18} />
               </Button>
               <div className="px-4 text-sm font-semibold text-stone-800 text-center min-w-[220px]">
                  {formatDateLabel(currentDate)}
               </div>
               <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 1))} className="h-8 w-8 text-stone-600">
                  <ChevronRight size={18} />
               </Button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              {/* CARDIOVASCULAR SECTION */}
              <Card className="shadow-sm border-stone-200">
                 <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-xl font-bold text-stone-900">Cardiovascular</CardTitle>
                    <div className="flex space-x-2">
                       <Button variant="outline" size="sm" onClick={handleCopyYesterday} title="Copy Yesterday" className="h-8 shadow-sm">
                           <Copy className="h-4 w-4 mr-2" /> Quick Copy
                       </Button>
                       <Button size="sm" asChild className="h-8 shadow-sm bg-orange-600 hover:bg-orange-700">
                           <Link href={`/workouts/diary/add?type=cardio&date=${currentDate}`}>
                             <Plus className="h-4 w-4 mr-2" /> Add 
                           </Link>
                       </Button>
                    </div>
                 </CardHeader>
                 <CardContent>
                    <div className="rounded-xl border border-stone-200 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-stone-50 text-stone-500 font-medium border-b border-stone-200">
                          <tr>
                             <th className="py-3 px-4 text-left font-medium w-[50%]">Exercise</th>
                             <th className="py-3 px-4 text-center font-medium">Minutes</th>
                             <th className="py-3 px-4 text-center font-medium">Calories</th>
                             <th className="py-3 px-4 w-12 text-center text-transparent">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyData.cardio.map((ex, idx) => (
                            <tr key={ex.id} className="border-b last:border-0 border-stone-100 hover:bg-stone-50/50 transition-colors">
                               <td className="py-3 px-4 text-stone-900 font-medium">{ex.name}</td>
                               <td className="py-3 px-4 text-center text-stone-600">{ex.minutes}</td>
                               <td className="py-3 px-4 text-center text-orange-600 font-medium">{ex.calories}</td>
                               <td className="py-3 px-4 text-center">
                                 <button onClick={() => removeCardio(currentDate, ex.id)} className="text-stone-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                 </button>
                               </td>
                            </tr>
                          ))}
                          {dailyData.cardio.length === 0 && (
                             <tr><td colSpan={4} className="py-8 text-center text-stone-400 text-sm italic">No cardiovascular exercises logged today.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                 </CardContent>
              </Card>

              {/* STRENGTH SECTION */}
              <Card className="shadow-sm border-stone-200">
                 <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-xl font-bold text-stone-900">Strength Training</CardTitle>
                    <div className="flex space-x-2">
                       <Button variant="outline" size="sm" onClick={handleCopyYesterday} title="Copy Yesterday" className="h-8 shadow-sm">
                           <Copy className="h-4 w-4 mr-2" /> Quick Copy
                       </Button>
                       <Button size="sm" asChild className="h-8 shadow-sm bg-orange-600 hover:bg-orange-700">
                           <Link href={`/workouts/diary/add?type=strength&date=${currentDate}`}>
                             <Plus className="h-4 w-4 mr-2" /> Add 
                           </Link>
                       </Button>
                    </div>
                 </CardHeader>
                 <CardContent>
                    <div className="rounded-xl border border-stone-200 overflow-hidden">
                      <table className="w-full text-sm">
                         <thead className="bg-stone-50 text-stone-500 font-medium border-b border-stone-200">
                          <tr>
                             <th className="py-3 px-4 text-left font-medium w-[40%]">Exercise</th>
                             <th className="py-3 px-4 text-center font-medium">Sets</th>
                             <th className="py-3 px-4 text-center font-medium">Volume (lbs)</th>
                             <th className="py-3 px-4 w-12 text-center text-transparent">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyData.strength.map((ex, idx) => (
                            <Fragment key={ex.id}>
                               <tr className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                                  <td className="py-3 px-4 text-stone-900 font-bold">{ex.name}</td>
                                  <td className="py-3 px-4 text-center text-stone-600">{ex.trackingSets?.length || 0}</td>
                                  <td className="py-3 px-4 text-center text-stone-500 text-sm">{ex.trackingSets?.reduce((acc, s) => acc + (s.reps * s.weight), 0).toLocaleString()}</td>
                                  <td className="py-3 px-4 text-center">
                                    <button onClick={() => removeStrength(currentDate, ex.id)} className="text-stone-400 hover:text-red-500 transition-colors">
                                       <Trash2 size={16} />
                                    </button>
                                  </td>
                               </tr>
                               {ex.trackingSets && ex.trackingSets.length > 0 && (
                                   <tr className="border-b last:border-0 border-stone-200 bg-stone-50/30">
                                       <td colSpan={4} className="p-0">
                                           <div className="pl-12 pr-6 py-3 text-sm text-stone-600">
                                               <div className="grid grid-cols-3 gap-4 text-center font-semibold text-stone-400 text-xs uppercase tracking-wider mb-2">
                                                   <div>Set</div><div>Reps</div><div>Weight</div>
                                               </div>
                                               <div className="space-y-1">
                                                 {ex.trackingSets.map((s, i) => (
                                                     <div key={s.id} className="grid grid-cols-3 gap-4 text-center py-1 border-b border-stone-100 last:border-0">
                                                         <div className="font-medium text-stone-500">{i + 1}</div>
                                                         <div className="font-semibold text-stone-800">{s.reps}</div>
                                                         <div className="font-semibold text-stone-800">{s.weight} <span className="text-stone-400 font-normal text-xs ml-1">lbs</span></div>
                                                     </div>
                                                 ))}
                                               </div>
                                           </div>
                                       </td>
                                   </tr>
                               )}
                            </Fragment>
                          ))}
                          {dailyData.strength.length === 0 && (
                             <tr><td colSpan={4} className="py-8 text-center text-stone-400 text-sm italic">No strength training exercises logged today.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                 </CardContent>
              </Card>

            </div>

            <div className="space-y-6">
               
               {/* SIDEBAR WIDGETS */}
               <Card className="shadow-sm border-stone-200">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-lg font-bold text-stone-900">Cardio Goals</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   
                    <div>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-stone-600">Daily Minutes</span>
                        <span className="font-semibold text-stone-900">{dailyCardioMinutes} <span className="text-stone-400">/ {dailyGoalMinutes}</span></span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${Math.min(100, (dailyCardioMinutes / dailyGoalMinutes) * 100)}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-stone-600">Weekly Minutes</span>
                        <span className="font-semibold text-stone-900">{weeklyCardioMinutes} <span className="text-stone-400">/ {weeklyGoalMinutes}</span></span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${Math.min(100, (weeklyCardioMinutes / weeklyGoalMinutes) * 100)}%` }}></div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 mt-2">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-stone-600">Daily Calories Burned</span>
                          <span className="font-bold text-orange-600">{dailyCardioCalories} kcal</span>
                       </div>
                    </div>

                 </CardContent>
               </Card>

               <Card className="shadow-sm border-stone-200">
                 <CardHeader className="pb-3 flex flex-row items-center justify-between">
                   <CardTitle className="text-lg font-bold text-stone-900">Today's Notes</CardTitle>
                   {!isEditingNotes && (
                      <Button variant="ghost" size="icon" onClick={() => setIsEditingNotes(true)} className="h-6 w-6 text-stone-400 hover:text-stone-600">
                         <Edit2 size={14} />
                      </Button>
                   )}
                 </CardHeader>
                 <CardContent>
                    {isEditingNotes ? (
                       <div className="space-y-3">
                         <Textarea 
                            className="w-full min-h-[100px] text-sm resize-none bg-stone-50 border-stone-200 focus-visible:ring-orange-500" 
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            placeholder="How did you feel today?"
                         />
                         <div className="flex space-x-2">
                           <Button onClick={handleSaveNotes} size="sm" className="bg-stone-900 hover:bg-stone-800">Save Note</Button>
                           <Button variant="outline" onClick={() => { setIsEditingNotes(false); setNotesDraft(dailyData.notes); }} size="sm">Cancel</Button>
                         </div>
                       </div>
                    ) : (
                       <div className="min-h-[60px] text-sm text-stone-600 whitespace-pre-wrap bg-stone-50 p-3 rounded-xl border border-stone-100">
                          {dailyData.notes ? dailyData.notes : <span className="italic text-stone-400">No notes written for today. Click the edit icon to add some.</span>}
                       </div>
                    )}
                 </CardContent>
                 <CardFooter className="pt-0">
                    <Button variant="secondary" className="w-full text-stone-600 shadow-none border border-stone-200 bg-white hover:bg-stone-50" onClick={() => window.print()}>
                       <FileText className="h-4 w-4 mr-2" /> View Full Report
                    </Button>
                 </CardFooter>
               </Card>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
