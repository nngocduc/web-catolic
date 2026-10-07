import type { Metadata } from "next";
import Link from "next/link";
import { SampleNotice } from "@/components/sample-notice";
import { ContentStatus } from "@/components/content-metadata";
import { prayers } from "@/content/prayers";
import type { Prayer } from "@/content/types";

export const metadata: Metadata = { title: "祈り" };
const categories: Record<Prayer["category"], string> = { basic: "基本の祈り", daily: "日々の祈り", seasonal: "季節の祈り", rosary: "ロザリオ", marian: "聖母の祈り", faith: "信仰と回心の祈り" };

export default function PrayersPage() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow" lang="vi">Lời cầu nguyện</p>
        <h1>祈り</h1>
        <p className="intro">日本語の祈りを読み、その意味にふれる。</p>
      </div>
      {prayers.some((prayer) => prayer.status === "sample") && <SampleNotice />}
      <ul className="prayer-list">
        {prayers.map((prayer) => (
          <li key={prayer.id}>
            <Link href={`/prayers/${prayer.id}`} className="card destination-card">
              <span className="eyebrow">{categories[prayer.category]}</span>
              <h2>{prayer.title.ja}<span aria-hidden="true">→</span></h2>
              <p className="reading">{prayer.title.reading}</p>
              <p className="translation" lang="vi">{prayer.title.vi}</p>
              <ContentStatus status={prayer.status} />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
