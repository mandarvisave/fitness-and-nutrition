import { testimonials } from "@/lib/site-data";

export function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Testimonials</p>
        <h2 className="mt-2 text-3xl font-bold">Families that moved from chaos to consistency.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <div key={testimonial.name} className="rounded-lg border bg-white p-6 shadow-soft">
            <p className="text-sm leading-6 text-stone-600">&ldquo;{testimonial.quote}&rdquo;</p>
            <div className="mt-6">
              <div className="font-semibold">{testimonial.name}</div>
              <div className="text-sm text-stone-500">{testimonial.city}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
