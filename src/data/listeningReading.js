/**
 * Pre-Intermediate (A2-B1) Adult Vietnamese Listening, Reading, and Sentence Builder Content:
 * - LISTENING_EXERCISES: 18 exercises (3 per topic: comprehension, best-response, fill-blank)
 * - READING_PASSAGES: 6 realistic adult texts (1 per topic, 8-12 verbatim glossary entries, 3 questions each)
 * - SENTENCE_BUILDERS: 18 natural sentences (3 per topic) where chunks.join(" ") === targetSentenceVi
 */

export const LISTENING_EXERCISES = [
  // =========================================================================
  // 1. SELF (Bản thân & Cuộc sống)
  // =========================================================================
  {
    id: "le-self-1",
    topicId: "self",
    type: "comprehension",
    titleVi: "Gặp đồng nghiệp mới ở buổi cà phê sáng",
    speakerLabel: "Nam · Chuyên viên phân tích dữ liệu",
    audioTextVi:
      "Chào mọi người, mình là Nam. Quê gốc mình ở Đà Nẵng nhưng mình ra Hà Nội học đại học rồi ở lại làm việc được gần năm năm rồi. Trước đây mình học chuyên ngành tài chính, nhưng hai năm gần đây mình chuyển hẳn sang phân tích dữ liệu.",
    transcriptVi:
      "Chào mọi người, mình là Nam. Quê gốc mình ở Đà Nẵng nhưng mình ra Hà Nội học đại học rồi ở lại làm việc được gần năm năm rồi. Trước đây mình học chuyên ngành tài chính, nhưng hai năm gần đây mình chuyển hẳn sang phân tích dữ liệu.",
    translationEn:
      "Hi everyone, I'm Nam. My hometown is Da Nang, though I moved up to Hanoi for college and have stayed here working for nearly five years. I originally majored in finance, but over the past two years I switched completely to data analytics.",
    questionVi: "Hiện tại anh Nam đang làm công việc thuộc lĩnh vực nào?",
    options: [
      {
        id: "a",
        textVi: "Phân tích dữ liệu",
        explanationVi: "Chính xác! Nam nói: «hai năm gần đây mình chuyển hẳn sang phân tích dữ liệu».",
      },
      {
        id: "b",
        textVi: "Tài chính ngân hàng tại Đà Nẵng",
        explanationVi: "Chưa đúng — tài chính là chuyên ngành đại học trước đây của Nam, còn hiện tại anh sống ở Hà Nội.",
      },
      {
        id: "c",
        textVi: "Giảng dạy đại học ở Hà Nội",
        explanationVi: "Không phải — Nam ra Hà Nội học đại học rồi ở lại đi làm, không phải làm giảng viên.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Chú ý cụm «trước đây ... nhưng hai năm gần đây» để phân biệt quá khứ và hiện tại.",
    keyVocab: [
      { word: "quê gốc", meaning: "ancestral hometown" },
      { word: "chuyên ngành", meaning: "academic major" },
      { word: "chuyển hẳn sang", meaning: "switch completely over to" },
    ],
  },
  {
    id: "le-self-2",
    topicId: "self",
    type: "best-response",
    titleVi: "Trả lời câu hỏi về cuộc sống ngoài giờ làm",
    speakerLabel: "Chị Thảo · Quản lý dự án",
    audioTextVi:
      "Nghe bảo em mới chuyển từ công ty cũ sang đây được hai tháng. Dạo này nhịp sống và công việc ở nhóm mới có giúp em cân bằng hơn trước không?",
    transcriptVi:
      "Nghe bảo em mới chuyển từ công ty cũ sang đây được hai tháng. Dạo này nhịp sống và công việc ở nhóm mới có giúp em cân bằng hơn trước không?",
    translationEn:
      "I heard you just moved over here from your previous company two months ago. Lately, have the pace of life and work on the new team helped you feel more balanced than before?",
    questionVi: "Câu phản hồi nào tự nhiên và đúng trọng tâm nhất?",
    options: [
      {
        id: "a",
        textVi: "Dạ có chị ạ, giờ làm ở đây linh hoạt hơn nên tối em vẫn kịp đi chạy bộ và nấu cơm.",
        explanationVi: "Rất tự nhiên! Trả lời trực tiếp bằng «Dạ có chị ạ» và nêu ví dụ cụ thể về cân bằng cuộc sống.",
      },
      {
        id: "b",
        textVi: "Quê em ở Hải Phòng và nhà em có bốn người tất cả.",
        explanationVi: "Lạc đề — chị Thảo hỏi về sự cân bằng cuộc sống ở công việc mới, không hỏi về quê hay gia đình.",
      },
      {
        id: "c",
        textVi: "Hôm nay trời mát mẻ quá chị nhỉ, chiều chắc không mưa đâu.",
        explanationVi: "Chuyển đề tài đột ngột, không trả lời câu hỏi của đồng nghiệp.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Lắng nghe từ khóa «nhịp sống» và «cân bằng hơn trước không».",
    keyVocab: [
      { word: "nhịp sống", meaning: "pace of life" },
      { word: "cân bằng", meaning: "balanced" },
      { word: "linh hoạt", meaning: "flexible" },
    ],
  },
  {
    id: "le-self-3",
    topicId: "self",
    type: "fill-blank",
    titleVi: "Điền từ còn thiếu về tính cách",
    speakerLabel: "Linh · Biên tập viên",
    audioTextVi:
      "Nhìn bề ngoài mình có vẻ hơi hướng nội, nhưng làm việc chung một thời gian bạn sẽ thấy mình khá hòa đồng và thích lắng nghe.",
    transcriptVi:
      "Nhìn bề ngoài mình có vẻ hơi hướng nội, nhưng làm việc chung một thời gian bạn sẽ thấy mình khá hòa đồng và thích lắng nghe.",
    translationEn:
      "On the surface I might seem a bit introverted, but after working together for a while you'll see I'm quite sociable and love listening.",
    questionVi:
      "Nghe và chọn từ đúng điền vào chỗ trống: «Nhìn bề ngoài mình có vẻ hơi hướng nội, nhưng làm việc chung một thời gian bạn sẽ thấy mình khá _____ và thích lắng nghe.»",
    options: [
      {
        id: "a",
        textVi: "hòa đồng",
        explanationVi: "Chính xác! «Hòa đồng» nghĩa là dễ gần, hòa nhập tốt với mọi người.",
      },
      {
        id: "b",
        textVi: "hợp đồng",
        explanationVi: "Nhầm âm gần giống — «hợp đồng» nghĩa là contract, không chỉ tính cách.",
      },
      {
        id: "c",
        textVi: "hoạt động",
        explanationVi: "Không khớp với âm thanh và ngữ pháp sau «khá» trong câu này.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Cả hai âm tiết của từ cần điền đều mang thanh huyền (giọng trầm và đều).",
    keyVocab: [
      { word: "nhìn bề ngoài", meaning: "on the surface / at first glance" },
      { word: "hướng nội", meaning: "introverted" },
      { word: "hòa đồng", meaning: "sociable / easygoing" },
    ],
  },

  // =========================================================================
  // 2. FOOD (Ẩm thực & Sở thích ăn uống)
  // =========================================================================
  {
    id: "le-food-1",
    topicId: "food",
    type: "comprehension",
    titleVi: "Gợi ý quán ăn trưa gần văn phòng",
    speakerLabel: "Huy · Đồng nghiệp",
    audioTextVi:
      "Trưa nay mình định rủ mấy anh chị ra quán bún chả mới mở đầu phố. Nghe bảo thịt nướng ở đó ướp đậm đà, nước chấm pha vừa miệng chứ không bị quá ngọt, lại có thêm nhiều rau sống nên ăn đỡ ngấy lắm.",
    transcriptVi:
      "Trưa nay mình định rủ mấy anh chị ra quán bún chả mới mở đầu phố. Nghe bảo thịt nướng ở đó ướp đậm đà, nước chấm pha vừa miệng chứ không bị quá ngọt, lại có thêm nhiều rau sống nên ăn đỡ ngấy lắm.",
    translationEn:
      "For lunch today I'm thinking of inviting folks to the newly opened bun cha spot at the top of the street. Word is their grilled pork is richly marinated, the dipping sauce is balanced rather than overly sweet, and they give plenty of fresh herbs so it doesn't feel greasy.",
    questionVi: "Theo anh Huy, lý do nào khiến món bún chả ở quán mới ăn đỡ ngấy?",
    options: [
      {
        id: "a",
        textVi: "Quán cho nhiều rau sống ăn kèm",
        explanationVi: "Chính xác! Huy nhắc: «có thêm nhiều rau sống nên ăn đỡ ngấy lắm».",
      },
      {
        id: "b",
        textVi: "Quán chỉ bán món chay không có thịt",
        explanationVi: "Sai — quán bán bún chả với thịt nướng ướp đậm đà.",
      },
      {
        id: "c",
        textVi: "Nước chấm ở quán pha rất ngọt",
        explanationVi: "Ngược lại — Huy khen nước chấm «vừa miệng chứ không bị quá ngọt».",
      },
    ],
    correctOptionId: "a",
    hintVi: "Nghe kỹ vế cuối câu ngay trước cụm «nên ăn đỡ ngấy lắm».",
    keyVocab: [
      { word: "đậm đà", meaning: "rich and flavorful" },
      { word: "vừa miệng", meaning: "seasoned just right" },
      { word: "đỡ ngấy", meaning: "less greasy / less heavy" },
    ],
  },
  {
    id: "le-food-2",
    topicId: "food",
    type: "best-response",
    titleVi: "Đặt đồ uống ở quán cà phê specialty",
    speakerLabel: "Nhân viên pha chế",
    audioTextVi:
      "Dạ anh chị muốn dùng cà phê phin truyền thống hay cà phê pha máy ạ? Bên em có thể điều chỉnh độ ngọt và lượng đá theo khẩu vị của mình.",
    transcriptVi:
      "Dạ anh chị muốn dùng cà phê phin truyền thống hay cà phê pha máy ạ? Bên em có thể điều chỉnh độ ngọt và lượng đá theo khẩu vị của mình.",
    translationEn:
      "Would you like traditional drip coffee or espresso-machine coffee? We can adjust the sweetness and ice level to suit your taste.",
    questionVi: "Cách gọi món nào tự nhiên và đầy đủ nhất?",
    options: [
      {
        id: "a",
        textVi: "Cho mình một ly cà phê phin sữa đá, ít ngọt và ít đá nhé.",
        explanationVi: "Chuẩn xác và tự nhiên như người bản xứ gọi đồ uống ở quán.",
      },
      {
        id: "b",
        textVi: "Mình đang đi bộ qua công viên nên không cần gọi món.",
        explanationVi: "Không hợp bối cảnh đang đứng gọi nước trước quầy pha chế.",
      },
      {
        id: "c",
        textVi: "Cà phê ở đây rất đắt nhưng mình không thích thời tiết hôm nay.",
        explanationVi: "Lạc đề và thiếu lịch sự khi giao tiếp với nhân viên.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Chọn câu trả lời có nêu loại cà phê và mức độ ngọt/đá theo gợi ý của nhân viên.",
    keyVocab: [
      { word: "cà phê phin", meaning: "Vietnamese drip coffee" },
      { word: "điều chỉnh", meaning: "to adjust" },
      { word: "khẩu vị", meaning: "personal palate / taste" },
    ],
  },
  {
    id: "le-food-3",
    topicId: "food",
    type: "fill-blank",
    titleVi: "Điền từ về chế độ ăn uống",
    speakerLabel: "Trang · Kiến trúc sư",
    audioTextVi:
      "Hôm nay đi ăn nhóm mình nhớ dặn nhà hàng làm riêng một đĩa đậu phụ sốt nấm, vì anh Minh bị dị ứng hải sản nặng lắm.",
    transcriptVi:
      "Hôm nay đi ăn nhóm mình nhớ dặn nhà hàng làm riêng một đĩa đậu phụ sốt nấm, vì anh Minh bị dị ứng hải sản nặng lắm.",
    translationEn:
      "For our group dinner today, remember to ask the restaurant to make a separate plate of mushroom tofu, because Minh has a severe seafood allergy.",
    questionVi:
      "Điền cụm từ bạn nghe được: «...vì anh Minh bị _____ hải sản nặng lắm.»",
    options: [
      {
        id: "a",
        textVi: "dị ứng",
        explanationVi: "Chính xác! «Bị dị ứng + [thực phẩm]» là cách nói chuẩn về dị ứng đồ ăn.",
      },
      {
        id: "b",
        textVi: "di chuyển",
        explanationVi: "Không khớp âm thanh và sai nghĩa trong ngữ cảnh ẩm thực.",
      },
      {
        id: "c",
        textVi: "dự định",
        explanationVi: "«Dự định» nghĩa là kế hoạch/ý định, không đi sau «bị».",
      },
    ],
    correctOptionId: "a",
    hintVi: "Cụm từ bắt đầu bằng «dị» (thanh nặng) chỉ phản ứng của cơ thể với thực phẩm.",
    keyVocab: [
      { word: "dặn nhà hàng", meaning: "instruct / remind the restaurant" },
      { word: "dị ứng hải sản", meaning: "seafood allergy" },
    ],
  },

  // =========================================================================
  // 3. ROUTINE (Sinh hoạt hằng ngày)
  // =========================================================================
  {
    id: "le-routine-1",
    topicId: "routine",
    type: "comprehension",
    titleVi: "Thay đổi lịch sinh hoạt để tránh tắc đường",
    speakerLabel: "Đức · Kỹ sư phần mềm",
    audioTextVi:
      "Từ đầu tháng này mình đổi thói quen dậy lúc sáu giờ kém mười lăm. Mình đi tập thể dục gần nhà bốn mươi phút rồi mới ra khỏi nhà lúc bảy giờ hai mươi. Nhờ vậy mình vừa tránh được tắc đường giờ cao điểm vừa có tinh thần tỉnh táo cả buổi sáng.",
    transcriptVi:
      "Từ đầu tháng này mình đổi thói quen dậy lúc sáu giờ kém mười lăm. Mình đi tập thể dục gần nhà bốn mươi phút rồi mới ra khỏi nhà lúc bảy giờ hai mươi. Nhờ vậy mình vừa tránh được tắc đường giờ cao điểm vừa có tinh thần tỉnh táo cả buổi sáng.",
    translationEn:
      "Since the start of this month I changed my routine to wake up at 5:45. I work out near home for forty minutes before leaving at 7:20. Thanks to that, I both avoid rush-hour traffic and feel sharp all morning.",
    questionVi: "Anh Đức bắt đầu thức dậy vào mấy giờ theo lịch mới?",
    options: [
      {
        id: "a",
        textVi: "5 giờ 45 phút sáng",
        explanationVi: "Chính xác! «Sáu giờ kém mười lăm» chính là 5:45 sáng.",
      },
      {
        id: "b",
        textVi: "6 giờ 15 phút sáng",
        explanationVi: "Nhầm «kém» với «hơn» — «sáu giờ kém mười lăm» là còn 15 phút nữa mới đến 6 giờ.",
      },
      {
        id: "c",
        textVi: "7 giờ 20 phút sáng",
        explanationVi: "7:20 là lúc anh Đức ra khỏi nhà đi làm, sau khi đã tập thể dục xong.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Nghe kỹ cách nói giờ «sáu giờ kém mười lăm».",
    keyVocab: [
      { word: "kém mười lăm", meaning: "quarter to (an hour)" },
      { word: "tắc đường", meaning: "traffic jam" },
      { word: "tỉnh táo", meaning: "alert / clear-headed" },
    ],
  },
  {
    id: "le-routine-2",
    topicId: "routine",
    type: "best-response",
    titleVi: "Hỏi thăm kế hoạch sau giờ tan làm",
    speakerLabel: "Hà · Bạn cùng công ty",
    audioTextVi:
      "Hôm nay cậu có phải tăng ca không? Nếu tan làm đúng giờ thì mình ghé siêu thị rồi đi ăn phở cuốn gần hồ nhé?",
    transcriptVi:
      "Hôm nay cậu có phải tăng ca không? Nếu tan làm đúng giờ thì mình ghé siêu thị rồi đi ăn phở cuốn gần hồ nhé?",
    translationEn:
      "Do you have to work overtime today? If you get off on time, want to swing by the supermarket and grab pho cuon near the lake?",
    questionVi: "Bạn nên đáp lại thế nào cho tự nhiên khi hôm nay bạn có việc bận?",
    options: [
      {
        id: "a",
        textVi: "Tiếc quá, tối nay mình có lịch họp với đối tác hơi muộn, hay mình hẹn sang tối thứ Năm nhé?",
        explanationVi: "Rất khéo léo và tự nhiên: từ chối lịch sự bằng «Tiếc quá», nêu lý do ngắn gọn và đề xuất lịch mới.",
      },
      {
        id: "b",
        textVi: "Mình không bao giờ đi siêu thị vào mùa đông.",
        explanationVi: "Nghe cứng và không trả lời câu hỏi về việc tăng ca hôm nay.",
      },
      {
        id: "c",
        textVi: "Cảm ơn cậu, hôm qua trời mưa rất to nên đường ngập hết.",
        explanationVi: "Lạc đề hoàn toàn khỏi lời rủ đi ăn sau giờ làm.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Khi từ chối lời mời trong tiếng Việt, người trưởng thành thường nêu lý do nhẹ nhàng và gợi ý buổi khác.",
    keyVocab: [
      { word: "tăng ca", meaning: "work overtime" },
      { word: "tan làm đúng giờ", meaning: "get off work on time" },
      { word: "hẹn sang...", meaning: "reschedule to..." },
    ],
  },
  {
    id: "le-routine-3",
    topicId: "routine",
    type: "fill-blank",
    titleVi: "Điền động từ nói về việc tận dụng thời gian",
    speakerLabel: "Quân · Nhân viên truyền thông",
    audioTextVi:
      "Những hôm lịch trình dày đặc, mình hay tranh thủ nghe sách nói trong lúc ngồi tàu điện về nhà.",
    transcriptVi:
      "Những hôm lịch trình dày đặc, mình hay tranh thủ nghe sách nói trong lúc ngồi tàu điện về nhà.",
    translationEn:
      "On days with a packed schedule, I usually make use of my metro ride home to listen to audiobooks.",
    questionVi:
      "Nghe và điền động từ chính xác: «Những hôm lịch trình dày đặc, mình hay _____ nghe sách nói trong lúc ngồi tàu điện về nhà.»",
    options: [
      {
        id: "a",
        textVi: "tranh thủ",
        explanationVi: "Chính xác! «Tranh thủ» nghĩa là tận dụng khéo léo khoảng thời gian ngắn sẵn có.",
      },
      {
        id: "b",
        textVi: "tranh luận",
        explanationVi: "Sai nghĩa — «tranh luận» nghĩa là debate/argue.",
      },
      {
        id: "c",
        textVi: "trang trí",
        explanationVi: "Sai âm và sai nghĩa — «trang trí» nghĩa là decorate.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Tiếng thứ hai mang thanh hỏi (/tʰu˧˩˧/).",
    keyVocab: [
      { word: "lịch trình dày đặc", meaning: "packed schedule" },
      { word: "tranh thủ", meaning: "squeeze in / make use of spare time" },
      { word: "sách nói", meaning: "audiobook" },
    ],
  },

  // =========================================================================
  // 4. WEATHER (Thời tiết & Khí hậu)
  // =========================================================================
  {
    id: "le-weather-1",
    topicId: "weather",
    type: "comprehension",
    titleVi: "So sánh thời tiết hai miền cuối tuần",
    speakerLabel: "Vy · Chuyên viên kinh doanh",
    audioTextVi:
      "Tuần sau mình bay ra Hà Nội công tác ba ngày. Xem dự báo thời tiết thấy ngoài đó đang giao mùa, sáng sớm hơi se lạnh khoảng mười chín độ nhưng trưa lại hửng nắng. Khác hẳn Sài Gòn mấy hôm nay cứ bốn giờ chiều là đổ mưa rào bất chợt.",
    transcriptVi:
      "Tuần sau mình bay ra Hà Nội công tác ba ngày. Xem dự báo thời tiết thấy ngoài đó đang giao mùa, sáng sớm hơi se lạnh khoảng mười chín độ nhưng trưa lại hửng nắng. Khác hẳn Sài Gòn mấy hôm nay cứ bốn giờ chiều là đổ mưa rào bất chợt.",
    translationEn:
      "Next week I'm flying up to Hanoi for a three-day business trip. Checking the forecast, it's in seasonal transition up there — crisp around 19°C in the early morning, then sunny by noon. Totally different from Saigon lately, where sudden downpours hit every day right at 4 p.m.",
    questionVi: "Theo dự báo chị Vy xem, thời tiết Hà Nội tuần sau như thế nào?",
    options: [
      {
        id: "a",
        textVi: "Sáng sớm se lạnh, đến trưa hửng nắng",
        explanationVi: "Chính xác! Vy mô tả: «sáng sớm hơi se lạnh khoảng mười chín độ nhưng trưa lại hửng nắng».",
      },
      {
        id: "b",
        textVi: "Ngày nào bốn giờ chiều cũng mưa rào lớn",
        explanationVi: "Nhầm địa điểm — đó là thời tiết ở Sài Gòn mấy hôm nay.",
      },
      {
        id: "c",
        textVi: "Nóng oi bức gần bốn mươi độ cả ngày",
        explanationVi: "Không có thông tin này trong đoạn nghe; nhiệt độ sáng chỉ khoảng 19 độ.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Phân biệt thông tin về «ngoài đó» (Hà Nội) và «Sài Gòn».",
    keyVocab: [
      { word: "giao mùa", meaning: "seasonal transition" },
      { word: "se lạnh", meaning: "mildly chilly / crisp" },
      { word: "hửng nắng", meaning: "for the sun to break out" },
    ],
  },
  {
    id: "le-weather-2",
    topicId: "weather",
    type: "best-response",
    titleVi: "Điều chỉnh kế hoạch dã ngoại vì thời tiết",
    speakerLabel: "Tuấn · Bạn thân",
    audioTextVi:
      "Cậu ơi, dự báo bảo sáng Chủ nhật có mưa to kèm gió mạnh đấy. Mình giữ nguyên kế hoạch đạp xe ở công viên hay chuyển sang phương án trong nhà?",
    transcriptVi:
      "Cậu ơi, dự báo bảo sáng Chủ nhật có mưa to kèm gió mạnh đấy. Mình giữ nguyên kế hoạch đạp xe ở công viên hay chuyển sang phương án trong nhà?",
    translationEn:
      "Hey, the forecast says Sunday morning will have heavy rain and strong wind. Should we keep our park cycling plan or switch to an indoor option?",
    questionVi: "Câu trả lời nào hợp lý và tự nhiên nhất?",
    options: [
      {
        id: "a",
        textVi: "Thôi mưa gió thế đạp xe không an toàn đâu, hay mình dời sang tuần sau rồi Chủ nhật này đi bảo tàng và cà phê nhé.",
        explanationVi: "Rất tự nhiên! Thể hiện sự linh hoạt, lý do rõ ràng và gợi ý phương án trong nhà cụ thể.",
      },
      {
        id: "b",
        textVi: "Xe đạp của mình màu xanh dương và mua từ hai năm trước.",
        explanationVi: "Không trả lời câu hỏi về việc đổi kế hoạch Chủ nhật.",
      },
      {
        id: "c",
        textVi: "Ở miền Bắc có bốn mùa là xuân, hạ, thu, đông.",
        explanationVi: "Quá sách vở và không liên quan tới buổi hẹn sắp tới.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Tìm câu có cách bàn bạc điều chỉnh kế hoạch («dời sang...» / chọn hoạt động trong nhà).",
    keyVocab: [
      { word: "giữ nguyên kế hoạch", meaning: "keep the original plan" },
      { word: "phương án trong nhà", meaning: "indoor option" },
      { word: "dời sang tuần sau", meaning: "postpone to next week" },
    ],
  },
  {
    id: "le-weather-3",
    topicId: "weather",
    type: "fill-blank",
    titleVi: "Điền tính từ tả độ ẩm đặc trưng miền Bắc",
    speakerLabel: "Chị Mai · Người Hà Nội",
    audioTextVi:
      "Tháng Ba ở Hà Nội trời nồm ẩm đến mức gương trong nhà tắm lúc nào cũng mờ hơi nước, quần áo phơi ba ngày chưa khô.",
    transcriptVi:
      "Tháng Ba ở Hà Nội trời nồm ẩm đến mức gương trong nhà tắm lúc nào cũng mờ hơi nước, quần áo phơi ba ngày chưa khô.",
    translationEn:
      "In March, Hanoi gets so clammy and humid that the bathroom mirror is constantly fogged up and laundry still isn't dry after three days.",
    questionVi:
      "Nghe và điền cụm từ tả thời tiết: «Tháng Ba ở Hà Nội trời _____ đến mức gương trong nhà tắm lúc nào cũng mờ hơi nước...»",
    options: [
      {
        id: "a",
        textVi: "nồm ẩm",
        explanationVi: "Chính xác! «Nồm ẩm» là hiện tượng độ ẩm rất cao đặc trưng đầu xuân miền Bắc.",
      },
      {
        id: "b",
        textVi: "nóng ấm",
        explanationVi: "Sai âm và sai hiện tượng — «nóng ấm» không gây đọng hơi nước trên gương và sàn.",
      },
      {
        id: "c",
        textVi: "hanh khô",
        explanationVi: "Trái nghĩa hoàn toàn — «hanh khô» là trời khô ráo, quần áo khô rất nhanh.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Nghe âm thanh huyền + hỏi ở cụm từ mô tả thời tiết ẩm ướt tháng Ba.",
    keyVocab: [
      { word: "nồm ẩm", meaning: "clammy and extremely humid" },
      { word: "mờ hơi nước", meaning: "fogged up with condensation" },
      { word: "phơi quần áo", meaning: "hang laundry to dry" },
    ],
  },

  // =========================================================================
  // 5. EMOTIONS (Cảm xúc & Trạng thái)
  // =========================================================================
  {
    id: "le-emotions-1",
    topicId: "emotions",
    type: "comprehension",
    titleVi: "Tâm sự sau khi chốt xong dự án lớn",
    speakerLabel: "Khánh · Trưởng nhóm thiết kế",
    audioTextVi:
      "Thật lòng mà nói, hai tuần vừa rồi mình căng thẳng đến mức gần như kiệt sức vì khách hàng đổi yêu cầu liên tục. May mà sáng nay bản thiết kế cuối cùng đã được duyệt, mình mới thở phào nhẹ nhõm được một chút.",
    transcriptVi:
      "Thật lòng mà nói, hai tuần vừa rồi mình căng thẳng đến mức gần như kiệt sức vì khách hàng đổi yêu cầu liên tục. May mà sáng nay bản thiết kế cuối cùng đã được duyệt, mình mới thở phào nhẹ nhõm được một chút.",
    translationEn:
      "Honestly, these past two weeks I was so stressed I nearly burned out because the client kept changing requirements. Luckily the final design got approved this morning, so I can finally breathe a little sigh of relief.",
    questionVi: "Vì sao sáng nay anh Khánh cảm thấy nhẹ nhõm hơn?",
    options: [
      {
        id: "a",
        textVi: "Vì bản thiết kế cuối cùng đã được khách hàng duyệt",
        explanationVi: "Chính xác! Khánh nói rõ: «sáng nay bản thiết kế cuối cùng đã được duyệt, mình mới thở phào nhẹ nhõm».",
      },
      {
        id: "b",
        textVi: "Vì anh ấy vừa xin nghỉ việc ở công ty",
        explanationVi: "Không có thông tin xin nghỉ việc trong đoạn nghe.",
      },
      {
        id: "c",
        textVi: "Vì khách hàng vừa gửi thêm yêu cầu mới",
        explanationVi: "Ngược lại — việc đổi yêu cầu liên tục là nguyên nhân khiến anh kiệt sức suốt hai tuần qua.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Nghe phần sau từ «May mà sáng nay...».",
    keyVocab: [
      { word: "thật lòng mà nói", meaning: "to be honest" },
      { word: "kiệt sức", meaning: "burned out / exhausted" },
      { word: "thở phào nhẹ nhõm", meaning: "breathe a sigh of relief" },
    ],
  },
  {
    id: "le-emotions-2",
    topicId: "emotions",
    type: "best-response",
    titleVi: "Phản hồi đồng cảm khi bạn gặp áp lực",
    speakerLabel: "Ngọc · Bạn thân",
    audioTextVi:
      "Mấy hôm nay mình hơi chạnh lòng và áp lực cậu ạ. Nhìn bạn bè xung quanh ai cũng thăng tiến nhanh, còn mình vẫn đang loay hoay tìm hướng đi mới.",
    transcriptVi:
      "Mấy hôm nay mình hơi chạnh lòng và áp lực cậu ạ. Nhìn bạn bè xung quanh ai cũng thăng tiến nhanh, còn mình vẫn đang loay hoay tìm hướng đi mới.",
    translationEn:
      "These past few days I've been feeling a bit down and pressured. Seeing friends around me advance so fast while I'm still figuring out my next direction.",
    questionVi: "Lời đáp nào thể hiện sự đồng cảm tinh tế và ấm áp nhất?",
    options: [
      {
        id: "a",
        textVi: "Mình hiểu cảm giác đó mà, ai cũng có nhịp đi riêng của mình. Đừng tự tạo áp lực quá nhé, tối nay ra quán quen ngồi nói chuyện chút không?",
        explanationVi: "Rất tinh tế: công nhận cảm xúc trước («Mình hiểu cảm giác đó mà»), an ủi nhẹ nhàng và rủ gặp mặt.",
      },
      {
        id: "b",
        textVi: "Cậu nghĩ nhiều quá thôi, có gì đâu mà phải buồn.",
        explanationVi: "Phủ nhận cảm xúc của bạn bè, nghe khá lạnh lùng khi họ đang cần được lắng nghe.",
      },
      {
        id: "c",
        textVi: "Tháng sau mình cũng được tăng lương và đi du lịch châu Âu.",
        explanationVi: "Thiếu tinh tế — khoe thành tích ngay lúc bạn đang cảm thấy chạnh lòng.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Tìm câu vừa ghi nhận cảm xúc của Ngọc vừa gợi ý sự đồng hành chân thành.",
    keyVocab: [
      { word: "chạnh lòng", meaning: "feel a pang of sadness / self-conscious" },
      { word: "loay hoay", meaning: "struggling to figure things out" },
      { word: "tự tạo áp lực", meaning: "put pressure on oneself" },
    ],
  },
  {
    id: "le-emotions-3",
    topicId: "emotions",
    type: "fill-blank",
    titleVi: "Điền từ chỉ tâm trạng trước thử thách mới",
    speakerLabel: "Dũng · Chuyên viên sản phẩm",
    audioTextVi:
      "Tuần tới mình bắt đầu đảm nhận vai trò trưởng nhóm. Nói thật là mình hơi hồi hộp nhưng cũng rất hào hứng với chặng đường mới này.",
    transcriptVi:
      "Tuần tới mình bắt đầu đảm nhận vai trò trưởng nhóm. Nói thật là mình hơi hồi hộp nhưng cũng rất hào hứng với chặng đường mới này.",
    translationEn:
      "Next week I start taking on the team lead role. Honestly I'm a bit nervous, yet also really excited for this new chapter.",
    questionVi:
      "Nghe và điền tính từ đúng: «Nói thật là mình hơi hồi hộp nhưng cũng rất _____ với chặng đường mới này.»",
    options: [
      {
        id: "a",
        textVi: "hào hứng",
        explanationVi: "Chính xác! «Hào hứng» diễn tả sự phấn khởi, mong đợi tích cực.",
      },
      {
        id: "b",
        textVi: "hòa thuận",
        explanationVi: "Sai âm và sai nghĩa — «hòa thuận» dùng để tả mối quan hệ gia đình êm ấm.",
      },
      {
        id: "c",
        textVi: "hụt hẫng",
        explanationVi: "Trái sắc thái — «hụt hẫng» nghĩa là cảm giác trống rỗng, thất vọng.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Cụm từ bắt đầu bằng «hào» (thanh huyền) kết hợp «hứng» (thanh sắc).",
    keyVocab: [
      { word: "đảm nhận", meaning: "take on (a role)" },
      { word: "hồi hộp", meaning: "nervous / anticipatory" },
      { word: "hào hứng", meaning: "excited / enthusiastic" },
    ],
  },

  // =========================================================================
  // 6. OPINIONS (Quan điểm cơ bản)
  // =========================================================================
  {
    id: "le-opinions-1",
    topicId: "opinions",
    type: "comprehension",
    titleVi: "Trao đổi về mô hình làm việc kết hợp",
    speakerLabel: "Chị Phương · Trưởng phòng nhân sự",
    audioTextVi:
      "Theo tôi thì làm việc hoàn toàn từ xa rất tiện cho việc tập trung cá nhân; tuy nhiên, khi cần lên ý tưởng mới hoặc hỗ trợ nhân sự mới vào, gặp mặt trực tiếp ở văn phòng vẫn hiệu quả hơn hẳn. Vì vậy tôi ủng hộ mô hình hai ngày ở nhà và ba ngày lên công ty.",
    transcriptVi:
      "Theo tôi thì làm việc hoàn toàn từ xa rất tiện cho việc tập trung cá nhân; tuy nhiên, khi cần lên ý tưởng mới hoặc hỗ trợ nhân sự mới vào, gặp mặt trực tiếp ở văn phòng vẫn hiệu quả hơn hẳn. Vì vậy tôi ủng hộ mô hình hai ngày ở nhà và ba ngày lên công ty.",
    translationEn:
      "In my view, fully remote work is great for individual focus; however, when brainstorming new ideas or onboarding new hires, meeting in person at the office is still noticeably more effective. That's why I favor two days at home and three days at the office.",
    questionVi: "Chị Phương cho rằng gặp mặt trực tiếp ở văn phòng đặc biệt hiệu quả trong tình huống nào?",
    options: [
      {
        id: "a",
        textVi: "Khi lên ý tưởng mới hoặc hỗ trợ nhân sự mới",
        explanationVi: "Chính xác! Chị Phương nêu rõ hai tình huống này ngay sau liên từ «tuy nhiên».",
      },
      {
        id: "b",
        textVi: "Khi cần tiết kiệm thời gian đi lại hằng ngày",
        explanationVi: "Không phải — tiết kiệm đi lại là lợi thế của làm việc từ xa, không được nhắc cho văn phòng.",
      },
      {
        id: "c",
        textVi: "Khi làm các đầu việc cần tập trung cá nhân tuyệt đối",
        explanationVi: "Ngược lại — chị Phương nhận xét làm từ xa tiện cho việc tập trung cá nhân.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Nghe kỹ vế câu theo sau từ nối «tuy nhiên».",
    keyVocab: [
      { word: "tuy nhiên", meaning: "however" },
      { word: "lên ý tưởng", meaning: "brainstorm ideas" },
      { word: "ủng hộ", meaning: "to support / favor" },
    ],
  },
  {
    id: "le-opinions-2",
    topicId: "opinions",
    type: "best-response",
    titleVi: "Phản biện lịch sự về chuyện rời thành phố về quê",
    speakerLabel: "Anh Khoa · Bạn học cũ",
    audioTextVi:
      "Mình thấy nhiều bạn trẻ giờ chỉ muốn rời thành phố lớn về quê sống cho yên bình. Theo cậu thì sống ở quê có thực sự tốt hơn hẳn ở thành phố không?",
    transcriptVi:
      "Mình thấy nhiều bạn trẻ giờ chỉ muốn rời thành phố lớn về quê sống cho yên bình. Theo cậu thì sống ở quê có thực sự tốt hơn hẳn ở thành phố không?",
    translationEn:
      "I notice lots of young people nowadays just want to leave big cities for a peaceful life in the countryside. In your opinion, is living in the countryside truly way better than the city?",
    questionVi: "Câu trả lời nào nêu quan điểm cân bằng và tự nhiên nhất ở trình độ B1?",
    options: [
      {
        id: "a",
        textVi: "Mình nghĩ mỗi nơi có ưu điểm riêng: một mặt ở quê ít áp lực và chi phí thấp, mặt khác thành phố lại có nhiều cơ hội học hỏi và dịch vụ y tế tốt hơn.",
        explanationVi: "Xuất sắc! Phân tích hai chiều bằng «một mặt ..., mặt khác ...» rất mạch lạc và thuyết phục.",
      },
      {
        id: "b",
        textVi: "Sai hoàn toàn, ở quê chán lắm chẳng có gì để làm cả.",
        explanationVi: "Quá cực đoan và thiếu sắc thái trao đổi lịch sự.",
      },
      {
        id: "c",
        textVi: "Hôm qua mình ăn phở bò tái chín ở đầu ngõ rất ngon.",
        explanationVi: "Không liên quan gì đến câu hỏi thảo luận của anh Khoa.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Chọn câu trình bày được cả hai khía cạnh thay vì khẳng định một chiều.",
    keyVocab: [
      { word: "một mặt ... mặt khác", meaning: "on one hand ... on the other hand" },
      { word: "chi phí thấp", meaning: "low cost" },
      { word: "yên bình", meaning: "peaceful" },
    ],
  },
  {
    id: "le-opinions-3",
    topicId: "opinions",
    type: "fill-blank",
    titleVi: "Điền từ nối lập luận hai chiều",
    speakerLabel: "Bình · Nhà nghiên cứu thị trường",
    audioTextVi:
      "Ứng dụng trí tuệ nhân tạo giúp rút ngắn thời gian xử lý dữ liệu; mặt khác, chúng ta vẫn cần kiểm chứng kỹ để tránh sai sót.",
    transcriptVi:
      "Ứng dụng trí tuệ nhân tạo giúp rút ngắn thời gian xử lý dữ liệu; mặt khác, chúng ta vẫn cần kiểm chứng kỹ để tránh sai sót.",
    translationEn:
      "Applying AI helps shorten data-processing time; on the other hand, we still need to verify carefully to avoid errors.",
    questionVi:
      "Nghe và điền cụm từ nối vào chỗ trống: «Ứng dụng trí tuệ nhân tạo giúp rút ngắn thời gian xử lý dữ liệu; _____, chúng ta vẫn cần kiểm chứng kỹ để tránh sai sót.»",
    options: [
      {
        id: "a",
        textVi: "mặt khác",
        explanationVi: "Chính xác! «Mặt khác» (on the other hand) mở ra góc nhìn bổ sung hoặc thận trọng hơn.",
      },
      {
        id: "b",
        textVi: "mặt bằng",
        explanationVi: "Sai nghĩa — «mặt bằng» nghĩa là mặt bằng thuê cửa hàng / mức chung.",
      },
      {
        id: "c",
        textVi: "mất công",
        explanationVi: "Không phải từ nối lập luận; «mất công» nghĩa là tốn công sức.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Cụm hai tiếng mang thanh nặng + thanh sắc, dùng để giới thiệu khía cạnh thứ hai.",
    keyVocab: [
      { word: "rút ngắn", meaning: "to shorten" },
      { word: "mặt khác", meaning: "on the other hand" },
      { word: "kiểm chứng", meaning: "to verify / fact-check" },
    ],
  },
];

export const READING_PASSAGES = [
  // =========================================================================
  // 1. SELF — Social / Professional Bio
  // =========================================================================
  {
    id: "rp-self-1",
    topicId: "self",
    titleVi: "Hồ sơ giới thiệu — Minh Anh, Chuyên viên Thiết kế Sản phẩm",
    formatLabel: "Hồ sơ cá nhân · Mạng nghề nghiệp",
    paragraphs: [
      "Xin chào mọi người, mình là Minh Anh, hiện đang sống và làm việc tại Thành phố Hồ Chí Minh. Quê gốc của mình ở Huế, nhưng mình đã tự lập từ năm mười tám tuổi khi vào Nam học đại học. Ban đầu mình theo học chuyên ngành quản trị kinh doanh, tuy nhiên niềm yêu thích với trải nghiệm người dùng đã thôi thúc mình tự học thêm và chuyển hướng sang lĩnh vực thiết kế sản phẩm số.",
      "Tính mình hơi hướng nội khi mới gặp người lạ, nhưng trong môi trường làm việc nhóm mình lại khá hòa đồng và luôn sẵn sàng lắng nghe góp ý. Sở trường của mình là biến những quy trình phức tạp thành giao diện đơn giản, dễ hiểu cho người dùng phổ thông. Sau bốn năm gắn bó với các dự án công nghệ, mình nhận ra sự cân bằng cuộc sống quan trọng không kém gì tốc độ thăng tiến.",
      "Ngoài giờ làm việc, mình duy trì thói quen chạy bộ buổi sáng, đọc sách tâm lý học và cuối tuần hay lang thang các hiệu sách cũ. Mục tiêu dài hạn của mình trong ba năm tới là dẫn dắt một nhóm thiết kế nhỏ và thực hiện thêm nhiều dự án giáo dục cộng đồng.",
    ],
    glossary: {
      "Quê gốc": {
        pos: "danh từ",
        ipa: "/kwe˧˧ ɣək͡p˧˥/",
        definitionVi: "Nơi xuất thân gốc gác của gia đình dù cá nhân đang sinh sống ở nơi khác.",
        en: "ancestral hometown",
      },
      "tự lập": {
        pos: "tính từ",
        ipa: "/tɯ˧˨ʔ ləp˧˨ʔ/",
        definitionVi: "Tự xoay xở cuộc sống và đưa ra quyết định mà không ỷ lại vào gia đình.",
        en: "independent / self-reliant",
      },
      "chuyên ngành": {
        pos: "danh từ",
        ipa: "/tɕwiən˧˧ ŋaɲ˨˩/",
        definitionVi: "Lĩnh vực đào tạo chuyên sâu ở bậc đại học hoặc cao đẳng.",
        en: "academic major",
      },
      "chuyển hướng": {
        pos: "động từ",
        ipa: "/tɕwiən˧˩˧ hɯəŋ˧˥/",
        definitionVi: "Thay đổi con đường nghề nghiệp hoặc kế hoạch sang một lĩnh vực khác.",
        en: "pivot / change direction",
      },
      "hướng nội": {
        pos: "tính từ",
        ipa: "/hɯəŋ˧˥ noj˧˨ʔ/",
        definitionVi: "Kín đáo, thích không gian tĩnh lặng để tái tạo năng lượng.",
        en: "introverted",
      },
      "hòa đồng": {
        pos: "tính từ",
        ipa: "/hwaː˨˩ ɗəwŋ͡m˨˩/",
        definitionVi: "Thân thiện, cởi mở và dễ phối hợp với tập thể.",
        en: "sociable / easygoing",
      },
      "Sở trường": {
        pos: "danh từ",
        ipa: "/səː˧˩˧ tɕɯəŋ˨˩/",
        definitionVi: "Điểm mạnh nổi bật mà một người làm tốt nhất.",
        en: "strong suit / forte",
      },
      "cân bằng cuộc sống": {
        pos: "cụm từ",
        ipa: "/kən˧˧ ɓaŋ˨˩ kuək˧˨ʔ səwŋ͡m˧˥/",
        definitionVi: "Trạng thái hài hòa giữa công việc, sức khỏe và đời sống riêng.",
        en: "work-life balance",
      },
      "thăng tiến": {
        pos: "động từ",
        ipa: "/tʰaŋ˧˧ tiən˧˥/",
        definitionVi: "Tiến lên vị trí cao hơn trong sự nghiệp.",
        en: "career advancement",
      },
      "Mục tiêu dài hạn": {
        pos: "cụm danh từ",
        ipa: "/muk͡p˧˨ʔ tiəw˧˧ zaːj˨˩ haːn˧˨ʔ/",
        definitionVi: "Đích đến lớn được hoạch định trong nhiều năm.",
        en: "long-term goal",
      },
    },
    questions: [
      {
        id: "rp-self-q1",
        questionVi: "Minh Anh đã thay đổi con đường nghề nghiệp của mình như thế nào?",
        options: [
          "Học quản trị kinh doanh rồi tự học thêm để chuyển sang thiết kế sản phẩm số",
          "Học thiết kế tại Huế rồi chuyển sang quản trị kinh doanh ở Sài Gòn",
          "Làm giáo dục cộng đồng suốt bốn năm trước khi vào đại học",
        ],
        correctIndex: 0,
        explanationVi: "Đoạn 1 nêu rõ: Minh Anh học quản trị kinh doanh nhưng tự học thêm và chuyển hướng sang thiết kế sản phẩm số.",
      },
      {
        id: "rp-self-q2",
        questionVi: "Điểm mạnh nổi bật (sở trường) của Minh Anh trong công việc là gì?",
        options: [
          "Lập trình hệ thống máy chủ tốc độ cao",
          "Biến quy trình phức tạp thành giao diện đơn giản, dễ hiểu",
          "Tổ chức các sự kiện kết nối đông người",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 2 viết: «Sở trường của mình là biến những quy trình phức tạp thành giao diện đơn giản, dễ hiểu cho người dùng phổ thông.»",
      },
      {
        id: "rp-self-q3",
        questionVi: "Trong ba năm tới, Minh Anh đặt mục tiêu gì?",
        options: [
          "Chuyển về Huế mở hiệu sách cũ",
          "Dẫn dắt một nhóm thiết kế nhỏ và làm thêm dự án giáo dục cộng đồng",
          "Tạm nghỉ việc để đi du lịch dài ngày",
        ],
        correctIndex: 1,
        explanationVi: "Câu cuối đoạn 3 nêu trực tiếp mục tiêu dài hạn trong ba năm tới của Minh Anh.",
      },
    ],
  },

  // =========================================================================
  // 2. FOOD — Restaurant & Coffee Review
  // =========================================================================
  {
    id: "rp-food-1",
    topicId: "food",
    titleVi: "Đánh giá quán ăn — Bếp Nhà Mộc & Góc cà phê rang xay",
    formatLabel: "Bài review ẩm thực · Cộng đồng sống tại Hà Nội",
    paragraphs: [
      "Cuối tuần rồi mình ghé Bếp Nhà Mộc nằm trong một con ngõ nhỏ gần hồ Tây sau khi nghe vài người bạn khen nức nở. Khác với không khí ồn ào của nhiều quán vỉa hè khu trung tâm, nơi đây bài trí mộc mạc với bàn gỗ thấp và khoảng sân nhiều cây xanh, rất hợp để ngồi trò chuyện chậm rãi cùng bạn bè.",
      "Thực đơn của quán không quá dài nhưng món nào cũng được chăm chút kỹ. Mình gọi một phần bún mọc dọc mùng và đĩa nem rán ăn chung. Nước dùng ninh từ xương rất thanh đạm, thơm nhẹ mùi nấm hương và không bị lạm dụng bột ngọt. Phần nem rán vỏ giòn rụm, nhân nêm nếm đậm đà, ăn kèm đu đủ ngâm chua ngọt và rau thơm nên hoàn toàn đỡ ngấy. Điểm cộng lớn là nhân viên chủ động hỏi xem khách có dị ứng thực phẩm hay muốn giảm cay trước khi lên món.",
      "Ăn xong, mình sang góc quầy bên cạnh gọi một ly cà phê phin sữa đá ít ngọt. Hạt cà phê rang vừa nên giữ được hương thơm dịu chứ không khét đắng. Giá một bữa trưa kèm đồ uống khoảng một trăm hai mươi nghìn đồng — nhỉnh hơn quán bình dân một chút nhưng hoàn toàn xứng đáng với chất lượng và sự chỉn chu.",
    ],
    glossary: {
      "khen nức nở": {
        pos: "cụm động từ",
        ipa: "/xɛn˧˧ nɯk˧˥ nəː˧˩˧/",
        definitionVi: "Khen ngợi hết lời vì quá ấn tượng.",
        en: "praise enthusiastically",
      },
      "quán vỉa hè": {
        pos: "danh từ",
        ipa: "/kwaːn˧˥ viə˧˩˧ hɛ˨˩/",
        definitionVi: "Hàng ăn bình dân kê bàn ghế ngay trên lề đường.",
        en: "street-side eatery",
      },
      "thanh đạm": {
        pos: "tính từ",
        ipa: "/tʰaɲ˧˧ ɗaːm˧˨ʔ/",
        definitionVi: "Nhẹ nhàng, trong vị, không nhiều dầu mỡ hay gia vị nặng.",
        en: "light and delicate",
      },
      "nêm nếm": {
        pos: "động từ",
        ipa: "/nem˧˧ nem˧˥/",
        definitionVi: "Pha trộn và điều chỉnh gia vị cho vừa miệng.",
        en: "season to taste",
      },
      "đậm đà": {
        pos: "tính từ",
        ipa: "/ɗəm˧˨ʔ ɗaː˨˩/",
        definitionVi: "Tròn vị, nổi bật hương thơm của gia vị hòa quyện.",
        en: "rich and flavorful",
      },
      "đỡ ngấy": {
        pos: "cụm tính từ",
        ipa: "/ɗəː˧ˀ˥ ŋəj˧˥/",
        definitionVi: "Giảm bớt cảm giác béo dầu, giúp ăn ngon miệng hơn.",
        en: "less greasy / cloying",
      },
      "dị ứng thực phẩm": {
        pos: "cụm từ",
        ipa: "/zi˧˨ʔ ɯŋ˧˥ tʰɯk˧˨ʔ fəm˧˩˧/",
        definitionVi: "Tình trạng cơ thể phản ứng bất lợi với một nguyên liệu nào đó.",
        en: "food allergy",
      },
      "cà phê phin": {
        pos: "danh từ",
        ipa: "/kaː˨˩ fe˧˧ fin˧˧/",
        definitionVi: "Cà phê pha nhỏ giọt qua phin kim loại truyền thống.",
        en: "Vietnamese drip coffee",
      },
      "chỉn chu": {
        pos: "tính từ",
        ipa: "/tɕɪn˧˩˧ tɕu˧˧/",
        definitionVi: "Cẩn thận, chu đáo và chăm chút đến từng chi tiết nhỏ.",
        en: "meticulous / well-put-together",
      },
    },
    questions: [
      {
        id: "rp-food-q1",
        questionVi: "Tác giả nhận xét thế nào về nước dùng món bún mọc dọc mùng?",
        options: [
          "Rất ngọt và hơi nhiều dầu mỡ",
          "Thanh đạm, thơm nhẹ nấm hương và không lạm dụng bột ngọt",
          "Cay nồng theo kiểu miền Trung",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 2 miêu tả: «Nước dùng ninh từ xương rất thanh đạm, thơm nhẹ mùi nấm hương và không bị lạm dụng bột ngọt.»",
      },
      {
        id: "rp-food-q2",
        questionVi: "Chi tiết dịch vụ nào khiến tác giả chấm «điểm cộng lớn» cho quán?",
        options: [
          "Quán miễn phí đồ uống cho khách đi nhóm đông",
          "Quán mở cửa phục vụ xuyên đêm",
          "Nhân viên chủ động hỏi khách về dị ứng thực phẩm và mức độ cay",
        ],
        correctIndex: 2,
        explanationVi: "Đoạn 2 ghi rõ nhân viên chủ động hỏi khách có bị dị ứng thực phẩm hoặc muốn giảm cay không.",
      },
      {
        id: "rp-food-q3",
        questionVi: "Tác giả đánh giá mức giá 120.000 đồng ra sao?",
        options: [
          "Cao hơn quán bình dân một chút nhưng xứng đáng với chất lượng",
          "Quá đắt so với phần ăn quá ít",
          "Rẻ hơn tất cả các quán vỉa hè khu trung tâm",
        ],
        correctIndex: 0,
        explanationVi: "Đoạn 3 nhận xét giá «nhỉnh hơn quán bình dân một chút nhưng hoàn toàn xứng đáng với chất lượng và sự chỉn chu».",
      },
    ],
  },

  // =========================================================================
  // 3. ROUTINE — Workday Vlog Summary
  // =========================================================================
  {
    id: "rp-routine-1",
    topicId: "routine",
    titleVi: "Một ngày làm việc hiệu quả giữa nhịp sống Sài Gòn",
    formatLabel: "Tóm tắt vlog đời sống · Người đi làm trẻ",
    paragraphs: [
      "Trước đây mình rất hay thức khuya xem video rồi sáng hôm sau cuống cuồng chạy ra khỏi nhà đúng giờ cao điểm. Từ đầu năm nay, mình quyết định thiết lập lại nhịp sinh hoạt gọn gàng hơn. Đồng hồ báo thức reo lúc sáu giờ sáng; mình uống một cốc nước ấm, giãn cơ mười lăm phút và tự pha bình cà phê mang đi làm.",
      "Mình rời nhà trước bảy giờ rưỡi để tránh đoạn kẹt xe kéo dài ở ngã tư lớn. Trên đường đi, mình tranh thủ nghe một tập podcast ngắn về kinh tế hoặc luyện nghe ngoại ngữ. Buổi sáng ở văn phòng thường có lịch trình dày đặc với hai cuộc họp nhóm, nên mình luôn hoàn thành những đầu việc đòi hỏi sự tập trung cao nhất ngay trước mười một giờ trưa.",
      "Hôm nào không phải tăng ca, mình tan làm lúc năm giờ rưỡi rồi ghé lớp bơi gần nhà khoảng bốn mươi lăm phút. Vận động sau giờ làm giúp mình giải tỏa căng thẳng và ngủ sâu hơn hẳn. Mình nhận ra bí quyết không nằm ở việc lên kế hoạch quá cầu kỳ, mà là duy trì thói quen nhỏ một cách đều đặn để luôn đủ sức nạp lại năng lượng cho ngày tiếp theo.",
    ],
    glossary: {
      "thức khuya": {
        pos: "động từ",
        ipa: "/tʰɯk˧˥ xwiə˧˧/",
        definitionVi: "Chưa đi ngủ khi trời đã về đêm muộn.",
        en: "stay up late",
      },
      "cuống cuồng": {
        pos: "tính từ",
        ipa: "/kuəŋ˧˥ kuəŋ˨˩/",
        definitionVi: "Vội vàng, lúng túng vì sợ trễ giờ.",
        en: "frantic / rushed",
      },
      "giờ cao điểm": {
        pos: "cụm danh từ",
        ipa: "/zəː˨˩ kaːw˧˧ ɗiəm˧˩˧/",
        definitionVi: "Khung giờ giao thông đông đúc nhất trong ngày.",
        en: "rush hour",
      },
      "kẹt xe": {
        pos: "động từ",
        ipa: "/kɛt˧˨ʔ sɛ˧˧/",
        definitionVi: "Xe cộ ùn ứ dày đặc không di chuyển nhanh được (phổ biến miền Nam).",
        en: "traffic jam",
      },
      "tranh thủ": {
        pos: "động từ",
        ipa: "/tɕaɲ˧˧ tʰu˧˩˧/",
        definitionVi: "Tận dụng khéo khoảng thời gian ngắn cho việc có ích.",
        en: "squeeze in / take advantage of time",
      },
      "lịch trình dày đặc": {
        pos: "cụm từ",
        ipa: "/lɪk̟˧˨ʔ tɕɪŋ˨˩ zaj˨˩ ɗak˧˨ʔ/",
        definitionVi: "Thời gian biểu kín lịch họp và công việc liên tiếp.",
        en: "packed schedule",
      },
      "tăng ca": {
        pos: "động từ",
        ipa: "/taŋ˧˧ kaː˧˧/",
        definitionVi: "Làm thêm ngoài giờ hành chính quy định.",
        en: "work overtime",
      },
      "tan làm": {
        pos: "động từ",
        ipa: "/taːn˧˧ laːm˨˩/",
        definitionVi: "Kết thúc ngày làm việc để rời công ty.",
        en: "get off work",
      },
      "duy trì thói quen": {
        pos: "cụm động từ",
        ipa: "/zwi˧˧ tɕi˨˩ tʰɔj˧˥ kwɛn˧˧/",
        definitionVi: "Giữ đều đặn một hành vi tốt trong thời gian dài.",
        en: "maintain a habit",
      },
      "nạp lại năng lượng": {
        pos: "cụm động từ",
        ipa: "/naːp˧˨ʔ laːj˧˨ʔ naŋ˧˧ lɯəŋ˧˨ʔ/",
        definitionVi: "Nghỉ ngơi hoặc thư giãn để hồi phục sức lực và tinh thần.",
        en: "recharge one's batteries",
      },
    },
    questions: [
      {
        id: "rp-routine-q1",
        questionVi: "Tác giả tận dụng thời gian di chuyển đến công ty để làm gì?",
        options: [
          "Trả lời email công việc và gọi điện cho khách hàng",
          "Nghe podcast ngắn về kinh tế hoặc luyện nghe ngoại ngữ",
          "Mua đồ ăn sáng và ngồi cà phê một tiếng",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 2 nêu rõ: «Trên đường đi, mình tranh thủ nghe một tập podcast ngắn về kinh tế hoặc luyện nghe ngoại ngữ.»",
      },
      {
        id: "rp-routine-q2",
        questionVi: "Tác giả xử lý các việc cần tập trung cao vào thời điểm nào?",
        options: [
          "Ngay trước 11 giờ trưa",
          "Sau khi đi bơi về vào buổi tối",
          "Vào hai ngày cuối tuần",
        ],
        correctIndex: 0,
        explanationVi: "Đoạn 2 viết tác giả luôn hoàn thành đầu việc cần tập trung cao nhất ngay trước mười một giờ trưa.",
      },
      {
        id: "rp-routine-q3",
        questionVi: "Theo tác giả, yếu tố cốt lõi để có ngày làm việc hiệu quả là gì?",
        options: [
          "Lập bảng kế hoạch thật phức tạp theo từng phút",
          "Làm tăng ca đều đặn mỗi tối",
          "Duy trì đều đặn những thói quen nhỏ hằng ngày",
        ],
        correctIndex: 2,
        explanationVi: "Câu cuối đoạn 3 khẳng định bí quyết là «duy trì thói quen nhỏ một cách đều đặn».",
      },
    ],
  },

  // =========================================================================
  // 4. WEATHER — Hanoi / Saigon Weather Chat
  // =========================================================================
  {
    id: "rp-weather-1",
    topicId: "weather",
    titleVi: "Trò chuyện cuối tuần: Hà Nội giao mùa & Sài Gòn vào mùa mưa",
    formatLabel: "Nhóm chat bạn bè · Bắc – Nam",
    paragraphs: [
      "Hương (Hà Nội): Mấy hôm nay ngoài này đúng kiểu giao mùa cậu ạ! Sáng sớm đi làm trời se lạnh, gió thổi qua hồ mát rượi, mặc một chiếc áo khoác mỏng là vừa đẹp. Vậy mà mới tuần trước trời còn nồm ẩm khó chịu kinh khủng, nền nhà lúc nào cũng ướt nhẹp, mình phải bật máy hút ẩm suốt cả đêm.",
      "Thành (Sài Gòn): Nghe cậu tả mùa thu Hà Nội mà thèm ghê! Trong này đang cao điểm mùa mưa. Sáng ra nắng rực rỡ, oi bức tưởng chết, thế mà cứ tầm bốn giờ chiều mây đen kéo tới rồi đổ mưa rào bất chợt. Hôm qua mình chủ quan không xem dự báo thời tiết, để quên áo mưa ở nhà nên dính mưa ướt sũng lúc tan tầm.",
      "Hương (Hà Nội): Ở Sài Gòn mà quên áo mưa vào mùa này là liều quá rồi! Nhưng công nhận thời tiết hai miền mỗi nơi có nét thú vị riêng. Miền Bắc có đủ bốn mùa rõ rệt — hè nóng rát, thu hanh khô dễ chịu, đông rét ngọt — còn miền Nam lại dễ chọn quần áo quanh năm. Nếu tháng Mười cậu ra công tác thì báo trước nhé, lúc đó trời râm mát cực kỳ hợp để đi bộ phố cổ và uống trà chanh.",
    ],
    glossary: {
      "giao mùa": {
        pos: "danh từ",
        ipa: "/zaːw˧˧ muə˨˩/",
        definitionVi: "Thời điểm chuyển tiếp giữa hai mùa với nhiệt độ thay đổi nhanh.",
        en: "seasonal transition",
      },
      "se lạnh": {
        pos: "tính từ",
        ipa: "/sɛ˧˧ laɲ˧˨ʔ/",
        definitionVi: "Lạnh nhẹ, thoáng đãng và dễ chịu.",
        en: "mildly chilly / crisp",
      },
      "nồm ẩm": {
        pos: "tính từ",
        ipa: "/nom˨˩ əm˧˩˧/",
        definitionVi: "Độ ẩm không khí rất cao gây đọng nước trên sàn và đồ đạc.",
        en: "clammy and humid",
      },
      "oi bức": {
        pos: "tính từ",
        ipa: "/ɔj˧˧ ɓɯk˧˥/",
        definitionVi: "Nóng nực, bí gió và ngột ngạt.",
        en: "sweltering / muggy",
      },
      "mưa rào bất chợt": {
        pos: "cụm danh từ",
        ipa: "/mɯə˧˧ zaːw˨˩ ɓət˧˥ tɕəːt˧˨ʔ/",
        definitionVi: "Cơn mưa to ập đến đột ngột rồi thường tạnh nhanh.",
        en: "sudden downpour",
      },
      "chủ quan": {
        pos: "tính từ",
        ipa: "/tɕu˧˩˧ kwaːn˧˧/",
        definitionVi: "Quá tự tin mà không phòng bị trước rủi ro.",
        en: "overconfident / careless",
      },
      "dự báo thời tiết": {
        pos: "cụm danh từ",
        ipa: "/zɯ˧˨ʔ ɓaːw˧˥ tʰəːj˨˩ tiət˧˥/",
        definitionVi: "Bản tin dự đoán mưa nắng, nhiệt độ các ngày tới.",
        en: "weather forecast",
      },
      "hanh khô": {
        pos: "tính từ",
        ipa: "/haɲ˧˧ xo˧˧/",
        definitionVi: "Không khí khô ráo, ít ẩm, thường vào cuối thu – đầu đông.",
        en: "dry / arid",
      },
      "râm mát": {
        pos: "tính từ",
        ipa: "/zəm˧˧ maːt˧˥/",
        definitionVi: "Có mây che bớt nắng, nhiệt độ dịu mát.",
        en: "overcast and cool",
      },
    },
    questions: [
      {
        id: "rp-weather-q1",
        questionVi: "Tuần trước, Hương đã phải làm gì để đối phó với thời tiết ở Hà Nội?",
        options: [
          "Mặc áo khoác dày suốt cả ngày",
          "Bật máy hút ẩm suốt cả đêm vì trời nồm ẩm",
          "Hủy toàn bộ lịch làm việc vì mưa bão lớn",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 1: Hương kể tuần trước trời nồm ẩm nên phải bật máy hút ẩm suốt cả đêm.",
      },
      {
        id: "rp-weather-q2",
        questionVi: "Vì sao hôm qua anh Thành bị ướt sũng lúc tan tầm?",
        options: [
          "Vì chủ quan không xem dự báo thời tiết và để quên áo mưa ở nhà",
          "Vì áo mưa của anh bị rách giữa đường",
          "Vì xe buýt hôm đó không chạy qua văn phòng",
        ],
        correctIndex: 0,
        explanationVi: "Đoạn 2: Thành thừa nhận mình chủ quan không xem dự báo thời tiết và quên áo mưa ở nhà.",
      },
      {
        id: "rp-weather-q3",
        questionVi: "Hương gợi ý thời điểm nào thích hợp để Thành ra Hà Nội dạo phố cổ?",
        options: [
          "Giữa mùa hè nắng nóng",
          "Tháng Mười khi trời râm mát",
          "Tháng Ba mùa nồm ẩm",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 3: Hương nhắc «Nếu tháng Mười cậu ra công tác... lúc đó trời râm mát cực kỳ hợp để đi bộ phố cổ».",
      },
    ],
  },

  // =========================================================================
  // 5. EMOTIONS — Friend's Message about Burnout & Relief
  // =========================================================================
  {
    id: "rp-emotions-1",
    topicId: "emotions",
    titleVi: "Tin nhắn từ bạn thân: Khi công việc khiến mình kiệt sức",
    formatLabel: "Tin nhắn cá nhân · Chia sẻ tâm trạng",
    paragraphs: [
      "Lan ơi, tối nay rảnh không, mình nhắn dài một chút để cảm ơn cậu nhé. Thật sự suốt tháng trước mình rơi vào giai đoạn áp lực kinh khủng. Công ty tái cơ cấu, khối lượng việc tăng gấp đôi mà mình vẫn cố gồng vì sợ mọi người nghĩ mình làm không nổi. Có những hôm ngồi trước màn hình máy tính mà đầu óc trống rỗng, cảm giác vừa bức bối vừa kiệt sức.",
      "Hôm đó gọi điện than thở với cậu, mình cứ sợ làm phiền. Vậy mà cậu chẳng hề phán xét hay vội vàng khuyên bảo sáo rỗng, chỉ kiên nhẫn lắng nghe rồi bảo rằng mình hoàn toàn xứng đáng được nghỉ ngơi. Có người thực sự đồng cảm và an ủi đúng lúc khiến mình như trút được nửa gánh nặng trong lòng.",
      "Sang tuần này mình đã bình tĩnh ngồi nói chuyện thẳng thắn với quản lý để chia lại ưu tiên công việc, đồng thời xin nghỉ phép hai ngày về thăm bố mẹ. Sáng nay bước ra ban công nghe chim hót, mình thấy nhẹ nhõm hẳn và bắt đầu hào hứng trở lại với mấy dự định cá nhân bị bỏ quên lâu nay. Cuối tuần mình mời cậu bữa lẩu coi như lời cảm ơn nhé!",
    ],
    glossary: {
      "áp lực": {
        pos: "danh từ",
        ipa: "/aːp˧˥ lɯk˧˨ʔ/",
        definitionVi: "Sức ép tinh thần từ công việc, thời gian hoặc kỳ vọng.",
        en: "pressure / stress",
      },
      "cố gồng": {
        pos: "động từ",
        ipa: "/ko˧˥ ɣəwŋ͡m˨˩/",
        definitionVi: "Gắng sức chịu đựng quá giới hạn của bản thân.",
        en: "push through / force oneself",
      },
      "bức bối": {
        pos: "tính từ",
        ipa: "/ɓɯk˧˥ ɓoj˧˥/",
        definitionVi: "Tù túng, khó chịu vì tâm trạng bị dồn nén.",
        en: "stifled / frustrated",
      },
      "kiệt sức": {
        pos: "tính từ",
        ipa: "/kiət˧˨ʔ sɯk˧˥/",
        definitionVi: "Cạn kiệt năng lượng cả thể chất lẫn tinh thần.",
        en: "exhausted / burned out",
      },
      "phán xét": {
        pos: "động từ",
        ipa: "/faːn˧˥ sɛt˧˥/",
        definitionVi: "Đánh giá, chỉ trích người khác một cách khắt khe.",
        en: "to judge",
      },
      "đồng cảm": {
        pos: "động từ",
        ipa: "/ɗəwŋ͡m˨˩ kaːm˧˩˧/",
        definitionVi: "Thấu hiểu và chia sẻ cảm xúc từ góc nhìn của người đối diện.",
        en: "to empathize",
      },
      "an ủi": {
        pos: "động từ",
        ipa: "/aːn˧˧ uj˧˩˧/",
        definitionVi: "Vỗ về, xoa dịu nỗi buồn hay lo lắng của người khác.",
        en: "to comfort / console",
      },
      "bình tĩnh": {
        pos: "tính từ",
        ipa: "/ɓɪŋ˨˩ tɪŋ˧ˀ˥/",
        definitionVi: "Giữ thái độ điềm đạm, tỉnh táo khi giải quyết vấn đề.",
        en: "calm / composed",
      },
      "nhẹ nhõm": {
        pos: "tính từ",
        ipa: "/ɲɛ˧˨ʔ ɲɔm˧ˀ˥/",
        definitionVi: "Thư thái, thoải mái sau khi trút bỏ lo âu.",
        en: "relieved",
      },
      "hào hứng": {
        pos: "tính từ",
        ipa: "/haːw˨˩ hɯŋ˧˥/",
        definitionVi: "Phấn khởi, giàu năng lượng hướng tới điều sắp tới.",
        en: "excited / enthusiastic",
      },
    },
    questions: [
      {
        id: "rp-emotions-q1",
        questionVi: "Vì sao người viết từng «cố gồng» suốt tháng trước dù việc tăng gấp đôi?",
        options: [
          "Vì muốn giành thưởng doanh số cao nhất phòng",
          "Vì sợ mọi người nghĩ mình làm không nổi",
          "Vì không biết cách sử dụng phần mềm mới",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 1 nói rõ: «mình vẫn cố gồng vì sợ mọi người nghĩ mình làm không nổi».",
      },
      {
        id: "rp-emotions-q2",
        questionVi: "Điều gì ở phản ứng của Lan giúp người viết cảm thấy nhẹ lòng hơn?",
        options: [
          "Lan nhận làm giúp toàn bộ công việc của người viết",
          "Lan không phán xét mà kiên nhẫn lắng nghe, đồng cảm và nhắc bạn được quyền nghỉ ngơi",
          "Lan khuyên người viết lập tức nghỉ việc ngay hôm sau",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 2 nhấn mạnh Lan không phán xét hay khuyên sáo rỗng, mà lắng nghe, đồng cảm và an ủi đúng lúc.",
      },
      {
        id: "rp-emotions-q3",
        questionVi: "Sang tuần này, người viết đã hành động cụ thể ra sao để cải thiện tình hình?",
        options: [
          "Trao đổi thẳng thắn với quản lý để chia lại ưu tiên việc và xin nghỉ phép hai ngày về thăm bố mẹ",
          "Chuyển sang làm việc từ xa hoàn toàn mà không báo công ty",
          "Đăng ký học thêm hai khóa học buổi tối",
        ],
        correctIndex: 0,
        explanationVi: "Đoạn 3 nêu rõ hai bước cụ thể: trao đổi với quản lý về ưu tiên công việc và nghỉ phép hai ngày về thăm bố mẹ.",
      },
    ],
  },

  // =========================================================================
  // 6. OPINIONS — Short Opinion Post on Remote Work
  // =========================================================================
  {
    id: "rp-opinions-1",
    topicId: "opinions",
    titleVi: "Góc nhìn: Làm việc từ xa có thực sự lý tưởng cho mọi người?",
    formatLabel: "Bài viết quan điểm · Diễn đàn công sở",
    paragraphs: [
      "Mấy năm gần đây, chủ đề nên làm việc từ xa hay quay lại văn phòng luôn tạo ra nhiều quan điểm trái chiều. Tôi từng trải nghiệm cả hai mô hình trong ba năm và nhận thấy câu trả lời không đơn giản là cái nào tốt hơn tuyệt đối.",
      "Một mặt, làm việc từ xa mang lại lợi ích rất thuyết phục: người đi làm tiết kiệm đáng kể thời gian di chuyển, giảm căng thẳng vì kẹt xe và chủ động sắp xếp những việc lặt vặt trong gia đình. Với các đầu việc đòi hỏi tập trung sâu như viết nội dung hay lập trình, không gian yên tĩnh tại nhà thường đem lại hiệu quả rất cao.",
      "Mặt khác, mô hình này cũng bộc lộ không ít bất cập nếu áp dụng cứng nhắc. Khi mọi trao đổi chỉ diễn ra qua tin nhắn, việc hiểu nhầm giọng điệu rất dễ xảy ra và nhân viên mới khó học hỏi kinh nghiệm từ đồng nghiệp đi trước. Tuy nhiên, nếu bắt buộc lên công ty đủ năm ngày mỗi tuần lại làm mất đi sự linh hoạt cần thiết. Vì thế, tôi hoàn toàn đồng tình với xu hướng làm việc kết hợp — mỗi doanh nghiệp nên cân nhắc tính chất công việc của từng nhóm để chọn tỷ lệ ngày làm tại văn phòng hợp lý nhất.",
    ],
    glossary: {
      "làm việc từ xa": {
        pos: "cụm động từ",
        ipa: "/laːm˨˩ viək˧˨ʔ tɯ˨˩ saː˧˧/",
        definitionVi: "Hoàn thành công việc tại nhà hoặc ngoài văn phòng nhờ kết nối trực tuyến.",
        en: "remote work",
      },
      "quan điểm": {
        pos: "danh từ",
        ipa: "/kwaːn˧˧ ɗiəm˧˩˧/",
        definitionVi: "Góc nhìn, thái độ đánh giá cá nhân về một vấn đề.",
        en: "viewpoint / opinion",
      },
      "trái chiều": {
        pos: "tính từ",
        ipa: "/tɕaːj˧˥ tɕiəw˨˩/",
        definitionVi: "Đối lập nhau, có nhiều ý kiến khác biệt.",
        en: "conflicting / opposing",
      },
      "thuyết phục": {
        pos: "tính từ",
        ipa: "/tʰwiət˧˥ fuk͡p˧˨ʔ/",
        definitionVi: "Có cơ sở rõ ràng khiến người khác tin tưởng.",
        en: "convincing / persuasive",
      },
      "hiệu quả": {
        pos: "tính từ",
        ipa: "/hiəw˧˨ʔ kwaː˧˩˧/",
        definitionVi: "Đạt kết quả tốt đúng mục tiêu với chi phí thời gian hợp lý.",
        en: "effective / efficient",
      },
      "Mặt khác": {
        pos: "cụm từ nối",
        ipa: "/mat˧˨ʔ xaːk˧˥/",
        definitionVi: "Từ nối dùng để nêu khía cạnh đối lập hoặc bổ sung.",
        en: "on the other hand",
      },
      "bất cập": {
        pos: "danh từ",
        ipa: "/ɓət˧˥ kəp˧˨ʔ/",
        definitionVi: "Điểm thiếu hợp lý, hạn chế cần khắc phục.",
        en: "shortcoming / drawback",
      },
      "Tuy nhiên": {
        pos: "liên từ",
        ipa: "/twi˧˧ ɲiən˧˧/",
        definitionVi: "Từ nối diễn đạt sự tương phản nhẹ nhàng, mạch lạc.",
        en: "however",
      },
      "đồng tình": {
        pos: "động từ",
        ipa: "/ɗəwŋ͡m˨˩ tɪŋ˨˩/",
        definitionVi: "Tán thành với một ý kiến hoặc giải pháp.",
        en: "agree / concur",
      },
      "cân nhắc": {
        pos: "động từ",
        ipa: "/kən˧˧ ɲak˧˥/",
        definitionVi: "Xem xét kỹ nhiều yếu tố trước khi quyết định.",
        en: "consider carefully",
      },
    },
    questions: [
      {
        id: "rp-opinions-q1",
        questionVi: "Theo tác giả, loại công việc nào thường đạt hiệu quả cao khi làm tại nhà?",
        options: [
          "Những việc đòi hỏi tập trung sâu như viết nội dung hay lập trình",
          "Đào tạo nhân viên mới gia nhập công ty",
          "Các cuộc thương lượng cần xử lý khẩn cấp theo nhóm",
        ],
        correctIndex: 0,
        explanationVi: "Đoạn 2 chỉ rõ các đầu việc đòi hỏi tập trung sâu như viết nội dung hay lập trình đạt hiệu quả cao tại nhà.",
      },
      {
        id: "rp-opinions-q2",
        questionVi: "Một trong các bất cập của làm việc từ xa hoàn toàn được nêu trong bài là gì?",
        options: [
          "Tốn quá nhiều thời gian đi lại ngoài đường",
          "Dễ hiểu nhầm giọng điệu qua tin nhắn và nhân viên mới khó học từ đồng nghiệp",
          "Không thể sử dụng máy tính cá nhân ở nhà",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 3 nêu rõ hai bất cập: dễ hiểu nhầm giọng điệu qua tin nhắn và nhân viên mới khó học hỏi từ đồng nghiệp đi trước.",
      },
      {
        id: "rp-opinions-q3",
        questionVi: "Tác giả ủng hộ giải pháp nào nhất?",
        options: [
          "Bắt buộc toàn bộ nhân sự đến văn phòng năm ngày mỗi tuần",
          "Làm việc từ xa hoàn toàn cho mọi bộ phận",
          "Mô hình làm việc kết hợp tùy theo tính chất công việc của từng nhóm",
        ],
        correctIndex: 2,
        explanationVi: "Câu cuối đoạn 3 khẳng định tác giả đồng tình với xu hướng làm việc kết hợp và cân nhắc theo tính chất từng nhóm.",
      },
    ],
  },
];

export const SENTENCE_BUILDERS = [
  // ---- SELF ----
  {
    id: "sb-self-1",
    topicId: "self",
    promptEn: "I have been working in marketing for nearly four years now.",
    hintVi: "Dùng cấu trúc «đang làm ... được [thời gian] rồi».",
    targetSentenceVi: "Mình đang làm trong ngành tiếp thị được gần bốn năm rồi.",
    chunks: ["Mình", "đang làm", "trong ngành tiếp thị", "được gần", "bốn năm", "rồi."],
    grammarNoteVi: "Chữ «được» đứng trước khoảng thời gian nhấn mạnh kinh nghiệm đã tích lũy đến hiện tại.",
  },
  {
    id: "sb-self-2",
    topicId: "self",
    promptEn: "My ancestral hometown is Hue, but I moved to Saigon back in university.",
    hintVi: "Bắt đầu với «Quê gốc của tôi» và nối bằng «nhưng».",
    targetSentenceVi: "Quê gốc của tôi ở Huế nhưng tôi chuyển vào Sài Gòn từ hồi đại học.",
    chunks: ["Quê gốc của tôi", "ở Huế", "nhưng tôi", "chuyển vào", "Sài Gòn", "từ hồi đại học."],
    grammarNoteVi: "Trong tiếng Việt, đi từ Bắc/Trung vào Nam dùng động từ phương hướng «vào» (chuyển vào Sài Gòn).",
  },
  {
    id: "sb-self-3",
    topicId: "self",
    promptEn: "I'm a bit introverted, yet I get along quite well in teamwork.",
    hintVi: "Dùng cặp «hơi ... nhưng ... lại khá ...».",
    targetSentenceVi: "Tính mình hơi hướng nội nhưng làm việc nhóm lại khá hòa đồng.",
    chunks: ["Tính mình", "hơi hướng nội", "nhưng", "làm việc nhóm", "lại khá", "hòa đồng."],
    grammarNoteVi: "Phó từ «lại» ở vế sau tạo sắc thái tương phản thú vị, rất tự nhiên khi mô tả tính cách.",
  },

  // ---- FOOD ----
  {
    id: "sb-food-1",
    topicId: "food",
    promptEn: "Could I get an iced milk coffee with less sugar and less ice, please?",
    hintVi: "Mở đầu lịch sự với «Cho mình một ly...» và kết thúc bằng «nhé.»",
    targetSentenceVi: "Cho mình một ly cà phê sữa đá ít ngọt và ít đá nhé.",
    chunks: ["Cho mình", "một ly", "cà phê sữa đá", "ít ngọt", "và ít đá", "nhé."],
    grammarNoteVi: "Các yêu cầu tùy chỉnh như «ít ngọt», «ít đá», «không đường» luôn đặt ngay sau tên đồ uống.",
  },
  {
    id: "sb-food-2",
    topicId: "food",
    promptEn: "Eating fried spring rolls with fresh herbs makes them much less greasy.",
    hintVi: "Dùng cấu trúc «ăn kèm ... sẽ đỡ ngấy hơn nhiều».",
    targetSentenceVi: "Nem rán ăn kèm rau sống sẽ đỡ ngấy hơn nhiều.",
    chunks: ["Nem rán", "ăn kèm", "rau sống", "sẽ", "đỡ ngấy", "hơn nhiều."],
    grammarNoteVi: "«Đỡ + tính từ tiêu cực» là mẫu câu tự nhiên nhất để nói món ăn giảm bớt độ béo, cay hay mặn.",
  },
  {
    id: "sb-food-3",
    topicId: "food",
    promptEn: "The broth at this spot is really light and not overly sweet.",
    hintVi: "Dùng «rất thanh» và «không bị quá ngọt».",
    targetSentenceVi: "Nước dùng ở quán này rất thanh và không bị quá ngọt.",
    chunks: ["Nước dùng", "ở quán này", "rất thanh", "và", "không bị", "quá ngọt."],
    grammarNoteVi: "Dùng «không bị + [tính từ không mong muốn]» khi khen món ăn tránh được lỗi nêm nếm.",
  },

  // ---- ROUTINE ----
  {
    id: "sb-routine-1",
    topicId: "routine",
    promptEn: "I usually leave home before 7:30 to avoid rush-hour traffic jams.",
    hintVi: "Dùng «hay rời nhà» và cụm mục đích «để tránh...».",
    targetSentenceVi: "Tôi hay rời nhà trước bảy giờ rưỡi để tránh kẹt xe giờ cao điểm.",
    chunks: ["Tôi hay", "rời nhà", "trước bảy giờ rưỡi", "để tránh", "kẹt xe", "giờ cao điểm."],
    grammarNoteVi: "«Hay» đứng trước động từ biểu thị thói quen thường xuyên trong khẩu ngữ tự nhiên.",
  },
  {
    id: "sb-routine-2",
    topicId: "routine",
    promptEn: "Whenever my schedule is packed, I squeeze in lunch right at my desk.",
    hintVi: "Dùng mẫu câu điều kiện thói quen «Hôm nào ... thì ...».",
    targetSentenceVi: "Hôm nào lịch trình dày đặc thì mình tranh thủ ăn trưa tại bàn.",
    chunks: ["Hôm nào", "lịch trình dày đặc", "thì mình", "tranh thủ", "ăn trưa", "tại bàn."],
    grammarNoteVi: "«Hôm nào ... thì ...» diễn tả các tình huống lặp lại không cố định ngày trong tuần.",
  },
  {
    id: "sb-routine-3",
    topicId: "routine",
    promptEn: "After getting off work, I stop by the gym before heading home.",
    hintVi: "Dùng cặp từ chỉ trình tự «Sau khi ... rồi mới ...».",
    targetSentenceVi: "Sau khi tan làm, mình ghé phòng tập một lúc rồi mới về nhà.",
    chunks: ["Sau khi tan làm,", "mình ghé", "phòng tập", "một lúc", "rồi mới", "về nhà."],
    grammarNoteVi: "«Rồi mới» nhấn mạnh hành động thứ hai chỉ xảy ra sau khi hành động thứ nhất kết thúc.",
  },

  // ---- WEATHER ----
  {
    id: "sb-weather-1",
    topicId: "weather",
    promptEn: "Remember to bring a raincoat in case it rains heavily on your way home.",
    hintVi: "Dùng liên từ phòng ngừa «kẻo» ở giữa câu.",
    targetSentenceVi: "Nhớ mang theo áo mưa kẻo chiều về lại dính mưa lớn nhé.",
    chunks: ["Nhớ mang theo", "áo mưa", "kẻo chiều về", "lại dính", "mưa lớn", "nhé."],
    grammarNoteVi: "«Kẻo» (lest / in case) tạo giọng điệu quan tâm thân mật hơn nhiều so với «nếu không thì».",
  },
  {
    id: "sb-weather-2",
    topicId: "weather",
    promptEn: "Hanoi has been so humid these days that laundry just won't dry.",
    hintVi: "Dùng «nồm ẩm quá» và «mãi không khô».",
    targetSentenceVi: "Mấy hôm nay Hà Nội nồm ẩm quá, quần áo phơi mãi không khô.",
    chunks: ["Mấy hôm nay", "Hà Nội", "nồm ẩm quá,", "quần áo", "phơi mãi", "không khô."],
    grammarNoteVi: "«V + mãi + không + kết quả» diễn tả sự sốt ruột khi việc kéo dài mà chưa đạt mong muốn.",
  },
  {
    id: "sb-weather-3",
    topicId: "weather",
    promptEn: "Since the forecast says it'll be scorching, let's move the picnic to next week.",
    hintVi: "Dùng «dự báo» và động từ «dời ... sang ...».",
    targetSentenceVi: "Dự báo cuối tuần nắng gắt nên mình dời buổi dã ngoại sang tuần sau nhé.",
    chunks: ["Dự báo cuối tuần", "nắng gắt", "nên mình", "dời buổi dã ngoại", "sang tuần sau", "nhé."],
    grammarNoteVi: "«Dời [lịch] sang [thời điểm]» là cách nói chuẩn mực khi bàn bạc đổi hẹn.",
  },

  // ---- EMOTIONS ----
  {
    id: "sb-emotions-1",
    topicId: "emotions",
    promptEn: "Finishing this project makes me feel completely relieved.",
    hintVi: "Dùng cụm cảm giác «nhẹ nhõm hẳn cả người».",
    targetSentenceVi: "Hoàn thành xong dự án này mình thấy nhẹ nhõm hẳn cả người.",
    chunks: ["Hoàn thành xong", "dự án này", "mình thấy", "nhẹ nhõm hẳn", "cả người."],
    grammarNoteVi: "Từ «hẳn» đặt sau tính từ nhấn mạnh sự chuyển biến cảm xúc rõ rệt.",
  },
  {
    id: "sb-emotions-2",
    topicId: "emotions",
    promptEn: "Don't put too much pressure on yourself; just take a day off to unwind first.",
    hintVi: "Dùng mẫu câu khuyên nhủ «Cứ ... cho ... đã».",
    targetSentenceVi: "Đừng tự tạo áp lực quá nhé, cứ nghỉ một hôm cho đầu óc thư thả đã.",
    chunks: ["Đừng tự tạo", "áp lực quá nhé,", "cứ nghỉ một hôm", "cho đầu óc", "thư thả", "đã."],
    grammarNoteVi: "«Cứ + V + ... + đã» khuyên ai đó ưu tiên nghỉ ngơi trước mắt một cách nhẹ nhàng.",
  },
  {
    id: "sb-emotions-3",
    topicId: "emotions",
    promptEn: "Even though I'm a bit nervous, I'm really excited about the new role.",
    hintVi: "Nối hai cảm xúc đối lập bằng «Dù ... nhưng ...».",
    targetSentenceVi: "Dù hơi hồi hộp nhưng tôi rất hào hứng với vị trí mới này.",
    chunks: ["Dù hơi", "hồi hộp", "nhưng tôi", "rất hào hứng", "với vị trí", "mới này."],
    grammarNoteVi: "«Hào hứng» luôn đi kèm giới từ «với» trước đối tượng khiến bạn phấn khởi.",
  },

  // ---- OPINIONS ----
  {
    id: "sb-opinions-1",
    topicId: "opinions",
    promptEn: "In my view, a hybrid work model delivers the best results.",
    hintVi: "Mở đầu bằng «Theo tôi thì» và kết bằng «hiệu quả tốt nhất».",
    targetSentenceVi: "Theo tôi thì mô hình làm việc kết hợp mang lại hiệu quả tốt nhất.",
    chunks: ["Theo tôi thì", "mô hình", "làm việc kết hợp", "mang lại", "hiệu quả", "tốt nhất."],
    grammarNoteVi: "«Theo tôi thì...» mở đầu quan điểm khách quan, tránh cảm giác áp đặt.",
  },
  {
    id: "sb-opinions-2",
    topicId: "opinions",
    promptEn: "I understand your viewpoint; however, living in the city still has more opportunities.",
    hintVi: "Ghi nhận ý trước rồi dùng «tuy nhiên» để bổ sung góc nhìn đối lập.",
    targetSentenceVi: "Tôi hiểu góc nhìn của bạn, tuy nhiên sống ở thành phố vẫn có nhiều cơ hội hơn.",
    chunks: ["Tôi hiểu", "góc nhìn của bạn,", "tuy nhiên", "sống ở thành phố", "vẫn có", "nhiều cơ hội hơn."],
    grammarNoteVi: "Cấu trúc ghi nhận + «tuy nhiên» giúp phản biện lịch sự trong giao tiếp người trưởng thành.",
  },
  {
    id: "sb-opinions-3",
    topicId: "opinions",
    promptEn: "On one hand remote work is flexible; on the other hand it's easy to feel isolated.",
    hintVi: "Dùng cặp liên từ hai chiều «Một mặt ..., mặt khác ...».",
    targetSentenceVi: "Một mặt làm việc từ xa rất linh hoạt, mặt khác lại dễ khiến mình thấy cô lập.",
    chunks: ["Một mặt", "làm việc từ xa", "rất linh hoạt,", "mặt khác", "lại dễ khiến mình", "thấy cô lập."],
    grammarNoteVi: "«Lại» trong vế «mặt khác lại...» nhấn mạnh sự đánh đổi giữa ưu điểm và hạn chế.",
  },
];
