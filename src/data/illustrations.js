/**
 * Curated Vietnamese watercolor illustrations for munnn01.
 * Single source of truth for asset paths, accessible alt text, and topic/game mappings.
 */

export const APP_ART = Object.freeze({
  mascot: {
    src: "/images/snoopy-aodai.webp",
    alt: "Chú cún đội nón lá mặc áo dài hoa sen",
    transparent: false,
  },
  emblem: {
    src: "/images/non-la-flag.png",
    alt: "Nón lá và lá cờ Việt Nam",
    transparent: true,
  },
  lotus: {
    src: "/images/hoa-sen.png",
    alt: "Hoa sen Việt Nam",
    transparent: true,
  },
  banhChung: {
    src: "/images/banh-chung.webp",
    alt: "Bánh chưng xanh truyền thống",
    transparent: false,
  },
  goiCuon: {
    src: "/images/goi-cuon.webp",
    alt: "Gỏi cuốn tôm thịt",
    transparent: false,
  },
  banhMi: {
    src: "/images/banh-mi.webp",
    alt: "Bánh mì Việt Nam",
    transparent: false,
  },
  xeBanhMi: {
    src: "/images/xe-banh-mi.webp",
    alt: "Xe bánh mì patê thịt nướng hẻm Sài Gòn",
    transparent: false,
  },
  comHanoi: {
    src: "/images/com-hanoi.webp",
    alt: "Cốm lá sen mùa thu Hà Nội",
    transparent: false,
  },
  harvestFamily: {
    src: "/images/gia-dinh-mua-gat.webp",
    alt: "Gia đình nông dân mùa gặt",
    transparent: false,
  },
});

export const TOPIC_ILLUSTRATIONS = Object.freeze({
  self: APP_ART.harvestFamily,
  food: APP_ART.banhMi,
  routine: APP_ART.xeBanhMi,
  weather: APP_ART.comHanoi,
  emotions: APP_ART.lotus,
  opinions: APP_ART.emblem,
});

export const GAME_ILLUSTRATIONS = Object.freeze({
  listening: APP_ART.banhMi,
  pronunciation: APP_ART.banhChung,
  dialogue: APP_ART.xeBanhMi,
  reading: APP_ART.goiCuon,
});
