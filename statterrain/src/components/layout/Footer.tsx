import { product } from "@/config/product";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-3 text-xs leading-relaxed text-slate-500 sm:px-6">
      <p>{product.disclaimer}</p>
      <p className="mt-1 font-medium text-slate-600">{product.syntheticDataNotice}</p>
      <p className="mt-1 text-[11px] text-slate-400">{product.status}</p>
    </footer>
  );
}
