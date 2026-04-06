import { ExerciseCard } from "@/components/workouts/ExerciseCard";
import { WorkoutTimer } from "@/components/workouts/WorkoutTimer";

export default function MorningRoutinePage() {
  const exercises = [
    ["March in Place", "Warm-up - 60 seconds. Stand tall, swing arms naturally, and gradually raise intensity."],
    ["Cat-Cow Flow", "Warm-up - 60 seconds. Move slowly through spinal flexion and extension to wake up the back."],
    ["World's Greatest Stretch", "Warm-up - 60 seconds alternating sides to open hips, hamstrings, and upper back."],
    ["Bodyweight Squats", "Main set - 2 rounds x 12 reps. Sit back into the hips, keep chest tall, and drive through the floor."],
    ["Incline Push-ups", "Main set - 2 rounds x 10 reps using a wall or kitchen counter. Keep body in one line."],
    ["Reverse Lunges", "Main set - 2 rounds x 8 reps per leg. Step back softly and keep front knee tracking over toes."],
    ["Glute Bridge", "Main set - 2 rounds x 15 reps. Squeeze glutes at the top for one full second."],
    ["Plank Shoulder Taps", "Main set - 2 rounds x 20 alternating taps. Keep hips stable and ribs tucked."],
    ["Child's Pose Breathing", "Cool-down - 60 seconds. Inhale through the nose for 4, exhale slowly for 6."],
    ["Standing Hamstring Sweep", "Cool-down - 60 seconds. Sweep hands toward toes with a soft knee bend and tall posture."]
  ];

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">No Excuse 15-Minute Morning Routine</h1>
          <p className="text-stone-600">Built for busy parents: 3 minutes to wake up the joints, 10 minutes of full-body training, and 2 minutes to reset before the day begins. No equipment needed.</p>
          <div className="grid gap-4">
            {exercises.map(([name, details]) => <ExerciseCard key={name} name={name} details={details} />)}
          </div>
        </div>
        <div className="space-y-4">
          <WorkoutTimer />
          <div className="rounded-lg border bg-white p-5 shadow-soft text-sm text-stone-600">
            <h2 className="text-lg font-semibold text-stone-900">Routine structure</h2>
            <p className="mt-3"><strong>Warm-up:</strong> 3 minutes</p>
            <p className="mt-2"><strong>Main block:</strong> 10 minutes. Move exercise to exercise with 20 seconds rest.</p>
            <p className="mt-2"><strong>Cool-down:</strong> 2 minutes</p>
          </div>
        </div>
      </div>
    </main>
  );
}
