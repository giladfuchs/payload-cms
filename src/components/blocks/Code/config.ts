import type { Block } from "payload";

export const Code: Block = {
  slug: "code",
  interfaceName: "CodeBlock",
  fields: [
    {
      name: "language",
      type: "select",
      defaultValue: "javascript",
      options: [
        { label: "Javascript", value: "javascript" },
        { label: "Typescript", value: "typescript" },
        { label: "Python", value: "python" },
        { label: "Java", value: "java" },
        { label: "C#", value: "csharp" },
        { label: "C++", value: "cpp" },
        { label: "Go", value: "go" },
        { label: "Rust", value: "rust" },
        { label: "PHP", value: "php" },
        { label: "HTML", value: "html" },
        { label: "CSS", value: "css" },
        { label: "JSON", value: "json" },
        { label: "Bash", value: "bash" },
        { label: "Markdown", value: "markdown" },
        { label: "SQL", value: "sql" },
        { label: "YAML", value: "yaml" },
        { label: "TSX", value: "tsx" },
        { label: "JSX", value: "jsx" },
      ],
      required: true,
    },
    {
      name: "code",
      type: "code",
      required: true,
      admin: {
        language: "javascript",
      },
    },
  ],
};
