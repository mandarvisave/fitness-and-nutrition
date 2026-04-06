export default function CheckoutPage({ params }: { params: { plan: string } }) {
  return <main className="mx-auto max-w-3xl px-4 py-10"><div className="rounded-lg border bg-white p-6 shadow-soft">Razorpay checkout for the <span className="font-semibold capitalize">{params.plan}</span> plan with INR billing and India-only payment methods.</div></main>;
}
