export type RichTextDirection = "ltr" | "rtl";

type RichTextNode = {
  type: string;
  version: number;
  [key: string]: unknown;
};

type MakeRichTextOptions = {
  direction?: RichTextDirection;
};

type RichTextListType = "bullet" | "number";

const getDirection = (text: string): RichTextDirection =>
  /[\u0590-\u05ff]/.test(text) ? "rtl" : "ltr";

const makeTextNode = (text: string): RichTextNode => ({
  type: "text",
  detail: 0,
  format: 0,
  mode: "normal",
  style: "",
  text,
  version: 1,
});

const makeParagraph = (
  text: string,
  direction: RichTextDirection,
): RichTextNode => ({
  type: "paragraph",
  children: [makeTextNode(text)],
  direction,
  format: "",
  indent: 0,
  textFormat: 0,
  textStyle: "",
  version: 1,
});

const makeHeading = (
  text: string,
  level: number,
  direction: RichTextDirection,
): RichTextNode => ({
  type: "heading",
  children: [makeTextNode(text)],
  direction,
  format: "",
  indent: 0,
  tag: `h${Math.min(Math.max(level, 1), 4)}`,
  version: 1,
});

const makeList = (
  items: string[],
  direction: RichTextDirection,
  listType: RichTextListType,
): RichTextNode => ({
  type: "list",
  children: items.map((item, index) => ({
    type: "listitem",
    children: [makeTextNode(item)],
    direction,
    format: "",
    indent: 0,
    value: index + 1,
    version: 1,
  })),
  direction,
  format: "",
  indent: 0,
  listType,
  start: 1,
  tag: listType === "number" ? "ol" : "ul",
  version: 1,
});

/**
 * Converts seed text into Payload Lexical rich text.
 *
 * Each non-empty line becomes a paragraph. Markdown-style headings (`#`) and
 * consecutive bullet (`- `) or numbered (`1. `) lines become Lexical nodes.
 */
export function makeRichText(text: string, options: MakeRichTextOptions = {}) {
  const direction = options.direction ?? getDirection(text);
  const children: RichTextNode[] = [];
  let listItems: string[] = [];
  let listType: RichTextListType | null = null;

  const flushList = () => {
    if (listItems.length === 0 || !listType) return;

    children.push(makeList(listItems, direction, listType));
    listItems = [];
    listType = null;
  };

  for (const rawLine of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushList();
      children.push(makeHeading(heading[2], heading[1].length, direction));
      continue;
    }

    const bulletItem = line.match(/^[-*]\s+(.+)$/);
    const numberedItem = line.match(/^\d+[.)]\s+(.+)$/);

    if (bulletItem || numberedItem) {
      const nextListType: RichTextListType = numberedItem ? "number" : "bullet";

      if (listType && listType !== nextListType) flushList();
      listType = nextListType;
      listItems.push((bulletItem?.[1] ?? numberedItem?.[1] ?? "").trim());
      continue;
    }

    flushList();
    children.push(makeParagraph(line, direction));
  }

  flushList();

  return {
    root: {
      type: "root",
      children,
      direction,
      format: "" as const,
      indent: 0,
      version: 1,
    },
  };
}

/** Recursively expands `{ "__richText": "..." }` values in seed fixtures. */
export function hydrateSeedRichText<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => hydrateSeedRichText(item)) as T;
  }

  if (!value || typeof value !== "object") return value;

  const record = value as Record<string, unknown>;
  if (typeof record.__richText === "string") {
    const direction =
      record.direction === "ltr" || record.direction === "rtl"
        ? record.direction
        : undefined;

    return makeRichText(record.__richText, { direction }) as T;
  }

  return Object.fromEntries(
    Object.entries(record).map(([key, item]) => [
      key,
      hydrateSeedRichText(item),
    ]),
  ) as T;
}
