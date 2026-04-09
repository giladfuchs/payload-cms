import PageTemplate, { generateMetadata } from "./[slug]/page";

export const dynamic = "force-static";
export const revalidate = false;

export default PageTemplate;

export { generateMetadata };
