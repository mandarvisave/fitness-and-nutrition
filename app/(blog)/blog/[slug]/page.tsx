export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  return <main className="mx-auto max-w-4xl px-4 py-10"><article className="rounded-lg border bg-white p-6 shadow-soft"><h1 className="text-3xl font-bold capitalize">{params.slug.replace(/-/g, " ")}</h1><p className="mt-4 text-stone-600">Article content for SEO-driven family health education.</p></article></main>;
}
