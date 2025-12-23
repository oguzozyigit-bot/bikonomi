// app/analyze/page.tsx  (SERVER COMPONENT)
import AnalyzeClient from "./AnalyzeClient";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const sp = await searchParams;
  const url = typeof sp?.url === "string" ? sp.url : "";
  return <AnalyzeClient url={url} />;
}
