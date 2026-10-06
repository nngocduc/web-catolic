import type { Metadata } from "next";
import { MassContent } from "@/components/mass-content";
import { MassIncompleteNotice } from "@/components/sample-notice";
import { massOrder } from "@/content/mass";

export const metadata: Metadata = { title: "ミサ" };

export default function MassPage() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow" lang="vi">Thánh lễ</p>
        <h1>ミサ</h1>
        <p className="intro">開祭から閉祭までの式次第を、日本語を中心に案内します。</p>
      </div>
      {massOrder.status === "partial" && <MassIncompleteNotice />}
      <MassContent order={massOrder} />
    </>
  );
}
