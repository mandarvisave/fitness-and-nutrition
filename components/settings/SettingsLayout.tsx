import { Sidebar } from "@/components/layout/Sidebar";
import { SettingsNav } from "@/components/settings/SettingsNav";

export function SettingsLayout({
  currentPath,
  title,
  description,
  children
}: {
  currentPath: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 pb-24 sm:px-6">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-stone-600">{description}</p>
        </div>
        <SettingsNav currentPath={currentPath} />
        {children}
      </main>
    </div>
  );
}
