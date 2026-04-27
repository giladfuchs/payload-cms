import { extractHtmlAssets } from "@/lib/core/utilities";

export default function HtmlEmbedBlock({
  contentHtml,
}: {
  contentHtml: string;
}) {
  const { html, css, js } = extractHtmlAssets(contentHtml);

  return (
    <div>
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}

      {html ? (
        <div
          className="w-full overflow-hidden"
          style={{
            minHeight: "100%",
            marginTop: html.includes("iframe") ? "-2.2rem" : undefined,
          }}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      ) : null}

      {js ? <script dangerouslySetInnerHTML={{ __html: js }} /> : null}
    </div>
  );
}
