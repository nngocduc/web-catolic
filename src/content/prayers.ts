import type { Prayer } from "./types";
import { validatePrayers } from "./validate-prayers";

const prayerData = [
  {
    id: "lords-prayer",
    title: { ja: "主の祈り", reading: "しゅのいのり", vi: "Kinh Lạy Cha" },
    text: {
      ja: `天におられるわたしたちの父よ、
み名が聖とされますように。
み国が来ますように。
みこころが天に行われるとおり地にも行われますように。
わたしたちの日ごとの糧を今日もお与えください。
わたしたちの罪をおゆるしください。わたしたちも人をゆるします。
わたしたちを誘惑におちいらせず、
悪からお救いください。

アーメン。`,
      reading: `てんにおられるわたしたちのちちよ、
みながせいとされますように。
みくにがきますように。
みこころがてんにおこなわれるとおりちにもおこなわれますように。
わたしたちのひごとのかてをきょうもおあたえください。
わたしたちのつみをおゆるしください。わたしたちもひとをゆるします。
わたしたちをゆうわくにおちいらせず、
あくからおすくいください。

アーメン。`,
      vi: `Lạy Cha chúng con ở trên trời,
Xin cho danh Cha cả sáng.
Xin cho Nước Cha trị đến.
Xin cho ý Cha được thể hiện dưới đất cũng như trên trời.
Xin Cha ban cho chúng con hôm nay lương thực hằng ngày.
Xin Cha tha tội cho chúng con. Chúng con cũng tha thứ cho người khác.
Xin đừng để chúng con sa chước cám dỗ,
Nhưng cứu chúng con khỏi sự dữ.

Amen.`,
    },
    category: "basic",
    status: "unverified",
    notes: {
      ja: "日本語本文は日本カトリック司教協議会認可の祈りです。読み方とベトナム語訳は、このプロジェクトで作成した学習用の補助で、独立した確認はまだ受けていません。",
      vi: "Bản văn tiếng Nhật được Hội đồng Giám mục Nhật Bản phê chuẩn. Cách đọc kana và bản diễn nghĩa tiếng Việt do dự án biên soạn để hỗ trợ học tập, chưa được kiểm chứng độc lập; không phải bản dịch tiếng Việt do CBCJ cung cấp.",
    },
    sources: [
      {
        appliesTo: "ja",
        name: "カトリック中央協議会 / 日本カトリック司教協議会",
        url: "https://www.cbcj.catholic.jp/2000/02/15/15311/",
        reference: "主の祈り — 2000年2月15日 日本カトリック司教協議会認可",
        reproductionNote: "©日本カトリック司教協議会",
      },
      {
        appliesTo: "reading",
        name: "このプロジェクトで作成した読み方",
        reference: "日本語本文に対応する学習用のかな。独立した確認は未実施。",
      },
      {
        appliesTo: "vi",
        name: "Bản diễn nghĩa tiếng Việt do dự án biên soạn",
        reference: "Hỗ trợ hiểu bản văn tiếng Nhật; chưa được kiểm chứng độc lập, không phải bản dịch chính thức của CBCJ.",
      },
    ],
  },
  {
    id: "ave-maria",
    title: { ja: "アヴェ・マリアの祈り", reading: "アヴェ・マリアのいのり", vi: "Kinh Kính Mừng" },
    text: {
      ja: `アヴェ、マリア、恵みに満ちた方、
主はあなたとともにおられます。
あなたは女のうちで祝福され、
ご胎内の御子イエスも祝福されています。
神の母聖マリア、
わたしたち罪びとのために、
今も、死を迎える時も、お祈りください。

アーメン。`,
      reading: `アヴェ、マリア、めぐみにみちたかた、
しゅはあなたとともにおられます。
あなたはおんなのうちでしゅくふくされ、
ごたいないのおんこイエスもしゅくふくされています。
かみのははせいマリア、
わたしたちつみびとのために、
いまも、しをむかえるときも、おいのりください。

アーメン。`,
      vi: `Kính mừng Maria đầy ơn phúc,
Đức Chúa Trời ở cùng Bà.
Bà có phúc lạ hơn mọi người nữ,
và Giêsu, Con lòng Bà gồm phúc lạ.

Thánh Maria, Đức Mẹ Chúa Trời,
cầu cho chúng con là kẻ có tội,
khi nay và trong giờ lâm tử.

Amen.`,
    },
    category: "basic",
    status: "unverified",
    notes: {
      ja: "日本語本文は日本カトリック司教協議会承認の祈りです。読み方はこのプロジェクトで作成し、ベトナム語はプロジェクト用に提供された学習用の補助です。読み方とベトナム語は独立した確認をまだ受けていません。",
      vi: "Bản văn tiếng Nhật được Hội đồng Giám mục Nhật Bản chấp thuận. Cách đọc kana do dự án biên soạn; bản tiếng Việt được cung cấp cho dự án để hỗ trợ học tập. Cả hai chưa được kiểm chứng độc lập; bản tiếng Việt không được quy cho CBCJ.",
    },
    sources: [
      {
        appliesTo: "ja",
        name: "カトリック中央協議会 / 日本カトリック司教協議会",
        url: "https://www.cbcj.catholic.jp/2011/06/14/5759/",
        reference: "2011年6月14日 定例司教総会にて承認",
        reproductionNote: "©日本カトリック司教協議会",
      },
      {
        appliesTo: "reading",
        name: "このプロジェクトで作成した読み方",
        reference: "日本語本文に行ごとに対応する学習用のかな。独立した確認は未実施。",
      },
      {
        appliesTo: "vi",
        name: "Bản tiếng Việt được cung cấp cho dự án",
        reference: "Nội dung hỗ trợ học tập do người dùng cung cấp; chưa ghi nhận nguồn tiếng Việt độc lập, không phải bản dịch do CBCJ cung cấp.",
      },
    ],
  },
  {
    id: "glory-be",
    title: { ja: "栄唱", reading: "えいしょう", vi: "Kinh Sáng Danh" },
    text: {
      ja: `栄光は父と子と聖霊に、
初めのように今もいつも世々に。アーメン。`,
      reading: `えいこうはちちとことせいれいに、
はじめのようにいまもいつもよよに。アーメン。`,
      vi: `Sáng danh Đức Chúa Cha, và Đức Chúa Con, và Đức Chúa Thánh Thần.
Như đã có trước vô cùng, và bây giờ, và hằng có, và đời đời chẳng cùng. Amen.`,
    },
    category: "basic",
    status: "unverified",
    notes: {
      ja: "日本語はCBCJ公開の『復活のろうそくの祝福（試用版）』の栄唱部分です。読み方とベトナム語はプロジェクトで用意した学習用の補助で、独立した確認は未実施です。",
      vi: "Tiếng Nhật trích phần kinh Sáng Danh trong tài liệu nghi thức bản dùng thử do CBCJ công bố. Kana và tiếng Việt là nội dung hỗ trợ học tập do dự án chuẩn bị, chưa được kiểm chứng độc lập; tiếng Việt không do CBCJ cung cấp.",
    },
    sources: [
      {
        appliesTo: "ja",
        name: "カトリック中央協議会 / 日本カトリック司教協議会",
        url: "https://www.cbcj.catholic.jp/wp2025/wp-content/uploads/2026/03/20260313.pdf",
        reference: "『復活のろうそくの祝福（試用版）』2頁、8番の栄唱（司式・答唱）。祈りの言葉のみを掲載。",
      },
      {
        appliesTo: "reading",
        name: "このプロジェクトで作成した読み方",
        reference: "日本語本文に行ごとに対応する学習用のかな。独立した確認は未実施。",
      },
      {
        appliesTo: "vi",
        name: "Nội dung tiếng Việt hỗ trợ học tập do dự án chuẩn bị",
        reference: "Dùng cách diễn đạt Công giáo quen thuộc; chưa ghi nhận nguồn tiếng Việt độc lập, không phải bản dịch do CBCJ cung cấp.",
      },
    ],
  },
  {
    id: "sign-of-cross",
    title: { ja: "十字架のしるしと祈り", reading: "じゅうじかのしるしといのり", vi: "Dấu Thánh Giá" },
    text: {
      ja: `父と子と聖霊のみ名によって。
アーメン。`,
      reading: `ちちとことせいれいのみなによって。
アーメン。`,
      vi: `Nhân danh Cha, và Con, và Thánh Thần.
Amen.`,
    },
    category: "basic",
    status: "unverified",
    notes: {
      ja: "日本語はCBCJ公開のミサ式次第の十字架のしるしで唱える言葉と応答です。読み方とベトナム語はプロジェクトで用意した学習用の補助で、独立した確認は未実施です。",
      vi: "Tiếng Nhật là lời làm dấu Thánh Giá và lời đáp trong nghi thức Thánh lễ do CBCJ công bố. Kana và tiếng Việt là nội dung hỗ trợ học tập do dự án chuẩn bị, chưa được kiểm chứng độc lập; tiếng Việt không do CBCJ cung cấp.",
    },
    sources: [
      {
        appliesTo: "ja",
        name: "カトリック中央協議会 / 日本カトリック典礼委員会",
        url: "https://www.cbcj.catholic.jp/wp-content/uploads/2017/01/henkou2022.pdf",
        reference: "『新しい「ミサの式次第と第一～第四奉献文」の変更箇所』印刷頁15（PDF17頁）、開祭1番。祈りの言葉と応答のみを掲載。",
      },
      {
        appliesTo: "reading",
        name: "このプロジェクトで作成した読み方",
        reference: "日本語本文に行ごとに対応する学習用のかな。独立した確認は未実施。",
      },
      {
        appliesTo: "vi",
        name: "Nội dung tiếng Việt hỗ trợ học tập do dự án chuẩn bị",
        reference: "Dùng cách diễn đạt Công giáo quen thuộc; chưa ghi nhận nguồn tiếng Việt độc lập, không phải bản dịch do CBCJ cung cấp.",
      },
    ],
  },
  {
    id: "apostles-creed",
    title: { ja: "使徒信条", reading: "しとしんじょう", vi: "Kinh Tin Kính các Thánh Tông đồ" },
    text: {
      ja: `天地の創造主、
全能の父である神を信じます。
父のひとり子、わたしたちの主 イエス・キリストを信じます。
主は聖霊によってやどり、おとめマリアから生まれ、
ポンティオ・ピラトのもとで苦しみを受け、
十字架につけられて死に、葬られ、
陰府（よみ）に下り、三日目に死者のうちから復活し、
天に昇って、全能の父である神の右の座に着き、
生者（せいしゃ）と死者を裁くために来られます。
聖霊を信じ、聖なる普遍の教会、
聖徒の交わり、罪のゆるし、からだの復活、
永遠のいのちを信じます。

アーメン。`,
      reading: `てんちのそうぞうしゅ、
ぜんのうのちちであるかみをしんじます。
ちちのひとりこ、わたしたちのしゅ イエス・キリストをしんじます。
しゅはせいれいによってやどり、おとめマリアからうまれ、
ポンティオ・ピラトのもとでくるしみをうけ、
じゅうじかにつけられてしに、ほうむられ、
よみにくだり、みっかめにししゃのうちからふっかつし、
てんにのぼって、ぜんのうのちちであるかみのみぎのざにつき、
せいしゃとししゃをさばくためにこられます。
せいれいをしんじ、せいなるふへんのきょうかい、
せいとのまじわり、つみのゆるし、からだのふっかつ、
えいえんのいのちをしんじます。

アーメン。`,
      vi: `Tôi tin kính Đức Chúa Trời là Cha phép tắc vô cùng dựng nên trời đất.
Tôi tin kính Đức Chúa Giêsu Kitô là Con Một Đức Chúa Cha cùng là Chúa chúng tôi;
bởi phép Đức Chúa Thánh Thần mà Người xuống thai, sinh bởi Bà Maria đồng trinh;
chịu nạn đời quan Phongxiô Philatô, chịu đóng đinh trên cây Thánh Giá, chết và táng xác;
xuống ngục tổ tông, ngày thứ ba bởi trong kẻ chết mà sống lại;
lên trời, ngự bên hữu Đức Chúa Cha phép tắc vô cùng;
ngày sau bởi trời lại xuống phán xét kẻ sống và kẻ chết.
Tôi tin kính Đức Chúa Thánh Thần.
Tôi tin có Hội Thánh hằng có ở khắp thế này,
các thánh thông công.
Tôi tin phép tha tội.
Tôi tin xác loài người ngày sau sống lại.
Tôi tin hằng sống vậy.

Amen.`,
    },
    category: "basic",
    status: "unverified",
    notes: {
      ja: "日本語はこのプロジェクトで選定された本文です。読み方はプロジェクトで作成し、ベトナム語は利用者から提供された学習用の補助です。読み方とベトナム語は独立した確認をまだ受けていません。",
      vi: "Tiếng Nhật là bản văn được chọn cho dự án. Kana do dự án biên soạn; tiếng Việt do người dùng cung cấp để hỗ trợ học tập. Cả hai chưa được kiểm chứng độc lập; tiếng Việt không do CBCJ cung cấp.",
    },
    sources: [
      {
        appliesTo: "ja",
        name: "カトリック中央協議会 / 日本カトリック司教協議会",
        url: "https://www.cbcj.catholic.jp/2004/02/18/7456/",
        reference: "2004年2月18日 日本カトリック司教協議会認可。本文は利用者が提供したプロジェクト選定版。",
        reproductionNote: "©日本カトリック司教協議会",
      },
      {
        appliesTo: "reading",
        name: "このプロジェクトで作成した読み方",
        reference: "日本語本文に行ごとに対応する学習用のかな。本文の括弧内の読みは重複させず、かな本文に反映。独立した確認は未実施。",
      },
      {
        appliesTo: "vi",
        name: "Bản tiếng Việt được cung cấp cho dự án",
        reference: "Nội dung hỗ trợ học tập do người dùng cung cấp; chưa ghi nhận nguồn tiếng Việt độc lập, không phải bản dịch do CBCJ cung cấp.",
      },
    ],
  },
  {
    id: "prayer-before-meals",
    title: { ja: "食前の祈り", reading: "しょくぜんのいのり", vi: "Kinh Trước Bữa Ăn" },
    text: {
      ja: `父よ、あなたのいつくしみに感謝してこの食事をいただきます。
ここに用意されたものを祝福し、
わたしたちの心と体を支える糧としてください。
わたしたちの主イエス・キリストによって。
アーメン。`,
      reading: `ちちよ、あなたのいつくしみにかんしゃしてこのしょくじをいただきます。
ここによういされたものをしゅくふくし、
わたしたちのこころとからだをささえるかてとしてください。
わたしたちのしゅイエス・キリストによって。
アーメン。`,
      vi: `Lạy Cha,
chúng con cảm tạ Cha vì lòng nhân từ của Cha
và xin đón nhận bữa ăn này.
Xin Cha chúc lành cho những thức ăn đã được chuẩn bị nơi đây,
để trở nên lương thực nâng đỡ tâm hồn và thân xác chúng con.
Nhờ Đức Giêsu Kitô, Chúa chúng con.

Amen.`,
    },
    category: "daily",
    status: "unverified",
    notes: {
      ja: "日本語本文の出典はカトリック山鼻教会です。『日々の祈り 改訂版第二版』の目次にもこの祈りが掲載されています。読み方とベトナム語はプロジェクトの学習用補助で、独立した確認は未実施です。",
      vi: "Nguồn bản văn tiếng Nhật là nhà thờ Công giáo Yamahana. Kana và tiếng Việt là nội dung hỗ trợ học tập của dự án, chưa được kiểm chứng độc lập; tiếng Việt không phải bản dịch chính thức.",
    },
    sources: [
      {
        appliesTo: "ja",
        name: "カトリック山鼻教会",
        url: "https://yamahana-cc.jimdofree.com/%E7%A5%88%E3%82%8A-prayer/",
        reference: "『祈り (PRAYER)』食前の祈り。本文は利用者が提供したプロジェクト選定版。収録確認のみ：CBCJ『日々の祈り 改訂版第二版』目次 https://www.cbcj.catholic.jp/publish/hibi/ （本文の出典ではありません）。",
      },
      {
        appliesTo: "reading",
        name: "このプロジェクトで作成した読み方",
        reference: "日本語本文に行ごとに対応する学習用のかな。独立した確認は未実施。",
      },
      {
        appliesTo: "vi",
        name: "Nội dung tiếng Việt hỗ trợ học tập được chuẩn bị cho dự án",
        reference: "Bản hỗ trợ do người dùng cung cấp cho dự án; chưa được kiểm chứng độc lập, không phải bản dịch chính thức hay bản dịch do CBCJ cung cấp.",
      },
    ],
  },
  {
    id: "prayer-after-meals",
    title: { ja: "食後の祈り", reading: "しょくごのいのり", vi: "Kinh Sau Bữa Ăn" },
    text: {
      ja: `父よ、感謝のうちにこの食事を終わります。
あなたのいつくしみを忘れず、すべての人の幸せを祈りながら。
わたしたちの主イエス・キリストによって。
アーメン。`,
      reading: `ちちよ、かんしゃのうちにこのしょくじをおわります。
あなたのいつくしみをわすれず、すべてのひとのしあわせをいのりながら。
わたしたちのしゅイエス・キリストによって。
アーメン。`,
      vi: `Lạy Cha,
chúng con kết thúc bữa ăn này trong tâm tình cảm tạ.
Xin cho chúng con luôn nhớ đến lòng nhân từ của Cha
và cầu nguyện cho hạnh phúc của mọi người.
Nhờ Đức Giêsu Kitô, Chúa chúng con.

Amen.`,
    },
    category: "daily",
    status: "unverified",
    notes: {
      ja: "日本語本文の出典はカトリック山鼻教会です。『日々の祈り 改訂版第二版』の目次にもこの祈りが掲載されています。読み方とベトナム語はプロジェクトの学習用補助で、独立した確認は未実施です。",
      vi: "Nguồn bản văn tiếng Nhật là nhà thờ Công giáo Yamahana. Kana và tiếng Việt là nội dung hỗ trợ học tập của dự án, chưa được kiểm chứng độc lập; tiếng Việt không phải bản dịch chính thức.",
    },
    sources: [
      {
        appliesTo: "ja",
        name: "カトリック山鼻教会",
        url: "https://yamahana-cc.jimdofree.com/%E7%A5%88%E3%82%8A-prayer/",
        reference: "『祈り (PRAYER)』食後の祈り。本文は利用者が提供したプロジェクト選定版。収録確認のみ：CBCJ『日々の祈り 改訂版第二版』目次 https://www.cbcj.catholic.jp/publish/hibi/ （本文の出典ではありません）。",
      },
      {
        appliesTo: "reading",
        name: "このプロジェクトで作成した読み方",
        reference: "日本語本文に行ごとに対応する学習用のかな。独立した確認は未実施。",
      },
      {
        appliesTo: "vi",
        name: "Nội dung tiếng Việt hỗ trợ học tập được chuẩn bị cho dự án",
        reference: "Bản hỗ trợ do người dùng cung cấp cho dự án; chưa được kiểm chứng độc lập, không phải bản dịch chính thức hay bản dịch do CBCJ cung cấp.",
      },
    ],
  },
  {
    id: "angelus",
    title: { ja: "お告げの祈り", reading: "おつげのいのり", vi: "Kinh Truyền Tin" },
    category: "marian",
    status: "unverified",
    blocks: [
      {
        id: "annunciation", kind: "text",
        text: {
          ja: `主のみ使いのお告げを受けて、
マリアは聖霊によって神の御子をやどされた。`,
          reading: `しゅのみつかいのおつげをうけて、
マリアはせいれいによってかみのおんこをやどされた。`,
          vi: `Đức Chúa Trời sai Thánh Thiên Thần truyền tin cho Rất Thánh Đức Bà Maria,
và Rất Thánh Đức Bà chịu thai bởi phép Đức Chúa Thánh Thần.`,
        },
      },
      { id: "ave-maria-1", kind: "prayer", prayerId: "ave-maria" },
      {
        id: "handmaid", kind: "text",
        text: {
          ja: `私は主のはしため、
おことばどおりになりますように。`,
          reading: `わたしはしゅのはしため、
おことばどおりになりますように。`,
          vi: `Này tôi là tôi tá Đức Chúa Trời,
tôi xin vâng như lời Thánh Thiên Thần truyền.`,
        },
      },
      { id: "ave-maria-2", kind: "prayer", prayerId: "ave-maria" },
      {
        id: "incarnation", kind: "text",
        text: {
          ja: `みことばは人となり、
わたしたちのうちに住まわれた。`,
          reading: `みことばはひととなり、
わたしたちのうちにすまわれた。`,
          vi: `Chốc ấy Ngôi Thứ Hai xuống thế làm người,
và ở cùng chúng con.`,
        },
      },
      { id: "ave-maria-3", kind: "prayer", prayerId: "ave-maria" },
      {
        id: "conclusion", kind: "text",
        text: {
          ja: `神の母聖マリア、わたしたちのために祈ってください。
キリストの約束にかなうものとなりますように。

祈願

神よ、み使いのお告げによって、
御子が人となられたことを知った私たちが
キリストの受難と十字架を通して
復活の栄光に達することができるよう、恵みを注いで下さい。
わたしたちの主イエス・キリストによって。

アーメン。`,
          reading: `かみのははせいマリア、わたしたちのためにいのってください。
キリストのやくそくにかなうものとなりますように。

きがん

かみよ、みつかいのおつげによって、
おんこがひととなられたことをしったわたしたちが
キリストのじゅなんとじゅうじかをとおして
ふっかつのえいこうにたっすることができるよう、めぐみをそそいでください。
わたしたちのしゅイエス・キリストによって。

アーメン。`,
          vi: `Lạy Rất Thánh Đức Mẹ Chúa Trời, xin cầu cho chúng con,
đáng chịu lấy những sự Chúa Kitô đã hứa.

Lời nguyện

Lạy Chúa,
xin đổ ơn Chúa vào lòng chúng con.
Nhờ lời Thiên Thần truyền,
chúng con đã nhận biết Đức Kitô, Con Chúa, đã xuống thế làm người;
xin vì cuộc khổ nạn và thập giá của Người,
dẫn chúng con đến vinh quang phục sinh.
Nhờ Đức Kitô, Chúa chúng con.

Amen.`,
        },
      },
    ],
    context: {
      text: {
        ja: "お告げの祈りは受胎告知を記念し、伝統的に一日三回唱えます。復活節中は「お告げの祈り」の代わりに「アレルヤの祈り」を唱えます。ここでいう復活節は復活の主日から聖霊降臨の主日までです。",
        vi: "Kinh Truyền Tin tưởng nhớ biến cố Truyền Tin, theo truyền thống được đọc ba lần mỗi ngày. Trong mùa Phục Sinh, từ Chúa Nhật Phục Sinh đến Chúa Nhật Hiện Xuống, đọc Kinh Lạy Nữ Vương Thiên Đàng thay thế.",
      },
      source: {
        name: "カトリック中央協議会 / 日本カトリック司教協議会",
        url: "https://www.cbcj.catholic.jp/faq/angelus/",
        reference: "背景・季節の説明のみ。本体の全文の出典ではありません。",
      },
    },
    sources: [
      {
        appliesTo: "ja", name: "カトリック山鼻教会",
        url: "https://yamahana-cc.jimdofree.com/%E7%A5%88%E3%82%8A-prayer/",
        reference: "『祈り (PRAYER)』お告げの祈り。利用者提供のプロジェクト選定本文（局所部分）。参照先のアヴェ・マリアは独自の出典を保持します。",
      },
      {
        appliesTo: "reading", name: "このプロジェクトで作成した読み方",
        reference: "局所部分の日本語に行ごとに対応する学習用のかな。独立した確認は未実施。",
      },
      {
        appliesTo: "vi", name: "Nội dung tiếng Việt hỗ trợ học tập của dự án",
        reference: "Nội dung hỗ trợ do người dùng cung cấp cho dự án; chưa được kiểm chứng độc lập, không phải bản dịch của CBCJ hay nhà thờ Yamahana.",
      },
    ],
  },
  {
    id: "regina-caeli",
    title: { ja: "アレルヤの祈り", reading: "アレルヤのいのり", vi: "Kinh Lạy Nữ Vương Thiên Đàng" },
    category: "marian",
    status: "unverified",
    text: {
      ja: `神の母聖マリア、お喜びください。アレルヤ。
あなたにやどられた方は。アレルヤ。
おことばどおりに復活されました。アレルヤ。
わたしたちのためにお祈り下さい。アレルヤ。

聖マリア、お喜びください。アレルヤ。
主はまことに復活されました。アレルヤ。

祈願

神よ、あなたは御子キリストの復活によって、
世界に喜びをお与えになりました。
キリストの母、聖マリアにならい、
わたしたちも永遠のいのちの喜びを得ることができますように。
わたしたちの主イエス・キリストによって。

アーメン。`,
      reading: `かみのははせいマリア、およろこびください。アレルヤ。
あなたにやどられたかたは。アレルヤ。
おことばどおりにふっかつされました。アレルヤ。
わたしたちのためにおいのりください。アレルヤ。

せいマリア、およろこびください。アレルヤ。
しゅはまことにふっかつされました。アレルヤ。

きがん

かみよ、あなたはおんこキリストのふっかつによって、
せかいによろこびをおあたえになりました。
キリストのはは、せいマリアにならい、
わたしたちもえいえんのいのちのよろこびをえることができますように。
わたしたちのしゅイエス・キリストによって。

アーメン。`,
      vi: `Lạy Nữ Vương Thiên Đàng, hãy vui mừng. Alleluia.
Vì Đấng Mẹ đã đáng cưu mang trong lòng. Alleluia.
Người đã sống lại thật như lời đã phán hứa. Alleluia.
Xin cầu cùng Chúa cho chúng con. Alleluia.

Lạy Đức Trinh Nữ Maria, hãy hỉ hoan khoái lạc. Alleluia.
Vì Chúa đã sống lại thật. Alleluia.

Lời nguyện

Lạy Chúa,
Chúa đã làm cho thiên hạ được vui mừng quá bội
bởi Đức Chúa Giêsu Kitô là Con Chúa cùng là Chúa chúng con đã sống lại.
Xin vì Đức Nữ Đồng Trinh Maria là Thánh Mẫu Người,
nguyện cầu cho chúng con được hưởng phúc vui vẻ hằng sống đời đời.
Vì công nghiệp Chúa Kitô là Chúa chúng con.

Amen.`,
    },
    context: {
      text: {
        ja: "復活節中は「お告げの祈り」の代わりに「アレルヤの祈り」を唱えます。ここでいう復活節は復活の主日から聖霊降臨の主日までです。復活節以外はお告げの祈りを唱えます。",
        vi: "Trong mùa Phục Sinh, từ Chúa Nhật Phục Sinh đến Chúa Nhật Hiện Xuống, đọc Kinh Lạy Nữ Vương Thiên Đàng thay Kinh Truyền Tin. Ngoài mùa Phục Sinh, đọc Kinh Truyền Tin.",
      },
      source: {
        name: "カトリック中央協議会 / 日本カトリック司教協議会",
        url: "https://www.cbcj.catholic.jp/faq/angelus/",
        reference: "背景・季節の説明のみ。本体の全文の出典ではありません。",
      },
    },
    sources: [
      {
        appliesTo: "ja", name: "カトリック山鼻教会",
        url: "https://yamahana-cc.jimdofree.com/%E7%A5%88%E3%82%8A-prayer/",
        reference: "『祈り (PRAYER)』アレルヤの祈り。利用者提供のプロジェクト選定本文。",
      },
      {
        appliesTo: "reading", name: "このプロジェクトで作成した読み方",
        reference: "日本語に行ごとに対応する学習用のかな。独立した確認は未実施。",
      },
      {
        appliesTo: "vi", name: "Nội dung tiếng Việt hỗ trợ học tập của dự án",
        reference: "Nội dung hỗ trợ do người dùng cung cấp cho dự án; chưa được kiểm chứng độc lập, không phải bản dịch của CBCJ hay nhà thờ Yamahana.",
      },
    ],
  },
  {
    id: "salve-regina",
    title: { ja: "元后あわれみの母", reading: "げんこうあわれみのはは", vi: "Kinh Lạy Nữ Vương" },
    category: "marian",
    status: "unverified",
    text: {
      ja: `元后あわれみの母
われらのいのち、喜び、希望。
旅路からあなたに叫ぶエバの子。
嘆きながら泣きながらも、涙の谷にあなたを慕う。
われらのために執り成す方。
あわれみの目をわれらに注ぎ、
とうといあなたの子イエスを旅路の果てに示してください。
おお、いつくしみ、恵みあふれる、喜びのおとめマリア。
アーメン。`,
      reading: `げんこうあわれみのはは
われらのいのち、よろこび、きぼう。
たびじからあなたにさけぶエバのこ。
なげきながらなきながらも、なみだのたににあなたをしたう。
われらのためにとりなすかた。
あわれみのめをわれらにそそぎ、
とうといあなたのこイエスをたびじのはてにしめしてください。
おお、いつくしみ、めぐみあふれる、よろこびのおとめマリア。
アーメン。`,
      vi: `Lạy Nữ Vương, Mẹ nhân lành,
làm cho chúng con được sống, được vui, được cậy.
Thân lạy Bà, chúng con con cháu Evà ở chốn khách đày, kêu đến cùng Bà;
chúng con ở nơi khóc lóc than thở, kêu khấn Bà thương.
Hỡi ôi! Bà là Chúa bầu chúng con, xin ghé mắt thương xem chúng con.
Đến sau khỏi đày, xin cho chúng con được thấy Đức Chúa Giêsu, Con lòng Bà gồm phúc lạ.
Ôi khoan thay, nhân thay, dịu thay, Thánh Maria trọn đời đồng trinh.

Amen.`,
    },
    notes: {
      ja: "日本語はカトリックさいたま教区に掲載された祈りです。読み方とベトナム語はプロジェクトの学習用補助で、独立した確認は未実施です。掲載元の存在から追加の転載許可を推定していません。",
      vi: "Bản văn tiếng Nhật lấy từ trang giáo phận Saitama. Kana và tiếng Việt là nội dung hỗ trợ của dự án, chưa được kiểm chứng độc lập; không phải bản dịch chính thức của CBCJ hay giáo phận Saitama.",
    },
    context: {
      text: {
        ja: "カトリック中央協議会はSalve Reginaの日本語名として「元后あわれみの母」を紹介しています。ここでの日本語本文の出典は、さいたま教区です。",
        vi: "CBCJ xác nhận tên tiếng Nhật của Salve Regina. Nguồn bản văn đầy đủ được dùng ở đây là giáo phận Saitama, không phải bài giới thiệu của CBCJ.",
      },
      source: {
        name: "カトリック中央協議会 / 日本カトリック司教協議会",
        url: "https://www.cbcj.catholic.jp/2020/11/06/21399/",
        reference: "『カトリック情報ハンドブック2020』巻頭特集、「寝る前の祈り」の聖母賛歌。名称の根拠のみで、本祈りの全文の出典ではありません。",
      },
    },
    sources: [
      {
        appliesTo: "ja", name: "カトリックさいたま教区 — 司教メッセージ",
        url: "https://saitama.catholic.jp/our_diocese/our_bishop/messages/?mon=4&no=147&year=2022",
        reference: "2022年の司教メッセージ no.147「復活節第２主日（神のいつくしみの主日）」末尾のサルベ・レジーナ。改行と表記を保持。認可日を示す資料ではありません。",
        reproductionNote: "サイト表記：Copyright© CATHOLIC DIOCESE OF SAITAMA All Rights Reserved. 追加の転載許可やパブリックドメインであることは確認していません。",
      },
      {
        appliesTo: "reading", name: "このプロジェクトで作成した読み方",
        reference: "日本語の各行に対応する学習用のかな。独立した確認は未実施。",
      },
      {
        appliesTo: "vi", name: "Nội dung tiếng Việt hỗ trợ của dự án",
        reference: "Dạng kinh Công giáo truyền thống được chuẩn bị làm nội dung hỗ trợ cho dự án. Chưa ghi nhận nguồn tiếng Việt độc lập; không quy cho CBCJ hoặc giáo phận Saitama.",
      },
    ],
  },
] as const satisfies readonly Prayer[];

// Consumers need all verification states, while reference IDs stay literal.
export const prayers: readonly Prayer<PrayerId>[] = prayerData;

export type PrayerId = (typeof prayerData)[number]["id"];

validatePrayers(prayers);

export function getPrayer(id: string): Prayer | undefined {
  return prayers.find((prayer) => prayer.id === id);
}
