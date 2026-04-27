import { Highlight, themes } from "prism-react-renderer";

import { cn } from "@/lib/core/utilities";

export type CodeBlockProps = {
  code: string;
  language: string;
  blockType: "code";
};

export default function CodeBlock({
  className,
  code,
  language,
}: CodeBlockProps & {
  className?: string;
}) {
  if (!code) return null;

  return (
    <div dir="ltr" className={cn(className, "not-prose")}>
      <Highlight code={code} language={language} theme={themes.vsDark}>
        {({ getLineProps, getTokenProps, tokens }) => (
          <pre className="overflow-x-auto rounded border border-border bg-black p-4 text-xs">
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                <span className="mr-4 select-none text-white/25">{i + 1}</span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
