import { mythCards } from "@/lib/site-data";

export default function CommunityMythsPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-4xl font-bold">10 Indian Nutrition Myths</h1>
        <p className="mt-3 text-stone-600">Each myth below includes the reality and why it remains believable in Indian households.</p>
      </div>
      <div className="grid gap-4">
        {mythCards.map(([myth, reality, reason]) => (
          <div key={myth} className="rounded-lg border bg-white p-6 shadow-soft">
            <p className="text-lg font-semibold">Myth: {myth}</p>
            <p className="mt-3 text-sm text-stone-700"><strong>Reality:</strong> {reality}</p>
            <p className="mt-2 text-sm text-stone-600"><strong>Why Indians believe this myth:</strong> {reason}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
