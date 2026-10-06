import type { Metadata } from "next";
import { RosaryPlayer } from "@/components/rosary-player";
import { mysterySets } from "@/content/rosary";
import { buildRosarySteps, validateMysterySets } from "@/domain/rosary";

export const metadata: Metadata = { title: "ロザリオ" };

validateMysterySets(mysterySets);
for (const set of mysterySets) buildRosarySteps(set);

export default function RosaryPage() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow" lang="vi">Kinh Mân Côi</p>
        <h1>ロザリオ</h1>
        <p className="intro">マリアとともに、五つの神秘を黙想する。</p>
        <p className="translation" lang="vi">Cùng Đức Mẹ suy niệm năm mầu nhiệm, từng lời kinh một.</p>
      </div>
      <RosaryPlayer />
    </>
  );
}
