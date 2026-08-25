import { Sparkles } from "lucide-react";

const categories = [
  "Ceremony",
  "Haldi",
  "Mehendi",
  "Reception",
  "Family",
  "Party",
];

export default function CategoriesSection() {
  return (
    <section className="mt-8 px-5">
      <div className="mb-5 flex items-center gap-2">
        <Sparkles className="text-amber-500" size={22} />
        <h2 className="text-xl font-bold">Categories</h2>
      </div>

      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
}