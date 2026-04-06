import { HiPlus, HiMinus } from "react-icons/hi2";

import type { FaqsBlock as FaqBlockProps } from "@/lib/core/types/payload-types";

import { JsonLd } from "@/components/shared/elements-ssr";
import { generateJsonLdFaq } from "@/lib/seo/jsonld";

export default function FaqBlock({ faqs, title }: FaqBlockProps) {
  if (!faqs?.length) return null;

  return (
    <>
      <JsonLd data={generateJsonLdFaq(faqs, title || "")} />
      <section className="container my-16 w-full max-w-2xl mx-auto">
        <h3 className="mt-1 mb-8 text-2xl font-medium">{title}</h3>

        <div className="divide-y divide-neutral-200 dark:divide-neutral-800 border-t border-neutral-200 dark:border-neutral-800">
          {faqs.map((item, index) => (
            <details key={index} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5">
                <span className="flex-1 text-base font-medium leading-snug text-neutral-900 dark:text-neutral-100">
                  {item.question}
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 transition-colors group-open:bg-neutral-900 dark:group-open:bg-white">
                  <HiPlus className="h-3.5 w-3.5 text-neutral-500 group-open:hidden" />
                  <HiMinus className="hidden h-3.5 w-3.5 text-white dark:text-neutral-900 group-open:block" />
                </span>
              </summary>
              <p className="pb-5 text-[15px] leading-7 text-neutral-500 dark:text-neutral-400 max-w-2xl">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
