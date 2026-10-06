import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrayerContent } from "@/components/prayer-content";
import { SampleNotice } from "@/components/sample-notice";
import { getPrayer, prayers } from "@/content/prayers";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return prayers.map((prayer) => ({ slug: prayer.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const prayer = getPrayer((await params).slug);
  if (!prayer) notFound();
  return { title: prayer.title.ja };
}

export default async function PrayerPage({ params }: Props) {
  const prayer = getPrayer((await params).slug);
  if (!prayer) notFound();

  return (
    <>
      <Link href="/prayers" className="text-link">← 祈りの一覧</Link>
      <div className="page-heading">
        <h1>{prayer.title.ja}</h1>
        <p className="reading">{prayer.title.reading}</p>
        <p className="translation" lang="vi">{prayer.title.vi}</p>
      </div>
      {prayer.status === "sample" && <SampleNotice />}
      <article className="card prayer-body" aria-label={prayer.title.ja}>
        <PrayerContent prayer={prayer} />
      </article>
    </>
  );
}
