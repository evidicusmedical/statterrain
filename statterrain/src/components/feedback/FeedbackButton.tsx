import { product } from "@/config/product";

export function FeedbackButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={product.feedback.href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex whitespace-nowrap rounded-md border border-terrain-600 px-3 py-2 text-sm font-semibold text-terrain-700 hover:bg-terrain-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terrain-600 ${className}`}
    >
      Send Feedback
    </a>
  );
}
