import { redirect } from "next/navigation";

type SP = { decision?: string; url?: string; rating?: string };

export default async function DemoRedirectPage(props: { searchParams: Promise<SP> | SP }) {
  const sp = await Promise.resolve(props.searchParams);

  const url = sp.url ?? "https://example.com";

  const rating =
    sp.rating ??
    (sp.decision === "ALINMAZ" ? "3.4" : sp.decision === "DİKKAT" ? "3.8" : "4.7");

  redirect(`/check?url=${encodeURIComponent(url)}&rating=${encodeURIComponent(rating)}`);
}
