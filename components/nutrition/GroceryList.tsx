const items = ["Paneer", "Curd", "Moong dal", "Poha", "Seasonal fruits", "Peanuts", "Brown rice"];

export function GroceryList() {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-soft">
      <h3 className="text-lg font-semibold">Weekly Grocery List</h3>
      <ul className="mt-3 space-y-2 text-sm text-stone-600">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
