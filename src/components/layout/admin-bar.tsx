import { draftMode } from "next/headers";

import { AdminBarWrapper } from "@/components/shared/wrappers";

export default async function AdminBar() {
  const { isEnabled } = await draftMode();

  return <AdminBarWrapper adminBarProps={{ preview: isEnabled }} />;
}
