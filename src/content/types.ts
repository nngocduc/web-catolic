/** Japanese is primary; Vietnamese supports understanding. */
export type BilingualText = {
  ja: string;
  reading?: string;
  vi: string;
};

export type ContentSource = {
  /** Which part this source supports; use separate entries when sources differ. */
  appliesTo: "identity" | "ja" | "vi" | "reading" | "all";
  name: string;
  url?: `https://${string}` | `http://${string}`;
  /** Edition, page, section, or another non-URL citation. */
  reference?: string;
  /** Only documented copyright terms or reproduction permission, never assumed. */
  reproductionNote?: string;
};

export type ContentVerification =
  | {
      status: "sample" | "unverified";
      sources?: readonly ContentSource[];
    }
  | {
      /** Human-reviewed wording, reading, translation, and reproduction basis. */
      status: "verified";
      sources: readonly [ContentSource, ...ContentSource[]];
    };

export type PrayerReference<PrayerId extends string = string> = {
  prayerId: PrayerId;
  /** Omitted means once. Must be a positive safe integer. */
  repeat?: number;
};

export type PrayerBlock<PrayerId extends string = string> =
  | { id: string; kind: "text"; text: BilingualText }
  | ({ id: string; kind: "prayer" } & PrayerReference<PrayerId>);

export type Prayer<PrayerId extends string = string> = {
  /** Stable URL slug and reference key. Do not change when editing titles. */
  id: string;
  title: BilingualText & { reading: string };
  category: "basic" | "daily" | "seasonal" | "rosary" | "marian" | "faith";
  /** A canonical prayer whose identity is known but whose body is withheld. */
  availability?: {
    status: "unavailable";
    ja: string;
    vi: string;
  };
  notes?: BilingualText;
  /** Context evidence is separate from sources for the prayer wording. */
  context?: {
    text: BilingualText;
    source: Pick<ContentSource, "name" | "url" | "reference">;
  };
} & ContentVerification & (
  | { text: BilingualText; blocks?: never; availability?: never }
  | { text?: never; blocks: readonly PrayerBlock<PrayerId>[]; availability?: never }
  | { text?: never; blocks?: never; availability: { status: "unavailable"; ja: string; vi: string } }
);
