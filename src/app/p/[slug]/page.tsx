// src/app/p/[slug]/page.tsx
import CheckClient from "./ui";

type Params = { slug: string };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const urlRaw = sp.url;
  const url = Array.isArray(urlRaw) ? urlRaw[0] : urlRaw || "";

  return <CheckClient slug={slug} url={url} />;
}
