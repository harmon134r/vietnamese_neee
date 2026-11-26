/**
 * Pronunciation Drills for Pre-Intermediate Adult Vietnamese Learners:
 * - TONE_MINIMAL_PAIRS: 12 practical minimal-pair & vowel-contrast sets (2 per topic)
 * - PRONUNCIATION_SENTENCES: 18 natural adult sentences (3 per topic)
 */

export const TONE_MINIMAL_PAIRS = [
  // ---- SELF ----
  {
    id: "mp-self-1",
    topicId: "self",
    focusLabel: "mới / mời (Thanh sắc vs Thanh huyền)",
    contrastType: "tone",
    tipVi:
      "Thanh sắc («mới») đi lên cao và dứt khoát; thanh huyền («mời») hạ thấp, thả lỏng cổ họng. Hai từ này xuất hiện liên tục khi giới thiệu và tiếp khách.",
    items: [
      {
        vi: "mới",
        ipa: "/məːj˧˥/",
        tone: "Thanh sắc",
        meaningVi: "Mới mẻ, vừa bắt đầu (new / just)",
        exampleVi: "Mình mới chuyển sang phòng dự án tháng trước.",
      },
      {
        vi: "mời",
        ipa: "/məːj˨˩/",
        tone: "Thanh huyền",
        meaningVi: "Ngỏ lời đón tiếp hoặc rủ ai đó (to invite)",
        exampleVi: "Mời anh ngồi, em đi pha trà ngay ạ.",
      },
    ],
  },
  {
    id: "mp-self-2",
    topicId: "self",
    focusLabel: "người / ngồi (Vần «ươi» vs «ôi»)",
    contrastType: "vowel",
    tipVi:
      "«Người» bắt đầu bằng nguyên âm không tròn môi «ư» rồi lướt sang «ơ-i»; còn «ngồi» tròn môi ngay từ âm «ô». Đừng tròn môi quá sớm khi đọc «người».",
    items: [
      {
        vi: "người",
        ipa: "/ŋɯəj˨˩/",
        tone: "Thanh huyền",
        meaningVi: "Con người, cá nhân (person)",
        exampleVi: "Tôi là người khá cầu toàn trong công việc.",
      },
      {
        vi: "ngồi",
        ipa: "/ŋoj˨˩/",
        tone: "Thanh huyền",
        meaningVi: "Tư thế ngồi (to sit)",
        exampleVi: "Chúng ta ra góc yên tĩnh kia ngồi nói chuyện nhé.",
      },
    ],
  },

  // ---- FOOD ----
  {
    id: "mp-food-1",
    topicId: "food",
    focusLabel: "ngon / ngắn (Nguyên âm «o» vs «ă»)",
    contrastType: "vowel",
    tipVi:
      "«Ngon» tròn môi mở với nguyên âm /ɔ/ và thanh ngang; «ngắn» dẹt môi, nguyên âm ngắn /a/ cộng thanh sắc đi lên nhanh.",
    items: [
      {
        vi: "ngon",
        ipa: "/ŋɔn˧˧/",
        tone: "Thanh ngang",
        meaningVi: "Hợp vị, hấp dẫn khi ăn (delicious)",
        exampleVi: "Quán bún riêu đầu ngõ nấu nước dùng rất ngon.",
      },
      {
        vi: "ngắn",
        ipa: "/ŋan˧˥/",
        tone: "Thanh sắc",
        meaningVi: "Ít độ dài hoặc thời gian (short)",
        exampleVi: "Bữa trưa chỉ có thời gian ngắn nên mình gọi cơm văn phòng.",
      },
    ],
  },
  {
    id: "mp-food-2",
    topicId: "food",
    focusLabel: "cá / cà / cả (Thanh sắc / huyền / hỏi)",
    contrastType: "tone",
    tipVi:
      "Giữ nguyên âm /aː/ mở rộng và chỉ thay đổi đường nét thanh điệu: «cá» vút lên cao, «cà» hạ trầm nhẹ, «cả» đi xuống sâu rồi nhích nhẹ cuối âm.",
    items: [
      {
        vi: "cá",
        ipa: "/kaː˧˥/",
        tone: "Thanh sắc",
        meaningVi: "Thủy sản làm món ăn (fish)",
        exampleVi: "Tối nay nhà mình ăn cá kho tộ với canh cải.",
      },
      {
        vi: "cà",
        ipa: "/kaː˨˩/",
        tone: "Thanh huyền",
        meaningVi: "Trong «cà phê», «cà chua» (coffee / eggplant)",
        exampleVi: "Sáng nào tôi cũng uống một ly cà phê đen không đường.",
      },
      {
        vi: "cả",
        ipa: "/kaː˧˩˧/",
        tone: "Thanh hỏi",
        meaningVi: "Toàn bộ, tất cả (whole / all)",
        exampleVi: "Cả nhóm đồng nghiệp cùng đặt lẩu thái cho bữa liên hoan.",
      },
    ],
  },

  // ---- ROUTINE ----
  {
    id: "mp-routine-1",
    topicId: "routine",
    focusLabel: "ngủ / ngũ (Thanh hỏi vs Thanh ngã)",
    contrastType: "tone",
    tipVi:
      "Cặp thanh hỏi – ngã là thử thách lớn nhất của người học tiếng Việt chuẩn Bắc: «ngủ» hạ giọng êm và đều, còn «ngũ» có điểm nghẽn thanh quản rõ ở giữa rồi bật lên cao.",
    items: [
      {
        vi: "ngủ",
        ipa: "/ŋu˧˩˧/",
        tone: "Thanh hỏi",
        meaningVi: "Giấc ngủ nghỉ ngơi (to sleep)",
        exampleVi: "Mình cố gắng ngủ đủ bảy tiếng mỗi đêm để giữ tỉnh táo.",
      },
      {
        vi: "ngũ",
        ipa: "/ŋu˧ˀ˥/",
        tone: "Thanh ngã",
        meaningVi: "Số năm — trong «ngũ cốc» (grains / cereal)",
        exampleVi: "Sáng bận quá thì tôi ăn nhanh một bát ngũ cốc với sữa chua.",
      },
    ],
  },
  {
    id: "mp-routine-2",
    topicId: "routine",
    focusLabel: "làm / lầm (Nguyên âm «a» dài vs «â» ngắn)",
    contrastType: "vowel",
    tipVi:
      "Cả hai đều mang thanh huyền, nhưng «làm» mở miệng rộng và kéo dài /aː/, còn «lầm» khép miệng hơn ở vị trí giữa /ə/ và kết thúc gọn vào phụ âm /m/.",
    items: [
      {
        vi: "làm",
        ipa: "/laːm˨˩/",
        tone: "Thanh huyền",
        meaningVi: "Thực hiện công việc (to work / do)",
        exampleVi: "Hôm nay mình tan làm sớm hơn mọi khi nửa tiếng.",
      },
      {
        vi: "lầm",
        ipa: "/ləm˨˩/",
        tone: "Thanh huyền",
        meaningVi: "Nhầm lẫn, sai sót (mistaken / error)",
        exampleVi: "Tôi nhìn lầm lịch họp nên đến sớm hẳn một tiếng.",
      },
    ],
  },

  // ---- WEATHER ----
  {
    id: "mp-weather-1",
    topicId: "weather",
    focusLabel: "nắng / nặng (Thanh sắc vs Thanh nặng)",
    contrastType: "tone",
    tipVi:
      "Cùng vần «ăng» ngắn nhưng thanh sắc («nắng») đẩy cao rõ ở cuối, trong khi thanh nặng («nặng») rơi nhanh xuống thấp và ngắt mạnh bằng thanh quản.",
    items: [
      {
        vi: "nắng",
        ipa: "/naŋ˧˥/",
        tone: "Thanh sắc",
        meaningVi: "Ánh sáng mặt trời, trời nắng (sunny / sunlight)",
        exampleVi: "Giữa trưa trời nắng gắt nên nhớ đội mũ khi ra ngoài.",
      },
      {
        vi: "nặng",
        ipa: "/naŋ˧˨ʔ/",
        tone: "Thanh nặng",
        meaningVi: "Có trọng lượng lớn; mưa nặng hạt (heavy)",
        exampleVi: "Mưa bắt đầu nặng hạt rồi, mình ghé quán trú một lát nhé.",
      },
    ],
  },
  {
    id: "mp-weather-2",
    topicId: "weather",
    focusLabel: "mưa / mua (Nguyên âm đôi «ưa» vs «ua»)",
    contrastType: "vowel",
    tipVi:
      "«Mưa» giữ môi dẹt như khi cười nhẹ (/ɯə/), không chu môi; «mua» chu tròn môi rõ ở âm đầu (/uə/). Luyện phân biệt giúp tránh nhầm «trời mưa» với «trời mua».",
    items: [
      {
        vi: "mưa",
        ipa: "/mɯə˧˧/",
        tone: "Thanh ngang",
        meaningVi: "Hiện tượng nước mưa rơi (rain)",
        exampleVi: "Dự báo tối nay có mưa rào kèm gió mạnh.",
      },
      {
        vi: "mua",
        ipa: "/muə˧˧/",
        tone: "Thanh ngang",
        meaningVi: "Trả tiền để sở hữu đồ vật (to buy)",
        exampleVi: "Trời trở lạnh rồi, cuối tuần mình đi mua thêm áo len.",
      },
    ],
  },

  // ---- EMOTIONS ----
  {
    id: "mp-emotions-1",
    topicId: "emotions",
    focusLabel: "nghĩ / nghỉ (Thanh ngã vs Thanh hỏi)",
    contrastType: "tone",
    tipVi:
      "Hai động từ thiết yếu khi nói về sức khỏe tinh thần: «nghĩ» (suy nghĩ) có thanh ngã ngắt hơi rồi lên cao; «nghỉ» (nghỉ ngơi) mang thanh hỏi trầm và êm.",
    items: [
      {
        vi: "nghĩ",
        ipa: "/ŋi˧ˀ˥/",
        tone: "Thanh ngã",
        meaningVi: "Suy tư, cân nhắc trong đầu (to think)",
        exampleVi: "Cậu đừng nghĩ ngợi quá nhiều về chuyện đã qua nữa.",
      },
      {
        vi: "nghỉ",
        ipa: "/ŋi˧˩˧/",
        tone: "Thanh hỏi",
        meaningVi: "Tạm dừng làm việc để thư giãn (to rest)",
        exampleVi: "Làm căng thẳng cả tuần rồi, cuối tuần cứ nghỉ ngơi thoải mái đi.",
      },
    ],
  },
  {
    id: "mp-emotions-2",
    topicId: "emotions",
    focusLabel: "vui / vội (Vần «ui» thanh ngang vs «ôi» thanh nặng)",
    contrastType: "tone",
    tipVi:
      "«Vui» giữ giọng ngang, cao vừa và sáng âm /u/; «vội» mở hơn một chút ở /o/ và rơi nhanh xuống thanh nặng dứt khoát.",
    items: [
      {
        vi: "vui",
        ipa: "/vuj˧˧/",
        tone: "Thanh ngang",
        meaningVi: "Phấn khởi, hạnh phúc (happy / glad)",
        exampleVi: "Nghe tin bạn vượt qua vòng phỏng vấn mình thật sự rất vui.",
      },
      {
        vi: "vội",
        ipa: "/voj˧˨ʔ/",
        tone: "Thanh nặng",
        meaningVi: "Gấp gáp, hấp tấp (hurried / hasty)",
        exampleVi: "Cứ bình tĩnh xem kỹ hợp đồng, không cần phải vội đâu.",
      },
    ],
  },

  // ---- OPINIONS ----
  {
    id: "mp-opinions-1",
    topicId: "opinions",
    focusLabel: "khó / kho (Thanh sắc vs Thanh ngang)",
    contrastType: "tone",
    tipVi:
      "Chú ý phụ âm đầu «kh» (/x/) thoát hơi nhẹ ở cuống họng, không đọc thành /k/. «Khó» vút cao rõ rệt so với «kho» bằng phẳng.",
    items: [
      {
        vi: "khó",
        ipa: "/xɔ˧˥/",
        tone: "Thanh sắc",
        meaningVi: "Phức tạp, nhiều thử thách (difficult)",
        exampleVi: "Theo mình thì cân bằng giữa tốc độ và chất lượng luôn là bài toán khó.",
      },
      {
        vi: "kho",
        ipa: "/xɔ˧˧/",
        tone: "Thanh ngang",
        meaningVi: "Nơi lưu trữ hàng hóa hoặc dữ liệu (warehouse / repository)",
        exampleVi: "Công ty vừa nâng cấp kho dữ liệu chung để các nhóm tra cứu nhanh hơn.",
      },
    ],
  },
  {
    id: "mp-opinions-2",
    topicId: "opinions",
    focusLabel: "tốt / tất (Nguyên âm «ô» tròn môi vs «â» dẹt môi)",
    contrastType: "vowel",
    tipVi:
      "Cả hai đều kết thúc bằng âm tắc /-t/ và thanh sắc cao, nhưng «tốt» tròn môi chặt ở nguyên âm /o/ còn «tất» giữ môi tự nhiên không tròn ở /ə/.",
    items: [
      {
        vi: "tốt",
        ipa: "/tot˧˥/",
        tone: "Thanh sắc",
        meaningVi: "Có chất lượng cao, tích cực (good)",
        exampleVi: "Đề xuất này mang lại lợi ích lâu dài rất tốt cho cả đội ngũ.",
      },
      {
        vi: "tất",
        ipa: "/tət˧˥/",
        tone: "Thanh sắc",
        meaningVi: "Toàn bộ — trong «tất cả», «tất nhiên» (all / of course)",
        exampleVi: "Tất nhiên mỗi phương án đều có ưu điểm và hạn chế riêng.",
      },
    ],
  },
];

export const PRONUNCIATION_SENTENCES = [
  // ---- SELF ----
  {
    id: "ps-self-1",
    topicId: "self",
    textVi: "Tôi chuyển vào thành phố làm việc được gần bốn năm rồi.",
    ipaGuide: "/toj˧˧ tɕwiən˧˩˧ vaːw˨˩ tʰaɲ˨˩ fo˧˥ laːm˨˩ viək˧˨ʔ ɗɯək˧˨ʔ ɣən˨˩ ɓon˧˥ nam˧˧ zoj˨˩/",
    meaningEn: "I moved to the city for work nearly four years ago.",
    focusNoteVi: "Giữ rõ thanh hỏi ở «chuyển» và sự chuyển nhịp giữa thanh nặng «việc», «được» với thanh sắc «bốn».",
    difficultWords: ["chuyển", "thành phố", "được"],
  },
  {
    id: "ps-self-2",
    topicId: "self",
    textVi: "Tính mình hơi hướng nội nhưng lại rất thích trò chuyện sâu với bạn thân.",
    ipaGuide: "/tɪŋ˧˥ mɪŋ˨˩ həːj˧˧ hɯəŋ˧˥ noj˧˨ʔ ɲɯŋ˧˧ laːj˧˨ʔ zət˧˥ tʰɪk̟˧˥ tɕɔ˨˩ tɕwiən˧˨ʔ səw˧˧ vəːj˧˥ ɓaːn˧˨ʔ tʰən˧˧/",
    meaningEn: "I'm a bit introverted, yet I really enjoy deep conversations with close friends.",
    focusNoteVi: "Phân biệt rõ cặp thanh sắc – nặng ở «hướng nội» và âm đệm tròn môi trong «trò chuyện».",
    difficultWords: ["hướng nội", "trò chuyện", "bạn thân"],
  },
  {
    id: "ps-self-3",
    topicId: "self",
    textVi: "Mục tiêu năm nay của tôi là nâng cao trình độ tiếng Việt để trao đổi công việc tự nhiên hơn.",
    ipaGuide: "/muk͡p˧˨ʔ tiəw˧˧ nam˧˧ naj˧˧ kuə˧˩˧ toj˧˧ laː˨˩ nəŋ˧˧ kaːw˧˧ tɕɪŋ˨˩ ɗo˧˨ʔ tiəŋ˧˥ viət˧˨ʔ ɗe˧˩˧ tɕaːw˧˧ ɗoj˧˩˧ kəwŋ͡m˧˧ viək˧˨ʔ tɯ˧˨ʔ ɲiən˧˧ həːn˧˧/",
    meaningEn: "My goal this year is to level up my Vietnamese to discuss work more naturally.",
    focusNoteVi: "Ngắt nhịp nhẹ sau «của tôi» và «tiếng Việt»; chú ý âm cuối khép môi ở «mục» và «công».",
    difficultWords: ["trình độ", "trao đổi", "tự nhiên"],
  },

  // ---- FOOD ----
  {
    id: "ps-food-1",
    topicId: "food",
    textVi: "Cho mình một ly cà phê sữa đá ít ngọt và một phần bánh mì ốp la nhé.",
    ipaGuide: "/tɕɔ˧˧ mɪŋ˨˩ mot˧˨ʔ li˧˧ kaː˨˩ fe˧˧ sɯə˧ˀ˥ ɗaː˧˥ it˧˥ ŋɔt˧˨ʔ vaː˨˩ mot˧˨ʔ fən˨˩ ɓaɲ˧˥ mi˨˩ op˧˥ laː˧˧ ɲɛ˧˥/",
    meaningEn: "Could I get an iced milk coffee with less sugar and a fried-egg banh mi, please?",
    focusNoteVi: "Chú ý thanh ngã ở «sữa» (/sɯə˧ˀ˥/) khác với thanh sắc ở «đá» (/ɗaː˧˥/), đừng đọc hai từ giống nhau.",
    difficultWords: ["sữa đá", "ít ngọt", "bánh mì"],
  },
  {
    id: "ps-food-2",
    topicId: "food",
    textVi: "Nước dùng phở ở quán này thanh và thơm mùi quế hồi, không bị ngấy mỡ.",
    ipaGuide: "/nɯək˧˥ zuŋ͡m˨˩ fəː˧˩˧ əː˧˩˧ kwaːn˧˥ naj˨˩ tʰaɲ˧˧ vaː˨˩ tʰəːm˧˧ muj˨˩ kwe˧˥ hoj˨˩ xəwŋ͡m˧˧ ɓi˧˨ʔ ŋəj˧˥ məː˧ˀ˥/",
    meaningEn: "The pho broth at this spot is light and fragrant with cinnamon and star anise, not greasy.",
    focusNoteVi: "Luyện cặp thanh hỏi «phở», «ở» liền nhau và phân biệt «ngấy» (sắc) với «mỡ» (ngã).",
    difficultWords: ["nước dùng", "phở", "ngấy mỡ"],
  },
  {
    id: "ps-food-3",
    topicId: "food",
    textVi: "Cuối tuần mình thích tự đi chợ nấu một bữa cơm thanh đạm tại nhà.",
    ipaGuide: "/kuəj˧˥ twən˨˩ mɪŋ˨˩ tʰɪk̟˧˥ tɯ˧˨ʔ ɗi˧˧ tɕəː˧˨ʔ nəw˧˥ mot˧˨ʔ ɓɯə˧ˀ˥ kəːm˧˧ tʰaɲ˧˧ ɗaːm˧˨ʔ taːj˧˨ʔ ɲaː˨˩/",
    meaningEn: "On weekends I enjoy going to the market myself to cook a light home-cooked meal.",
    focusNoteVi: "Giữ âm «ưa» không tròn môi kèm thanh ngã trong «bữa» (/ɓɯə˧ˀ˥/), tránh đọc thành «bưa» hay «bửa».",
    difficultWords: ["bữa cơm", "thanh đạm", "đi chợ"],
  },

  // ---- ROUTINE ----
  {
    id: "ps-routine-1",
    topicId: "routine",
    textVi: "Mỗi sáng tôi dậy sớm chạy bộ nửa tiếng rồi mới chuẩn bị đi làm.",
    ipaGuide: "/moj˧ˀ˥ saːŋ˧˥ toj˧˧ zəj˧˨ʔ səːm˧˥ tɕaj˧˨ʔ ɓo˧˨ʔ nɯə˧˩˧ tiəŋ˧˥ zoj˨˩ məːj˧˥ tɕwən˧˩˧ ɓi˧˨ʔ ɗi˧˧ laːm˨˩/",
    meaningEn: "Every morning I wake up early to jog for half an hour before getting ready for work.",
    focusNoteVi: "Chú ý thanh ngã ở «mỗi», thanh hỏi ở «nửa» và «chuẩn» — đọc rõ nhưng vẫn liền mạch.",
    difficultWords: ["mỗi sáng", "nửa tiếng", "chuẩn bị"],
  },
  {
    id: "ps-routine-2",
    topicId: "routine",
    textVi: "Hôm nào phải tăng ca thì tôi tranh thủ đặt đồ ăn nhẹ từ năm giờ chiều.",
    ipaGuide: "/hom˧˧ naːw˨˩ faːj˧˩˧ taŋ˧˧ kaː˧˧ tʰi˨˩ toj˧˧ tɕaɲ˧˧ tʰu˧˩˧ ɗat˧˨ʔ ɗo˨˩ an˧˧ ɲɛ˧˨ʔ tɯ˨˩ nam˧˧ zəː˨˩ tɕiəw˨˩/",
    meaningEn: "Whenever I have to work overtime, I make sure to order a light meal around 5 p.m.",
    focusNoteVi: "Giữ độ bật hơi của phụ âm «th» trong «thì», «thủ» và âm cuối tắc rõ ở «đặt».",
    difficultWords: ["tăng ca", "tranh thủ", "đặt đồ ăn"],
  },
  {
    id: "ps-routine-3",
    topicId: "routine",
    textVi: "Rời nhà trước bảy giờ rưỡi giúp mình tránh được cảnh tắc đường giờ cao điểm.",
    ipaGuide: "/zəːj˨˩ ɲaː˨˩ tɕɯək˧˥ ɓaj˧˩˧ zəː˨˩ zɯəj˧ˀ˥ zup˧˥ mɪŋ˨˩ tɕaɲ˧˥ ɗɯək˧˨ʔ kaɲ˧˩˧ tak˧˥ ɗɯəŋ˨˩ zəː˨˩ kaːw˧˧ ɗiəm˧˩˧/",
    meaningEn: "Leaving home before 7:30 helps me avoid rush-hour traffic jams.",
    focusNoteVi: "Phân biệt thanh hỏi ở «bảy» và thanh ngã ở «rưỡi» (/zɯəj˧ˀ˥/) — rất hay dùng khi nói giờ giấc.",
    difficultWords: ["bảy giờ rưỡi", "tắc đường", "giờ cao điểm"],
  },

  // ---- WEATHER ----
  {
    id: "ps-weather-1",
    topicId: "weather",
    textVi: "Mấy hôm nay trời Hà Nội nồm ẩm quá, sàn nhà lúc nào cũng trơn ướt.",
    ipaGuide: "/məj˧˥ hom˧˧ naj˧˧ tɕəːj˨˩ haː˨˩ noj˧˨ʔ nom˨˩ əm˧˩˧ kwaː˧˥ saːn˨˩ ɲaː˨˩ luk͡p˧˥ naːw˨˩ kuŋ͡m˧ˀ˥ tɕəːn˧˧ ɯət˧˥/",
    meaningEn: "Hanoi has been so clammy these past few days that the floor feels slippery and damp nonstop.",
    focusNoteVi: "Chú ý thanh hỏi ở «ẩm», thanh ngã ở «cũng» và nguyên âm đôi «ươ» không tròn môi ở «ướt».",
    difficultWords: ["nồm ẩm", "trơn ướt", "cũng"],
  },
  {
    id: "ps-weather-2",
    topicId: "weather",
    textVi: "Sáng sớm se lạnh nhưng đến trưa trời hửng nắng và mát mẻ hơn nhiều.",
    ipaGuide: "/saːŋ˧˥ səːm˧˥ sɛ˧˧ laɲ˧˨ʔ ɲɯŋ˧˧ ɗen˧˥ tɕɯə˧˧ tɕəːj˨˩ hɯŋ˧˩˧ naŋ˧˥ vaː˨˩ maːt˧˥ mɛ˧˩˧ həːn˧˧ ɲiəw˨˩/",
    meaningEn: "Early morning is mildly chilly, yet by noon the sun peeks out and it's much more pleasant.",
    focusNoteVi: "Luyện âm «ư» kèm thanh hỏi trong «hửng» và sự tương phản thanh sắc – hỏi ở «mát mẻ».",
    difficultWords: ["se lạnh", "hửng nắng", "mát mẻ"],
  },
  {
    id: "ps-weather-3",
    topicId: "weather",
    textVi: "Chiều nay dự báo có mưa rào bất chợt, cậu nhớ mang theo áo mưa kẻo ướt nhé.",
    ipaGuide: "/tɕiəw˨˩ naj˧˧ zɯ˧˨ʔ ɓaːw˧˥ kɔ˧˥ mɯə˧˧ zaːw˨˩ ɓət˧˥ tɕəːt˧˨ʔ kəw˧˨ʔ ɲəː˧˥ maːŋ˧˧ tʰɛw˧˧ aːw˧˥ mɯə˧˧ kɛw˧˩˧ ɯət˧˥ ɲɛ˧˥/",
    meaningEn: "Sudden showers are forecast this afternoon, so remember to pack a raincoat so you don't get soaked.",
    focusNoteVi: "Giữ rõ nguyên âm «ưa» trong «mưa» và thanh hỏi dứt khoát ở «kẻo» (/kɛw˧˩˧/).",
    difficultWords: ["dự báo", "bất chợt", "kẻo ướt"],
  },

  // ---- EMOTIONS ----
  {
    id: "ps-emotions-1",
    topicId: "emotions",
    textVi: "Hoàn thành xong buổi thuyết trình lớn, mình thở phào nhẹ nhõm cả người.",
    ipaGuide: "/hwaːn˨˩ tʰaɲ˨˩ sɔŋ͡m˧˧ ɓuəj˧˩˧ tʰwiət˧˥ tɕɪŋ˨˩ ləːn˧˥ mɪŋ˨˩ tʰəː˧˩˧ faːw˨˩ ɲɛ˧˨ʔ ɲɔm˧ˀ˥ kaː˧˩˧ ŋɯəj˨˩/",
    meaningEn: "After finishing the big presentation, I breathed a huge sigh of relief.",
    focusNoteVi: "Chú ý cụm «thở phào nhẹ nhõm»: hạ giọng ở «thở» (hỏi), thấp dần ở «phào» (huyền), ngắt mạnh rồi vút ở «nhõm» (ngã).",
    difficultWords: ["thuyết trình", "thở phào", "nhẹ nhõm"],
  },
  {
    id: "ps-emotions-2",
    topicId: "emotions",
    textVi: "Tuần trước dồn quá nhiều việc nên mình hơi kiệt sức và mất ngủ hai đêm.",
    ipaGuide: "/twən˨˩ tɕɯək˧˥ zon˨˩ kwaː˧˥ ɲiəw˨˩ viək˧˨ʔ nen˧˧ mɪŋ˨˩ həːj˧˧ kiət˧˨ʔ sɯk˧˥ vaː˨˩ mət˧˥ ŋu˧˩˧ haːj˧˧ ɗem˧˧/",
    meaningEn: "So much work piled up last week that I got burned out and lost sleep for two nights.",
    focusNoteVi: "Đọc dứt khoát các âm tiết khép bằng /-t, -k/ như «kiệt», «sức», «mất».",
    difficultWords: ["kiệt sức", "mất ngủ", "dồn"],
  },
  {
    id: "ps-emotions-3",
    topicId: "emotions",
    textVi: "Mình rất đồng cảm với cảm giác bức bối của cậu lúc này, cứ nghỉ một chút đã nhé.",
    ipaGuide: "/mɪŋ˨˩ zət˧˥ ɗəwŋ͡m˨˩ kaːm˧˩˧ vəːj˧˥ kaːm˧˩˧ zaːk˧˥ ɓɯk˧˥ ɓoj˧˥ kuə˧˩˧ kəw˧˨ʔ luk͡p˧˥ naj˨˩ kɯ˧˥ ŋi˧˩˧ mot˧˨ʔ tɕut˧˥ ɗaː˧ˀ˥ ɲɛ˧˥/",
    meaningEn: "I really empathize with how frustrated you feel right now; just take a short break first.",
    focusNoteVi: "Giữ âm điệu ấm áp ở cuối câu với «đã nhé» (ngã → sắc nhẹ) thay vì lên giọng quá gắt.",
    difficultWords: ["đồng cảm", "bức bối", "đã nhé"],
  },

  // ---- OPINIONS ----
  {
    id: "ps-opinions-1",
    topicId: "opinions",
    textVi: "Theo tôi thì làm việc kết hợp giúp vừa linh hoạt vừa giữ được kết nối đồng nghiệp.",
    ipaGuide: "/tʰɛw˧˧ toj˧˧ tʰi˨˩ laːm˨˩ viək˧˨ʔ ket˧˥ həːp˧˨ʔ zup˧˥ vɯə˨˩ lɪŋ˧˧ hwaːt˧˨ʔ vɯə˨˩ zɯ˧ˀ˥ ɗɯək˧˨ʔ ket˧˥ noj˧˥ ɗəwŋ͡m˨˩ ŋiəp˧˨ʔ/",
    meaningEn: "In my view, hybrid work helps keep both flexibility and connection with colleagues.",
    focusNoteVi: "Nhấn nhẹ cấu trúc song song «vừa ... vừa ...» và phân biệt thanh ngã ở «giữ» (/zɯ˧ˀ˥/).",
    difficultWords: ["kết hợp", "linh hoạt", "giữ được"],
  },
  {
    id: "ps-opinions-2",
    topicId: "opinions",
    textVi: "Một mặt thành phố có nhiều cơ hội tốt, mặt khác chi phí sinh hoạt lại khá cao.",
    ipaGuide: "/mot˧˨ʔ mat˧˨ʔ tʰaɲ˨˩ fo˧˥ kɔ˧˥ ɲiəw˨˩ kəː˧˧ hoj˧˨ʔ tot˧˥ mat˧˨ʔ xaːk˧˥ tɕi˧˧ fi˧˥ sɪŋ˧˧ hwaːt˧˨ʔ laːj˧˨ʔ xaː˧˥ kaːw˧˧/",
    meaningEn: "On one hand the city offers great opportunities; on the other hand living costs are quite high.",
    focusNoteVi: "Ngắt nhịp rõ ở dấu phẩy giữa «Một mặt...» và «mặt khác...» để câu lập luận mạch lạc.",
    difficultWords: ["Một mặt", "mặt khác", "chi phí sinh hoạt"],
  },
  {
    id: "ps-opinions-3",
    topicId: "opinions",
    textVi: "Tôi hoàn toàn đồng tình với đề xuất này, tuy nhiên chúng ta nên cân nhắc thêm về ngân sách.",
    ipaGuide: "/toj˧˧ hwaːn˨˩ twaːn˨˩ ɗəwŋ͡m˨˩ tɪŋ˨˩ vəːj˧˥ ɗe˨˩ swət˧˥ naj˨˩ twi˧˧ ɲiən˧˧ tɕuŋ͡m˧˥ taː˧˧ nen˧˧ kən˧˧ ɲak˧˥ tʰem˧˧ ve˨˩ ŋən˧˧ sajk̟˧˥/",
    meaningEn: "I completely agree with this proposal; however, we should consider the budget more carefully.",
    focusNoteVi: "Đọc mượt chuỗi bốn thanh huyền «hoàn toàn đồng tình» rồi chuyển giọng rõ sang «tuy nhiên».",
    difficultWords: ["đồng tình", "tuy nhiên", "cân nhắc"],
  },
];
