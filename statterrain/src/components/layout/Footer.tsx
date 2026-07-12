import { product } from "@/config/product";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-2 text-xs leading-snug text-slate-500 sm:px-6">
      <p className="font-semibold text-slate-700">{product.name}</p>
      <p>Emergency-care resources and population context for research and planning.</p>
      <p>Data sources: CMS and U.S. Census Bureau</p>
      <p className="font-medium text-slate-600">Research prototype — not for clinical or operational use.</p>
    </footer>
  );
}
