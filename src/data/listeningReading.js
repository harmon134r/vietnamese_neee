/**
 * Pre-Intermediate (A2-B1) Adult Vietnamese Listening, Reading, and Sentence Builder Content:
 * - LISTENING_EXERCISES: 42 exercises (7 per topic: comprehension, best-response, fill-blank)
 * - READING_PASSAGES: 18 realistic adult texts (3 per topic, 8-10 verbatim glossary entries, 3 questions each)
 * - SENTENCE_BUILDERS: 42 natural sentences (7 per topic) where chunks.join(" ") === targetSentenceVi
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
  {
    id: "le-self-4",
    topicId: "self",
    type: "comprehension",
    titleVi: "Quyết định về Đà Nẵng sống gần gia đình",
    speakerLabel: "Anh Sơn · Kỹ sư xây dựng",
    audioTextVi: "Sau sáu năm làm kỹ sư xây dựng ở Nhật, đầu năm nay mình quyết định về Đà Nẵng định cư. Ở đây nhịp sống chậm rãi hơn, lại gần bố mẹ nên cuối tuần nào cả nhà cũng quây quần ăn cơm cùng nhau.",
    transcriptVi: "Sau sáu năm làm kỹ sư xây dựng ở Nhật, đầu năm nay mình quyết định về Đà Nẵng định cư. Ở đây nhịp sống chậm rãi hơn, lại gần bố mẹ nên cuối tuần nào cả nhà cũng quây quần ăn cơm cùng nhau.",
    translationEn: "After six years working as a civil engineer in Japan, I decided to settle back in Da Nang early this year. The pace of life here is slower, and being close to my parents means the whole family gathers for dinner every weekend.",
    questionVi: "Lý do chính khiến anh Sơn cảm thấy hài lòng khi về Đà Nẵng là gì?",
    options: [
      {
        id: "a",
        textVi: "Thu nhập ở Đà Nẵng cao gấp đôi hồi làm việc tại Nhật",
        explanationVi: "Không có thông tin so sánh thu nhập trong đoạn nghe.",
      },
      {
        id: "b",
        textVi: "Nhịp sống chậm rãi hơn và được ở gần gia đình",
        explanationVi: "Chính xác! Anh Sơn nhấn mạnh nhịp sống chậm rãi và cuối tuần cả nhà quây quần bên bố mẹ.",
      },
      {
        id: "c",
        textVi: "Công ty mới cho nhân viên nghỉ làm vào mỗi thứ Sáu",
        explanationVi: "Đoạn nghe không nhắc tới lịch làm việc bốn ngày mỗi tuần.",
      },
    ],
    correctOptionId: "b",
    hintVi: "Chú ý hai yếu tố tích cực ở câu thứ hai sau cụm «Ở đây...».",
    keyVocab: [
      { word: "định cư", meaning: "to settle down permanently" },
      { word: "chậm rãi", meaning: "unhurried / leisurely" },
      { word: "quây quần", meaning: "gather warmly together" },
    ],
  },
  {
    id: "le-self-5",
    topicId: "self",
    type: "best-response",
    titleVi: "Chia sẻ về sở thích mới ngoài giờ làm",
    speakerLabel: "Chị Hoa · Trưởng phòng nhân sự",
    audioTextVi: "Nghe nói ngoài giờ làm hành chính em còn đăng ký thêm lớp nhiếp ảnh buổi tối. Điều gì truyền cảm hứng để em theo đuổi sở thích khá thú vị này vậy?",
    transcriptVi: "Nghe nói ngoài giờ làm hành chính em còn đăng ký thêm lớp nhiếp ảnh buổi tối. Điều gì truyền cảm hứng để em theo đuổi sở thích khá thú vị này vậy?",
    translationEn: "I heard that outside regular office hours you also signed up for an evening photography class. What inspired you to pursue such an interesting hobby?",
    questionVi: "Câu trả lời nào tự nhiên và đúng trọng tâm nhất?",
    options: [
      {
        id: "a",
        textVi: "Dạ máy ảnh của em mua ở cửa hàng gần nhà ga vào tháng trước ạ.",
        explanationVi: "Chưa trả lời câu hỏi về nguồn cảm hứng theo đuổi nhiếp ảnh.",
      },
      {
        id: "b",
        textVi: "Công việc văn phòng dạo này nhiều giấy tờ nên em hay ngủ lúc mười giờ.",
        explanationVi: "Lạc đề khỏi câu hỏi của chị Hoa về lớp nhiếp ảnh buổi tối.",
      },
      {
        id: "c",
        textVi: "Dạ em muốn có thêm một hoạt động sáng tạo để xả hơi sau giờ làm và lưu lại những khoảnh khắc đời thường quanh phố ạ.",
        explanationVi: "Rất tự nhiên và trưởng thành: trả lời đúng trọng tâm lý do, giữ thái độ lễ phép với «Dạ ... ạ».",
      },
    ],
    correctOptionId: "c",
    hintVi: "Tìm câu giải thích lý do hoặc động lực học nhiếp ảnh ngoài giờ làm.",
    keyVocab: [
      { word: "giờ làm hành chính", meaning: "regular office hours" },
      { word: "truyền cảm hứng", meaning: "to inspire" },
      { word: "theo đuổi", meaning: "to pursue" },
    ],
  },
  {
    id: "le-self-6",
    topicId: "self",
    type: "fill-blank",
    titleVi: "Điền tính từ mô tả phong thái làm việc",
    speakerLabel: "Mai · Chuyên viên truyền thông",
    audioTextVi: "Mọi người trong phòng hay nhận xét mình có phong thái khá điềm tĩnh. Kể cả lúc gặp sự cố gấp với khách hàng, mình vẫn ưu tiên bình tĩnh tìm cách xử lý trước thay vì lo cuống lên.",
    transcriptVi: "Mọi người trong phòng hay nhận xét mình có phong thái khá điềm tĩnh. Kể cả lúc gặp sự cố gấp với khách hàng, mình vẫn ưu tiên bình tĩnh tìm cách xử lý trước thay vì lo cuống lên.",
    translationEn: "Everyone on the team tends to say I have a pretty composed demeanor. Even when an urgent client issue pops up, I prioritize staying calm and finding a solution instead of panicking.",
    questionVi: "Nghe và điền tính từ còn thiếu: «Mọi người trong phòng hay nhận xét mình có phong thái khá _____.»",
    options: [
      {
        id: "a",
        textVi: "điềm tĩnh",
        explanationVi: "Chính xác! «Điềm tĩnh» mô tả phong thái bình tĩnh, chững chạc trước áp lực.",
      },
      {
        id: "b",
        textVi: "điểm tin",
        explanationVi: "Nhầm âm gần giống — «điểm tin» là tóm tắt tin tức, không phải tính từ chỉ phong thái.",
      },
      {
        id: "c",
        textVi: "điều chỉnh",
        explanationVi: "Sai âm và sai từ loại — «điều chỉnh» là động từ (to adjust).",
      },
    ],
    correctOptionId: "a",
    hintVi: "Cụm từ gồm thanh huyền («điềm») đi với thanh ngã («tĩnh»).",
    keyVocab: [
      { word: "phong thái", meaning: "demeanor / bearing" },
      { word: "điềm tĩnh", meaning: "composed / level-headed" },
      { word: "sự cố gấp", meaning: "urgent incident" },
    ],
  },
  {
    id: "le-self-7",
    topicId: "self",
    type: "comprehension",
    titleVi: "Rẽ hướng mở tiệm sách nhỏ ở Đà Lạt",
    speakerLabel: "Hoàng · Chủ tiệm sách độc lập",
    audioTextVi: "Trước đây mình làm ở ngân hàng gần bảy năm nhưng cảm thấy ngày càng thiếu gắn kết với công việc. Hai năm trước mình chuyển lên Đà Lạt mở một tiệm sách nhỏ kết hợp tổ chức câu lạc bộ đọc sách mỗi chiều thứ Bảy.",
    transcriptVi: "Trước đây mình làm ở ngân hàng gần bảy năm nhưng cảm thấy ngày càng thiếu gắn kết với công việc. Hai năm trước mình chuyển lên Đà Lạt mở một tiệm sách nhỏ kết hợp tổ chức câu lạc bộ đọc sách mỗi chiều thứ Bảy.",
    translationEn: "Previously I worked at a bank for nearly seven years, yet I felt less and less connected to my job. Two years ago I moved up to Dalat to open a small bookstore combined with a Saturday afternoon reading club.",
    questionVi: "Ngoài việc bán sách, tiệm của anh Hoàng còn tổ chức hoạt động gì?",
    options: [
      {
        id: "a",
        textVi: "Lớp tư vấn tài chính cá nhân cho khách du lịch",
        explanationVi: "Sai — ngân hàng là công việc cũ trước khi Hoàng lên Đà Lạt.",
      },
      {
        id: "b",
        textVi: "Câu lạc bộ đọc sách vào mỗi chiều thứ Bảy",
        explanationVi: "Chính xác! Hoàng nói tiệm sách «kết hợp tổ chức câu lạc bộ đọc sách mỗi chiều thứ Bảy».",
      },
      {
        id: "c",
        textVi: "Đêm nhạc ngoài trời vào tối Chủ nhật hằng tuần",
        explanationVi: "Đoạn nghe không nhắc tới đêm nhạc hay lịch tối Chủ nhật.",
      },
    ],
    correctOptionId: "b",
    hintVi: "Nghe kỹ vế cuối câu sau cụm «kết hợp tổ chức...».",
    keyVocab: [
      { word: "thiếu gắn kết", meaning: "disconnected / disengaged" },
      { word: "tiệm sách", meaning: "bookstore" },
      { word: "câu lạc bộ", meaning: "club / community group" },
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
  {
    id: "le-food-4",
    topicId: "food",
    type: "best-response",
    titleVi: "Bàn chuyện nấu bữa tối ngày se lạnh",
    speakerLabel: "Tâm · Bạn cùng căn hộ",
    audioTextVi: "Tối nay trời hơi se lạnh mà tủ lạnh nhà mình còn ít thịt bò, gừng tươi với cải thảo. Cậu thích mình nấu canh gừng nóng hổi hay làm một nồi lẩu bò nhỏ ăn cho ấm bụng?",
    transcriptVi: "Tối nay trời hơi se lạnh mà tủ lạnh nhà mình còn ít thịt bò, gừng tươi với cải thảo. Cậu thích mình nấu canh gừng nóng hổi hay làm một nồi lẩu bò nhỏ ăn cho ấm bụng?",
    translationEn: "It's a bit chilly tonight and our fridge still has some beef, fresh ginger, and napa cabbage. Would you rather I make hot ginger soup or put together a small beef hotpot to warm us up?",
    questionVi: "Câu trả lời nào tự nhiên và giúp chốt bữa tối nhanh nhất?",
    options: [
      {
        id: "a",
        textVi: "Mùa đông ở Hà Nội thường lạnh hơn ở Sài Gòn khá nhiều đấy.",
        explanationVi: "Nói chuyện thời tiết chung chung, không chọn một trong hai món Tâm gợi ý.",
      },
      {
        id: "b",
        textVi: "Siêu thị đầu ngõ hôm nay đóng cửa lúc chín giờ tối cậu ạ.",
        explanationVi: "Không trả lời câu hỏi nên nấu canh gừng hay lẩu bò.",
      },
      {
        id: "c",
        textVi: "Làm nồi lẩu bò nhỏ đi cậu, để mình rửa rau với pha thêm bát nước chấm gừng nhé!",
        explanationVi: "Rất tự nhiên và thân tình: chọn rõ món gợi ý và chủ động chia việc bếp.",
      },
    ],
    correctOptionId: "c",
    hintVi: "Chọn câu phản hồi có quyết định rõ một món và phối hợp chuẩn bị bữa tối.",
    keyVocab: [
      { word: "nóng hổi", meaning: "piping hot" },
      { word: "ấm bụng", meaning: "warming and comforting to the stomach" },
      { word: "cải thảo", meaning: "napa cabbage" },
    ],
  },
  {
    id: "le-food-5",
    topicId: "food",
    type: "fill-blank",
    titleVi: "Điền tính từ tả kết cấu bánh xèo miền Trung",
    speakerLabel: "Thảo · Người gốc Quảng Nam",
    audioTextVi: "Bánh xèo miền Trung đổ khuôn nhỏ hơn trong Nam một chút, nhưng vì tráng bột mỏng nên lúc mới ra lò ăn rất giòn rụm. Cuốn cùng rau sống và chấm nước mắm tỏi ớt là tròn vị ngay.",
    transcriptVi: "Bánh xèo miền Trung đổ khuôn nhỏ hơn trong Nam một chút, nhưng vì tráng bột mỏng nên lúc mới ra lò ăn rất giòn rụm. Cuốn cùng rau sống và chấm nước mắm tỏi ớt là tròn vị ngay.",
    translationEn: "Central-style banh xeo is poured in a slightly smaller pan than in the South, and because the batter is spread thin, it tastes super crispy right off the stove. Wrapped with fresh herbs and dipped in garlic-chili fish sauce, the flavor is spot-on.",
    questionVi: "Nghe và điền từ đúng vào chỗ trống: «...vì tráng bột mỏng nên lúc mới ra lò ăn rất _____.»",
    options: [
      {
        id: "a",
        textVi: "gọn gàng",
        explanationVi: "Sai nghĩa — «gọn gàng» dùng tả không gian ngăn nắp, không tả độ giòn của món ăn.",
      },
      {
        id: "b",
        textVi: "giòn rụm",
        explanationVi: "Chính xác! «Giòn rụm» diễn tả lớp vỏ bánh chiên giòn tan rất hấp dẫn.",
      },
      {
        id: "c",
        textVi: "chậm rãi",
        explanationVi: "Sai âm và sai nghĩa — «chậm rãi» chỉ tốc độ thong thả.",
      },
    ],
    correctOptionId: "b",
    hintVi: "Từ láy bắt đầu bằng «giòn» (thanh huyền) mô tả tiếng vỡ giòn khi cắn.",
    keyVocab: [
      { word: "tráng bột", meaning: "spread batter thinly in a pan" },
      { word: "giòn rụm", meaning: "super crispy / crunchy" },
      { word: "tròn vị", meaning: "well-rounded in flavor" },
    ],
  },
  {
    id: "le-food-6",
    topicId: "food",
    type: "comprehension",
    titleVi: "Quán chay quen thuộc trong hẻm quận Ba",
    speakerLabel: "Chị Yến · Nhân viên ngân hàng",
    audioTextVi: "Mỗi dịp mùng một hay ngày rằm, mình hay đưa bố mẹ tới một quán chay nhỏ trong hẻm quận Ba. Điểm mình thích nhất là bếp chỉ dùng nấm tươi và hạt sen chứ không dùng đồ giả mặn nhiều dầu mỡ.",
    transcriptVi: "Mỗi dịp mùng một hay ngày rằm, mình hay đưa bố mẹ tới một quán chay nhỏ trong hẻm quận Ba. Điểm mình thích nhất là bếp chỉ dùng nấm tươi và hạt sen chứ không dùng đồ giả mặn nhiều dầu mỡ.",
    translationEn: "On the first and fifteenth of each lunar month, I often take my parents to a small vegetarian spot in a District 3 alley. What I like most is that the kitchen only uses fresh mushrooms and lotus seeds instead of oily mock meats.",
    questionVi: "Vì sao chị Yến đặc biệt thích quán chay trong hẻm quận Ba?",
    options: [
      {
        id: "a",
        textVi: "Vì quán phục vụ tiệc buffet hải sản vào dịp cuối tuần",
        explanationVi: "Sai — đây là quán chay, không phục vụ hải sản.",
      },
      {
        id: "b",
        textVi: "Vì quán nằm ngay mặt tiền đại lộ lớn rất dễ đậu xe",
        explanationVi: "Không đúng — chị Yến nói quán nằm «trong hẻm quận Ba».",
      },
      {
        id: "c",
        textVi: "Vì quán nấu từ nấm tươi và hạt sen, không dùng đồ giả mặn nhiều dầu mỡ",
        explanationVi: "Chính xác! Câu thứ hai nêu rõ lý do chị Yến thích nhất ở quán này.",
      },
    ],
    correctOptionId: "c",
    hintVi: "Lắng nghe câu bắt đầu bằng «Điểm mình thích nhất là...».",
    keyVocab: [
      { word: "ngày rằm", meaning: "15th day of the lunar month" },
      { word: "quán chay", meaning: "vegetarian restaurant" },
      { word: "đồ giả mặn", meaning: "mock meat / imitation meat" },
    ],
  },
  {
    id: "le-food-7",
    topicId: "food",
    type: "best-response",
    titleVi: "Thanh toán và gói đồ ăn mang về",
    speakerLabel: "Nhân viên nhà hàng",
    audioTextVi: "Dạ em gửi hóa đơn của bàn mình ạ. Không biết anh chị muốn thanh toán gộp hay chia hóa đơn, và đĩa cá kho còn dư có cần bên em đóng hộp mang về không ạ?",
    transcriptVi: "Dạ em gửi hóa đơn của bàn mình ạ. Không biết anh chị muốn thanh toán gộp hay chia hóa đơn, và đĩa cá kho còn dư có cần bên em đóng hộp mang về không ạ?",
    translationEn: "Here is the bill for your table. Would you like to pay together or split the bill, and would you like us to pack the leftover braised fish to go?",
    questionVi: "Cách trả lời nào lịch sự và đầy đủ thông tin cho nhân viên?",
    options: [
      {
        id: "a",
        textVi: "Em cho anh thanh toán gộp bằng chuyển khoản, và gói giúp anh phần cá kho mang về nhé.",
        explanationVi: "Hoàn hảo! Trả lời đủ cả hai ý nhân viên hỏi với giọng điệu lịch sự, tự nhiên.",
      },
      {
        id: "b",
        textVi: "Cá kho ở quê anh thường ăn cùng cơm trắng và dưa cải muối.",
        explanationVi: "Không trả lời câu hỏi về thanh toán và đóng hộp mang về.",
      },
      {
        id: "c",
        textVi: "Hôm nay nhóm anh có năm người từ văn phòng đi bộ sang đây ăn trưa.",
        explanationVi: "Lạc đề khỏi tình huống tính tiền tại bàn.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Chọn câu trả lời có cả hình thức thanh toán lẫn yêu cầu gói đồ mang về.",
    keyVocab: [
      { word: "thanh toán gộp", meaning: "pay on one combined bill" },
      { word: "chia hóa đơn", meaning: "split the bill" },
      { word: "đóng hộp mang về", meaning: "pack leftovers to go" },
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
  {
    id: "le-routine-4",
    topicId: "routine",
    type: "fill-blank",
    titleVi: "Điền từ nói về tính duy trì khi tập thể thao",
    speakerLabel: "Chị Nhung · Kế toán trưởng",
    audioTextVi: "Trước đây mình cứ hứng lên là tập rất nặng rồi bỏ giữa chừng. Giờ mình chỉ đặt mục tiêu chạy bộ đều đặn ba buổi mỗi tuần, vậy mà sức bền lại cải thiện rõ rệt.",
    transcriptVi: "Trước đây mình cứ hứng lên là tập rất nặng rồi bỏ giữa chừng. Giờ mình chỉ đặt mục tiêu chạy bộ đều đặn ba buổi mỗi tuần, vậy mà sức bền lại cải thiện rõ rệt.",
    translationEn: "Before, whenever I felt motivated I'd work out super hard and then quit halfway. Now I just set a goal to jog steadily three times a week, yet my stamina has noticeably improved.",
    questionVi: "Nghe và điền từ còn thiếu: «Giờ mình chỉ đặt mục tiêu chạy bộ _____ ba buổi mỗi tuần...»",
    options: [
      {
        id: "a",
        textVi: "đầy đủ",
        explanationVi: "Sai âm và không tự nhiên bằng từ chị Nhung dùng cho nhịp tập luyện.",
      },
      {
        id: "b",
        textVi: "đều đặn",
        explanationVi: "Chính xác! «Đều đặn» nhấn mạnh việc giữ lịch tập ổn định, không đứt quãng.",
      },
      {
        id: "c",
        textVi: "đúng đắn",
        explanationVi: "Sai nghĩa — «đúng đắn» dùng cho quyết định hoặc quan điểm đúng.",
      },
    ],
    correctOptionId: "b",
    hintVi: "Từ láy phụ âm đầu «đ» mang thanh huyền + thanh nặng.",
    keyVocab: [
      { word: "bỏ giữa chừng", meaning: "quit halfway" },
      { word: "đều đặn", meaning: "regularly / consistently" },
      { word: "sức bền", meaning: "stamina / endurance" },
    ],
  },
  {
    id: "le-routine-5",
    topicId: "routine",
    type: "comprehension",
    titleVi: "Cách chia lịch làm việc theo nhóm đầu việc",
    speakerLabel: "Anh Tùng · Thiết kế tự do",
    audioTextVi: "Vì làm thiết kế tự do nên mình tự chia tuần làm việc khá rõ ràng. Thứ Hai và thứ Ba dành trọn cho các cuộc họp khách hàng, còn giữa tuần mình ra quán cà phê yên tĩnh gần hồ Tây để tập trung vẽ.",
    transcriptVi: "Vì làm thiết kế tự do nên mình tự chia tuần làm việc khá rõ ràng. Thứ Hai và thứ Ba dành trọn cho các cuộc họp khách hàng, còn giữa tuần mình ra quán cà phê yên tĩnh gần hồ Tây để tập trung vẽ.",
    translationEn: "Since I'm a freelance designer, I divide my workweek pretty clearly. Monday and Tuesday are dedicated entirely to client meetings, while midweek I head to a quiet cafe near West Lake to focus on drawing.",
    questionVi: "Vào thứ Hai và thứ Ba, anh Tùng thường ưu tiên việc gì?",
    options: [
      {
        id: "a",
        textVi: "Họp và trao đổi với khách hàng",
        explanationVi: "Chính xác! Tùng nói rõ thứ Hai và thứ Ba «dành trọn cho các cuộc họp khách hàng».",
      },
      {
        id: "b",
        textVi: "Ra quán cà phê gần hồ Tây để tập trung vẽ",
        explanationVi: "Đó là lịch giữa tuần của anh Tùng, không phải thứ Hai và thứ Ba.",
      },
      {
        id: "c",
        textVi: "Nghỉ ngơi hoàn toàn và không mở máy tính",
        explanationVi: "Không có thông tin này trong đoạn nghe.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Nghe phần đầu của câu thứ hai ngay sau «Thứ Hai và thứ Ba...».",
    keyVocab: [
      { word: "làm tự do", meaning: "work freelance" },
      { word: "dành trọn", meaning: "dedicate entirely" },
      { word: "giữa tuần", meaning: "midweek" },
    ],
  },
  {
    id: "le-routine-6",
    topicId: "routine",
    type: "best-response",
    titleVi: "Chia sẻ bí quyết chuẩn bị cơm trưa khi bận rộn",
    speakerLabel: "Chị Lan · Đồng nghiệp cùng tầng",
    audioTextVi: "Tuần này thấy em tối nào cũng về sau bảy giờ, làm sao em vẫn tự nấu cơm mang đi làm được hay vậy? Chị đi làm về mệt là toàn đặt đồ ăn ngoài thôi.",
    transcriptVi: "Tuần này thấy em tối nào cũng về sau bảy giờ, làm sao em vẫn tự nấu cơm mang đi làm được hay vậy? Chị đi làm về mệt là toàn đặt đồ ăn ngoài thôi.",
    translationEn: "I noticed you've been getting home past seven every night this week — how do you still manage to cook lunch to bring to work? Whenever I get home tired I just end up ordering takeout.",
    questionVi: "Câu phản hồi nào tự nhiên và chia sẻ kinh nghiệm thiết thực nhất?",
    options: [
      {
        id: "a",
        textVi: "Dạ quán phở gần công ty em mở cửa từ sáu giờ sáng chị ạ.",
        explanationVi: "Không giải thích cách bạn tự nấu cơm mang đi làm.",
      },
      {
        id: "b",
        textVi: "Em không thích ăn tối muộn vì sợ ảnh hưởng đến giấc ngủ.",
        explanationVi: "Chưa trả lời câu hỏi làm sao xoay xở thời gian nấu nướng.",
      },
      {
        id: "c",
        textVi: "Dạ em hay sơ chế sẵn rau thịt vào chiều Chủ nhật, nên trong tuần về nhà chỉ mất khoảng hai mươi phút nấu thôi chị ạ.",
        explanationVi: "Rất tự nhiên, gần gũi và chia sẻ mẹo quản lý thời gian cụ thể.",
      },
    ],
    correctOptionId: "c",
    hintVi: "Tìm câu giải thích cách tiết kiệm thời gian nấu nướng trong tuần bận rộn.",
    keyVocab: [
      { word: "sơ chế sẵn", meaning: "pre-prep ingredients ahead of time" },
      { word: "đặt đồ ăn ngoài", meaning: "order takeout / delivery" },
      { word: "mang đi làm", meaning: "pack to bring to work" },
    ],
  },
  {
    id: "le-routine-7",
    topicId: "routine",
    type: "fill-blank",
    titleVi: "Điền động từ nói về giấc ngủ trưa ngắn",
    speakerLabel: "Minh · Chuyên viên tín dụng",
    audioTextVi: "Giờ nghỉ trưa ở công ty chỉ có một tiếng nhưng mình vẫn giữ thói quen ăn gọn gàng rồi chợp mắt khoảng mười lăm phút. Nhờ vậy buổi chiều họp dài mình không bị uể oải.",
    transcriptVi: "Giờ nghỉ trưa ở công ty chỉ có một tiếng nhưng mình vẫn giữ thói quen ăn gọn gàng rồi chợp mắt khoảng mười lăm phút. Nhờ vậy buổi chiều họp dài mình không bị uể oải.",
    translationEn: "Our office lunch break is only an hour, yet I still keep the habit of eating quickly and taking a fifteen-minute catnap. Thanks to that, I don't feel sluggish during long afternoon meetings.",
    questionVi: "Nghe và điền cụm động từ chính xác: «...mình vẫn giữ thói quen ăn gọn gàng rồi _____ khoảng mười lăm phút.»",
    options: [
      {
        id: "a",
        textVi: "chớp nhoáng",
        explanationVi: "Sai nghĩa — «chớp nhoáng» là tính từ nghĩa là diễn ra rất nhanh (flash/brief).",
      },
      {
        id: "b",
        textVi: "chợp mắt",
        explanationVi: "Chính xác! «Chợp mắt» nghĩa là ngủ tranh thủ một giấc rất ngắn để lấy lại tỉnh táo.",
      },
      {
        id: "c",
        textVi: "chậm trễ",
        explanationVi: "Sai âm và sai nghĩa — «chậm trễ» nghĩa là trễ nải, chậm tiến độ.",
      },
    ],
    correctOptionId: "b",
    hintVi: "Cụm động từ gồm «chợp» (thanh nặng) và «mắt» (thanh sắc).",
    keyVocab: [
      { word: "giờ nghỉ trưa", meaning: "lunch break" },
      { word: "chợp mắt", meaning: "take a brief nap / shut one's eyes" },
      { word: "uể oải", meaning: "sluggish / lethargic" },
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
  {
    id: "le-weather-4",
    topicId: "weather",
    type: "comprehension",
    titleVi: "Lưu ý chuẩn bị đồ khi lên Đà Lạt tháng Mười Hai",
    speakerLabel: "Anh Kiên · Hướng dẫn viên tại Đà Lạt",
    audioTextVi: "Tháng Mười Hai lên Đà Lạt rất đẹp vì buổi trưa có nắng nhẹ, nhiệt độ khoảng hai mươi hai độ. Tuy nhiên sau năm giờ chiều sương mù xuống nhanh và trời lạnh hẳn, nên anh chị nhớ mang áo khoác gió và khăn mỏng nhé.",
    transcriptVi: "Tháng Mười Hai lên Đà Lạt rất đẹp vì buổi trưa có nắng nhẹ, nhiệt độ khoảng hai mươi hai độ. Tuy nhiên sau năm giờ chiều sương mù xuống nhanh và trời lạnh hẳn, nên anh chị nhớ mang áo khoác gió và khăn mỏng nhé.",
    translationEn: "Visiting Dalat in December is lovely because midday brings mild sunshine around 22°C. However, after 5 p.m. mist rolls in quickly and it turns noticeably cold, so remember to bring a windbreaker and a light scarf.",
    questionVi: "Theo anh Kiên, thời tiết Đà Lạt tháng Mười Hai thay đổi thế nào sau 5 giờ chiều?",
    options: [
      {
        id: "a",
        textVi: "Trời chuyển sang nắng gắt và nóng oi bức",
        explanationVi: "Ngược hoàn toàn với mô tả về chiều tối ở Đà Lạt.",
      },
      {
        id: "b",
        textVi: "Xuất hiện mưa rào lớn kéo dài tới sáng hôm sau",
        explanationVi: "Anh Kiên không nhắc tới mưa rào trong đoạn này.",
      },
      {
        id: "c",
        textVi: "Sương mù xuống nhanh và nhiệt độ giảm lạnh hẳn",
        explanationVi: "Chính xác! Câu thứ hai nói rõ: «sau năm giờ chiều sương mù xuống nhanh và trời lạnh hẳn».",
      },
    ],
    correctOptionId: "c",
    hintVi: "Lắng nghe câu sau liên từ tương phản «Tuy nhiên...».",
    keyVocab: [
      { word: "nắng nhẹ", meaning: "mild sunshine" },
      { word: "sương mù", meaning: "fog / mist" },
      { word: "áo khoác gió", meaning: "windbreaker jacket" },
    ],
  },
  {
    id: "le-weather-5",
    topicId: "weather",
    type: "best-response",
    titleVi: "Ứng phó lịch công tác khi có áp thấp nhiệt đới",
    speakerLabel: "Anh Hưng · Trưởng nhóm kinh doanh",
    audioTextVi: "Mình mới xem tin thấy thứ Năm này có áp thấp nhiệt đới đi vào miền Trung, đúng hôm nhóm mình bay vào Đà Nẵng gặp đối tác. Theo cậu mình nên xử lý lịch công tác thế nào?",
    transcriptVi: "Mình mới xem tin thấy thứ Năm này có áp thấp nhiệt đới đi vào miền Trung, đúng hôm nhóm mình bay vào Đà Nẵng gặp đối tác. Theo cậu mình nên xử lý lịch công tác thế nào?",
    translationEn: "I just saw the news that a tropical depression is hitting Central Vietnam this Thursday, the exact day our team flies to Da Nang to meet the partner. How do you think we should handle our trip schedule?",
    questionVi: "Lời đáp nào thực tế và chuyên nghiệp nhất trong tình huống này?",
    options: [
      {
        id: "a",
        textVi: "Mùa hè năm ngoái mình từng đi tắm biển ở Đà Nẵng rất thích.",
        explanationVi: "Lạc đề khỏi việc điều chỉnh lịch công tác sắp tới.",
      },
      {
        id: "b",
        textVi: "Mình nên liên hệ sớm với đối tác để đề xuất họp trực tuyến trước, hoặc dời chuyến bay sang đầu tuần sau khi thời tiết ổn định hơn.",
        explanationVi: "Rất chuyên nghiệp và hợp lý: chủ động báo đối tác và đưa ra phương án dự phòng an toàn.",
      },
      {
        id: "c",
        textVi: "Áp thấp nhiệt đới là hiện tượng khí tượng khá phổ biến vào mùa thu.",
        explanationVi: "Chỉ nêu định nghĩa sách vở, không giải quyết câu hỏi xử lý lịch trình.",
      },
    ],
    correctOptionId: "b",
    hintVi: "Chọn câu đưa ra phương án điều chỉnh cụ thể để đảm bảo an toàn và công việc.",
    keyVocab: [
      { word: "áp thấp nhiệt đới", meaning: "tropical depression" },
      { word: "lịch công tác", meaning: "business trip schedule" },
      { word: "ổn định", meaning: "stable / settled" },
    ],
  },
  {
    id: "le-weather-6",
    topicId: "weather",
    type: "fill-blank",
    titleVi: "Điền cụm từ tả cái nắng mùa hè miền Trung",
    speakerLabel: "Chị Nga · Kiến trúc sư tại Huế",
    audioTextVi: "Mùa hè ở miền Trung buổi trưa thường nắng gắt kèm gió nóng nên đường phố khá vắng vẻ. Phải tầm năm giờ chiều khi gió biển thổi vào mát dịu thì mọi người mới ra công viên tản bộ.",
    transcriptVi: "Mùa hè ở miền Trung buổi trưa thường nắng gắt kèm gió nóng nên đường phố khá vắng vẻ. Phải tầm năm giờ chiều khi gió biển thổi vào mát dịu thì mọi người mới ra công viên tản bộ.",
    translationEn: "Summer middays in Central Vietnam are usually scorching with hot wind, so the streets stay fairly quiet. People only come out to stroll in the park around 5 p.m. when the cool sea breeze blows in.",
    questionVi: "Nghe và điền cụm từ tả thời tiết: «Mùa hè ở miền Trung buổi trưa thường _____ kèm gió nóng...»",
    options: [
      {
        id: "a",
        textVi: "nắng gắt",
        explanationVi: "Chính xác! «Nắng gắt» mô tả ánh nắng chói chang, gay gắt giữa trưa hè.",
      },
      {
        id: "b",
        textVi: "nắng nhạt",
        explanationVi: "Trái sắc thái — «nắng nhạt» là nắng yếu, dịu nhẹ (thường vào mùa đông).",
      },
      {
        id: "c",
        textVi: "nặng hạt",
        explanationVi: "Nhầm âm gần giống — «nặng hạt» dùng để tả hạt mưa to, không tả nắng.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Cả hai tiếng đều mang thanh sắc, tả độ chói và nóng của nắng trưa.",
    keyVocab: [
      { word: "nắng gắt", meaning: "scorching / harsh sunlight" },
      { word: "mát dịu", meaning: "pleasantly cool and mild" },
      { word: "tản bộ", meaning: "take a leisurely stroll" },
    ],
  },
  {
    id: "le-weather-7",
    topicId: "weather",
    type: "comprehension",
    titleVi: "Kinh nghiệm di chuyển vào tối mưa kết hợp triều cường",
    speakerLabel: "Bảo · Nhân viên điều phối tại Sài Gòn",
    audioTextVi: "Mấy tối nay ở Sài Gòn vừa gặp mưa lớn vừa đúng đợt triều cường nên vài con đường gần kênh bị ngập khá sâu. Trước khi ra khỏi công ty mình luôn mở bản đồ kiểm tra tuyến đường để tránh kẹt xe và chết máy.",
    transcriptVi: "Mấy tối nay ở Sài Gòn vừa gặp mưa lớn vừa đúng đợt triều cường nên vài con đường gần kênh bị ngập khá sâu. Trước khi ra khỏi công ty mình luôn mở bản đồ kiểm tra tuyến đường để tránh kẹt xe và chết máy.",
    translationEn: "These past few evenings in Saigon, heavy rain coincided with high tide, flooding several roads near the canal quite deeply. Before leaving the office I always open the map to check routes so I can avoid traffic jams and stalling out.",
    questionVi: "Anh Bảo làm gì trước khi rời công ty vào những tối mưa lớn kết hợp triều cường?",
    options: [
      {
        id: "a",
        textVi: "Ở lại ngủ qua đêm tại văn phòng đến sáng hôm sau",
        explanationVi: "Không có thông tin này trong đoạn nghe.",
      },
      {
        id: "b",
        textVi: "Đặt vé tàu hỏa về nhà thay vì chạy xe máy",
        explanationVi: "Sai — anh Bảo vẫn tự di chuyển và tìm cách tránh chết máy xe.",
      },
      {
        id: "c",
        textVi: "Mở bản đồ kiểm tra tuyến đường để tránh chỗ ngập, kẹt xe và chết máy",
        explanationVi: "Chính xác! Câu thứ hai nêu trực tiếp thói quen kiểm tra bản đồ trước khi rời công ty.",
      },
    ],
    correctOptionId: "c",
    hintVi: "Nghe kỹ câu bắt đầu bằng «Trước khi ra khỏi công ty...».",
    keyVocab: [
      { word: "triều cường", meaning: "high tide / king tide" },
      { word: "ngập", meaning: "flooded" },
      { word: "chết máy", meaning: "engine stalling (in water)" },
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
  {
    id: "le-emotions-4",
    topicId: "emotions",
    type: "best-response",
    titleVi: "Trấn an đồng nghiệp sau sai sót nhỏ khi thuyết trình",
    speakerLabel: "Minh Quân · Chuyên viên phân tích",
    audioTextVi: "Chết rồi chị ơi, nãy thuyết trình trước khách hàng em đọc nhầm một con số trong báo cáo. Em áy náy quá, chỉ sợ cả nhóm bị ảnh hưởng vì lỗi của em thôi.",
    transcriptVi: "Chết rồi chị ơi, nãy thuyết trình trước khách hàng em đọc nhầm một con số trong báo cáo. Em áy náy quá, chỉ sợ cả nhóm bị ảnh hưởng vì lỗi của em thôi.",
    translationEn: "Oh no, during the client presentation just now I misread a number from the report. I feel terrible — I'm just worried the whole team will be affected because of my mistake.",
    questionVi: "Lời phản hồi nào vừa trấn an đồng nghiệp vừa giúp giải quyết vấn đề hiệu quả?",
    options: [
      {
        id: "a",
        textVi: "Em làm việc cẩu thả quá, lần sau chắc không thể giao việc quan trọng nữa.",
        explanationVi: "Quá gay gắt, khiến đồng nghiệp thêm hoảng loạn thay vì xử lý tình huống.",
      },
      {
        id: "b",
        textVi: "Đừng quá căng thẳng em nhé, số liệu trên slide vẫn đúng mà. Chút nữa mình gửi email đính chính ngắn gọn cho khách hàng là ổn thôi.",
        explanationVi: "Rất chuyên nghiệp và tinh tế: trấn an cảm xúc trước rồi đưa ra bước xử lý gọn gàng.",
      },
      {
        id: "c",
        textVi: "Chiều nay công ty mình có tiệc trà mừng sinh nhật các thành viên tháng này đấy.",
        explanationVi: "Lơ đi nỗi lo lắng của đồng nghiệp và chuyển đề tài không phù hợp.",
      },
    ],
    correctOptionId: "b",
    hintVi: "Tìm câu vừa xoa dịu sự áy náy vừa đề xuất cách khắc phục thực tế.",
    keyVocab: [
      { word: "áy náy", meaning: "remorseful / uneasy over a mistake" },
      { word: "bị ảnh hưởng", meaning: "be negatively affected" },
      { word: "đính chính", meaning: "issue a correction / clarify" },
    ],
  },
  {
    id: "le-emotions-5",
    topicId: "emotions",
    type: "fill-blank",
    titleVi: "Điền cụm từ diễn tả sự xúc động ấm áp",
    speakerLabel: "Chị Thư · Nhân viên xuất nhập khẩu",
    audioTextVi: "Hồi mới chuyển vào Sài Gòn sống một mình, nhiều tối mình thấy hơi lạc lõng. Vậy mà hôm mình bị cảm sốt, cô hàng xóm lại mang sang tô cháo nóng khiến mình thấy ấm lòng vô cùng.",
    transcriptVi: "Hồi mới chuyển vào Sài Gòn sống một mình, nhiều tối mình thấy hơi lạc lõng. Vậy mà hôm mình bị cảm sốt, cô hàng xóm lại mang sang tô cháo nóng khiến mình thấy ấm lòng vô cùng.",
    translationEn: "When I first moved to Saigon to live alone, I felt a bit out of place on many evenings. Yet the day I came down with a fever, my neighbor brought over a hot bowl of porridge, which warmed my heart tremendously.",
    questionVi: "Nghe và điền cụm từ chỉ cảm xúc: «...cô hàng xóm lại mang sang tô cháo nóng khiến mình thấy _____ vô cùng.»",
    options: [
      {
        id: "a",
        textVi: "âm thầm",
        explanationVi: "Sai âm và sai nghĩa — «âm thầm» nghĩa là lặng lẽ, kín đáo.",
      },
      {
        id: "b",
        textVi: "an phận",
        explanationVi: "Sai nghĩa — «an phận» nghĩa là bằng lòng với vị trí hiện tại, không phấn đấu thêm.",
      },
      {
        id: "c",
        textVi: "ấm lòng",
        explanationVi: "Chính xác! «Ấm lòng» diễn tả cảm giác được quan tâm, xúc động và bớt cô đơn.",
      },
    ],
    correctOptionId: "c",
    hintVi: "Cụm từ bắt đầu bằng «ấm» (thanh sắc) ghép với «lòng» (thanh huyền).",
    keyVocab: [
      { word: "lạc lõng", meaning: "out of place / lonely" },
      { word: "cảm sốt", meaning: "come down with a cold and fever" },
      { word: "ấm lòng", meaning: "heartwarming / touched" },
    ],
  },
  {
    id: "le-emotions-6",
    topicId: "emotions",
    type: "comprehension",
    titleVi: "Học cách ngắt kết nối công việc dịp cuối tuần",
    speakerLabel: "Anh Long · Quản lý bán hàng",
    audioTextVi: "Trước kia cuối tuần nào mình cũng mở tin nhắn công việc liên tục nên lúc nào cũng cảm thấy bồn chồn không yên. Từ ngày tập ngắt kết nối hẳn hai ngày nghỉ, mình thấy nhẹ đầu và dành được thời gian trọn vẹn hơn cho con gái.",
    transcriptVi: "Trước kia cuối tuần nào mình cũng mở tin nhắn công việc liên tục nên lúc nào cũng cảm thấy bồn chồn không yên. Từ ngày tập ngắt kết nối hẳn hai ngày nghỉ, mình thấy nhẹ đầu và dành được thời gian trọn vẹn hơn cho con gái.",
    translationEn: "In the past I checked work messages constantly every weekend, so I always felt restless and uneasy. Ever since I practiced fully unplugging on my two days off, my mind feels lighter and I can spend more present time with my daughter.",
    questionVi: "Điều gì giúp anh Long bớt cảm giác bồn chồn vào dịp cuối tuần?",
    options: [
      {
        id: "a",
        textVi: "Chuyển sang làm việc bán thời gian từ thứ Hai đến thứ Tư",
        explanationVi: "Không có thông tin đổi sang làm bán thời gian trong đoạn nghe.",
      },
      {
        id: "b",
        textVi: "Tập ngắt kết nối hẳn với tin nhắn công việc trong hai ngày nghỉ",
        explanationVi: "Chính xác! Long chia sẻ từ ngày «ngắt kết nối hẳn hai ngày nghỉ», anh thấy nhẹ đầu hơn hẳn.",
      },
      {
        id: "c",
        textVi: "Thuê thêm trợ lý trả lời email thay vào mỗi buổi tối",
        explanationVi: "Đoạn nghe không hề nhắc đến việc thuê trợ lý.",
      },
    ],
    correctOptionId: "b",
    hintVi: "Chú ý sự thay đổi bắt đầu từ cụm «Từ ngày tập...».",
    keyVocab: [
      { word: "bồn chồn", meaning: "restless / uneasy" },
      { word: "ngắt kết nối", meaning: "unplug / disconnect" },
      { word: "trọn vẹn", meaning: "wholehearted / fully present" },
    ],
  },
  {
    id: "le-emotions-7",
    topicId: "emotions",
    type: "best-response",
    titleVi: "Chia vui khi bạn thân báo tin đậu học bổng",
    speakerLabel: "Trang · Bạn đại học",
    audioTextVi: "Cậu ơi, mình vừa nhận được email báo trúng tuyển học bổng thạc sĩ rồi! Mấy tháng ôn thi có lúc mình nản lắm, giờ cầm kết quả trên tay mà vẫn chưa tin nổi luôn.",
    transcriptVi: "Cậu ơi, mình vừa nhận được email báo trúng tuyển học bổng thạc sĩ rồi! Mấy tháng ôn thi có lúc mình nản lắm, giờ cầm kết quả trên tay mà vẫn chưa tin nổi luôn.",
    translationEn: "Hey, I just got the email saying I won the master's scholarship! During those months of exam prep I felt so discouraged at times — holding the result now I still can't believe it.",
    questionVi: "Câu chúc mừng nào ấm áp và tự nhiên nhất với bạn thân?",
    options: [
      {
        id: "a",
        textVi: "Chúc mừng cậu nhiều lắm! Bao tháng ngày cậu cố gắng cuối cùng cũng được đền đáp xứng đáng rồi, cuối tuần mình đi ăn mừng nhé!",
        explanationVi: "Rất chân thành và ấm áp: chia vui ngay lập tức, ghi nhận nỗ lực của bạn và rủ đi ăn mừng.",
      },
      {
        id: "b",
        textVi: "Học thạc sĩ tốn nhiều thời gian đọc tài liệu lắm, cậu suy nghĩ kỹ chưa?",
        explanationVi: "Làm cụt hứng ngay lúc bạn đang vô cùng hạnh phúc báo tin vui.",
      },
      {
        id: "c",
        textVi: "Hôm nay mình cũng vừa dọn dẹp xong bàn làm việc ở nhà.",
        explanationVi: "Thờ ơ và không liên quan tới tin vui lớn của bạn thân.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Chọn câu vừa chúc mừng nhiệt tình vừa ghi nhận nỗ lực thời gian qua của Trang.",
    keyVocab: [
      { word: "trúng tuyển", meaning: "be admitted / selected" },
      { word: "học bổng", meaning: "scholarship" },
      { word: "đền đáp xứng đáng", meaning: "deservedly rewarded" },
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
  {
    id: "le-opinions-4",
    topicId: "opinions",
    type: "fill-blank",
    titleVi: "Điền liên từ chuyển ý về thanh toán không tiền mặt",
    speakerLabel: "Chị Diễm · Cố vấn tài chính cá nhân",
    audioTextVi: "Thanh toán bằng cách quét mã rất nhanh gọn và tiện theo dõi lịch sử giao dịch. Tuy nhiên, nếu không đặt hạn mức hằng tháng, nhiều người rất dễ chi tiêu vượt ngân sách mà không để ý.",
    transcriptVi: "Thanh toán bằng cách quét mã rất nhanh gọn và tiện theo dõi lịch sử giao dịch. Tuy nhiên, nếu không đặt hạn mức hằng tháng, nhiều người rất dễ chi tiêu vượt ngân sách mà không để ý.",
    translationEn: "Paying by scanning a QR code is super quick and convenient for tracking transaction history. However, without setting a monthly cap, many people easily overspend their budget without noticing.",
    questionVi: "Nghe và điền liên từ nối chính xác: «...tiện theo dõi lịch sử giao dịch. _____, nếu không đặt hạn mức hằng tháng, nhiều người rất dễ chi tiêu vượt ngân sách...»",
    options: [
      {
        id: "a",
        textVi: "Tất nhiên",
        explanationVi: "Sai sắc thái lập luận — «tất nhiên» khẳng định điều hiển nhiên, không chuyển sang lưu ý trái chiều.",
      },
      {
        id: "b",
        textVi: "Tự nhiên",
        explanationVi: "Nhầm âm gần giống — «tự nhiên» nghĩa là tự dưng / thuộc về thiên nhiên.",
      },
      {
        id: "c",
        textVi: "Tuy nhiên",
        explanationVi: "Chính xác! «Tuy nhiên» (however) mở ra mặt thận trọng đối lập với ưu điểm nêu trước đó.",
      },
    ],
    correctOptionId: "c",
    hintVi: "Liên từ nối hai tiếng có âm đầu «tuy» (thanh ngang) + «nhiên» (thanh ngang).",
    keyVocab: [
      { word: "quét mã", meaning: "scan a QR code" },
      { word: "hạn mức", meaning: "spending limit / cap" },
      { word: "vượt ngân sách", meaning: "exceed the budget" },
    ],
  },
  {
    id: "le-opinions-5",
    topicId: "opinions",
    type: "comprehension",
    titleVi: "Góc nhìn về giao thông công cộng ở đô thị lớn",
    speakerLabel: "Anh Đạt · Kỹ sư quy hoạch đô thị",
    audioTextVi: "Tôi rất ủng hộ việc mở rộng các tuyến tàu điện ở Hà Nội và Sài Gòn. Nhưng để người đi làm bỏ hẳn xe máy, thành phố cần cải thiện kết nối chặng cuối như xe buýt gom khách và vỉa hè râm mát cho người đi bộ.",
    transcriptVi: "Tôi rất ủng hộ việc mở rộng các tuyến tàu điện ở Hà Nội và Sài Gòn. Nhưng để người đi làm bỏ hẳn xe máy, thành phố cần cải thiện kết nối chặng cuối như xe buýt gom khách và vỉa hè râm mát cho người đi bộ.",
    translationEn: "I strongly support expanding metro lines in Hanoi and Saigon. Yet for commuters to give up motorbikes completely, cities need better last-mile connections like feeder buses and shaded sidewalks for pedestrians.",
    questionVi: "Theo anh Đạt, điều kiện cần để người đi làm chuyển hẳn sang tàu điện là gì?",
    options: [
      {
        id: "a",
        textVi: "Cải thiện kết nối chặng cuối như xe buýt gom khách và vỉa hè râm mát",
        explanationVi: "Chính xác! Anh Đạt nêu rõ hai giải pháp kết nối chặng cuối ngay trong câu thứ hai.",
      },
      {
        id: "b",
        textVi: "Giảm giá gửi xe máy ở toàn bộ trung tâm thương mại",
        explanationVi: "Không có thông tin này trong đoạn nghe.",
      },
      {
        id: "c",
        textVi: "Chỉ cho phép tàu điện hoạt động vào hai ngày cuối tuần",
        explanationVi: "Sai — anh Đạt đang nói về nhu cầu đi làm hằng ngày của cư dân đô thị.",
      },
    ],
    correctOptionId: "a",
    hintVi: "Lắng nghe phần sau cụm «thành phố cần cải thiện...».",
    keyVocab: [
      { word: "tàu điện", meaning: "urban rail / metro train" },
      { word: "kết nối chặng cuối", meaning: "last-mile connectivity" },
      { word: "vỉa hè", meaning: "sidewalk / pavement" },
    ],
  },
  {
    id: "le-opinions-6",
    topicId: "opinions",
    type: "best-response",
    titleVi: "Trao đổi về thói quen xem video ngắn",
    speakerLabel: "Anh Việt · Đồng nghiệp phòng nội dung",
    audioTextVi: "Mình thấy mấy nền tảng video ngắn đang làm mọi người mất dần kiên nhẫn đọc sách dài. Theo cậu thì chúng ta có nên xóa hẳn các ứng dụng đó khỏi điện thoại không?",
    transcriptVi: "Mình thấy mấy nền tảng video ngắn đang làm mọi người mất dần kiên nhẫn đọc sách dài. Theo cậu thì chúng ta có nên xóa hẳn các ứng dụng đó khỏi điện thoại không?",
    translationEn: "I feel short-form video platforms are making people gradually lose patience for reading long books. In your view, should we delete those apps from our phones altogether?",
    questionVi: "Câu phản hồi nào thể hiện tư duy phản biện cân bằng ở trình độ B1?",
    options: [
      {
        id: "a",
        textVi: "Điện thoại của mình mới mua tháng trước nên pin dùng được cả hai ngày.",
        explanationVi: "Lạc đề khỏi câu hỏi thảo luận về ảnh hưởng của video ngắn.",
      },
      {
        id: "b",
        textVi: "Mình đồng tình là xem quá nhiều dễ giảm khả năng tập trung, nhưng thay vì xóa hẳn, mình có thể giới hạn thời gian xem mỗi ngày và chọn lọc kênh kiến thức hữu ích.",
        explanationVi: "Rất thuyết phục và lịch sự: thừa nhận phần hợp lý rồi đề xuất giải pháp dung hòa thay vì cực đoan.",
      },
      {
        id: "c",
        textVi: "Cậu nói sai hoàn toàn rồi, bây giờ chẳng còn ai đọc sách giấy nữa đâu.",
        explanationVi: "Phủ nhận gay gắt, thiếu sắc thái trao đổi tôn trọng.",
      },
    ],
    correctOptionId: "b",
    hintVi: "Tìm câu vừa đồng tình một phần vừa nêu hướng điều chỉnh hợp lý.",
    keyVocab: [
      { word: "mất dần kiên nhẫn", meaning: "gradually lose patience" },
      { word: "khả năng tập trung", meaning: "attention span / focus" },
      { word: "chọn lọc", meaning: "curate / be selective" },
    ],
  },
  {
    id: "le-opinions-7",
    topicId: "opinions",
    type: "fill-blank",
    titleVi: "Điền cụm từ lập luận về mua sắm bền vững",
    speakerLabel: "Thảo · Nhà sáng lập thương hiệu thời trang xanh",
    audioTextVi: "Quần áo thời trang nhanh nhìn giá ban đầu có vẻ rất rẻ. Nhưng về lâu dài, đầu tư vài món đồ cơ bản chất liệu bền đẹp vừa tiết kiệm tiền vừa giảm lượng rác thải ra môi trường.",
    transcriptVi: "Quần áo thời trang nhanh nhìn giá ban đầu có vẻ rất rẻ. Nhưng về lâu dài, đầu tư vài món đồ cơ bản chất liệu bền đẹp vừa tiết kiệm tiền vừa giảm lượng rác thải ra môi trường.",
    translationEn: "Fast-fashion clothes look very cheap at first glance. Yet in the long run, investing in a few durable basic pieces both saves money and cuts down waste going into the environment.",
    questionVi: "Nghe và điền cụm từ nối còn thiếu: «Nhưng _____, đầu tư vài món đồ cơ bản chất liệu bền đẹp vừa tiết kiệm tiền vừa giảm lượng rác thải...»",
    options: [
      {
        id: "a",
        textVi: "về cơ bản",
        explanationVi: "Sai âm và khác sắc thái — «về cơ bản» nghĩa là basically, không đối chiếu ngắn hạn với dài hạn.",
      },
      {
        id: "b",
        textVi: "về phần mình",
        explanationVi: "Sai âm và sai nghĩa — «về phần mình» nghĩa là as for myself.",
      },
      {
        id: "c",
        textVi: "về lâu dài",
        explanationVi: "Chính xác! «Về lâu dài» (in the long run) đối lập trực tiếp với «ban đầu» ở câu trước.",
      },
    ],
    correctOptionId: "c",
    hintVi: "Cụm ba tiếng đối lập với «ban đầu», mang ý nghĩa xét trong thời gian dài.",
    keyVocab: [
      { word: "thời trang nhanh", meaning: "fast fashion" },
      { word: "về lâu dài", meaning: "in the long run" },
      { word: "rác thải", meaning: "waste / trash" },
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
  {
    id: "rp-self-2",
    topicId: "self",
    titleVi: "Email chào nhóm mới: Từ kiểm toán viên đến chuyên viên vận hành",
    formatLabel: "Email nội bộ · Ngày đầu nhận việc",
    paragraphs: [
      "Chào cả nhà phòng Vận hành, mình là Quang, thành viên mới bắt đầu làm việc tại văn phòng Hà Nội từ hôm nay. Mình sinh ra và lớn lên ở Hải Phòng, ra thủ đô học đại học rồi bén duyên ở lại đến nay đã gần tám năm. Trước khi gia nhập công ty mình, mình có năm năm kinh nghiệm làm kiểm toán cho một hãng tư vấn quốc tế.",
      "Lý do mình quyết định rẽ hướng sang vận hành là vì mình muốn đi sâu vào việc tối ưu quy trình thực tế thay vì chỉ rà soát số liệu sau cùng. Trong công việc, mình có phần cầu toàn với các con số nhưng luôn cởi mở tiếp thu góp ý từ đồng đội. Mình tin rằng một hệ thống chỉ chạy trơn tru khi mọi người trao đổi minh bạch và chủ động hỗ trợ nhau từ sớm.",
      "Ngoài giờ công sở, mình thích đánh cầu lông vào tối thứ Ba và thứ Năm, cuối tuần thì hay tự nấu vài món ăn miền Bắc mời bạn bè. Trong hai tuần đầu làm quen, rất mong được ngồi uống cà phê ngắn với từng anh chị trong nhóm để hiểu rõ hơn cách phối hợp giữa các bộ phận. Cảm ơn cả nhà đã đón tiếp mình thật nhiệt tình!",
    ],
    glossary: {
      "bén duyên": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Tình cờ gắn bó và có duyên lâu dài với một nơi chốn hoặc nghề nghiệp.",
        en: "form a lasting connection with",
      },
      "kiểm toán": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Công việc kiểm tra và xác nhận tính chính xác của báo cáo tài chính.",
        en: "auditing",
      },
      "rẽ hướng": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Chuyển sang một con đường nghề nghiệp hoặc lựa chọn khác với ban đầu.",
        en: "change career track / pivot",
      },
      "tối ưu quy trình": {
        pos: "cụm động từ",
        ipa: "",
        definitionVi: "Cải tiến các bước làm việc để đạt hiệu quả cao và bớt rườm rà hơn.",
        en: "optimize workflows",
      },
      "cầu toàn": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Đòi hỏi sự chính xác, chỉn chu rất cao trong từng chi tiết.",
        en: "perfectionistic",
      },
      "cởi mở": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Sẵn sàng lắng nghe, đón nhận góc nhìn mới mà không bảo thủ.",
        en: "open-minded",
      },
      "trơn tru": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Vận hành êm xuôi, liên mạch, ít gặp trục trặc.",
        en: "smooth / seamless",
      },
      "minh bạch": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Rõ ràng, thẳng thắn và dễ kiểm chứng trong thông tin hoặc cách làm.",
        en: "transparent",
      },
      "phối hợp": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Cùng làm việc nhịp nhàng giữa nhiều cá nhân hoặc bộ phận.",
        en: "coordinate / collaborate",
      },
    },
    questions: [
      {
        id: "rp-self-2-q1",
        questionVi: "Vì sao anh Quang quyết định chuyển từ kiểm toán sang lĩnh vực vận hành?",
        options: [
          "Vì muốn tối ưu quy trình thực tế thay vì chỉ rà soát số liệu sau cùng",
          "Vì muốn chuyển về Hải Phòng làm việc gần gia đình",
          "Vì không còn muốn làm việc với đồng đội hay các bộ phận khác",
        ],
        correctIndex: 0,
        explanationVi: "Đoạn 2 nêu rõ: Quang muốn đi sâu vào việc tối ưu quy trình thực tế thay vì chỉ rà soát số liệu sau cùng.",
      },
      {
        id: "rp-self-2-q2",
        questionVi: "Anh Quang tự nhận xét nét tính cách làm việc của mình ra sao?",
        options: [
          "Rất thoải mái với sai sót số liệu nhưng ngại nhận góp ý",
          "Có phần cầu toàn với con số nhưng luôn cởi mở tiếp thu góp ý từ đồng đội",
          "Chỉ thích làm việc độc lập và không cần trao đổi nhiều",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 2 viết Quang «có phần cầu toàn với các con số nhưng luôn cởi mở tiếp thu góp ý từ đồng đội».",
      },
      {
        id: "rp-self-2-q3",
        questionVi: "Trong hai tuần đầu, Quang mong muốn làm gì cùng các thành viên trong nhóm?",
        options: [
          "Tổ chức giải cầu lông cho toàn công ty",
          "Viết lại toàn bộ báo cáo tài chính năm ngoái",
          "Ngồi uống cà phê ngắn với từng anh chị để hiểu cách phối hợp giữa các bộ phận",
        ],
        correctIndex: 2,
        explanationVi: "Đoạn 3 ghi rõ Quang mong ngồi cà phê ngắn với từng anh chị để hiểu cách phối hợp giữa các bộ phận.",
      },
    ],
  },
  {
    id: "rp-self-3",
    topicId: "self",
    titleVi: "Bắt đầu lại ở tuổi ba mươi bên xưởng gốm nhỏ tại Đà Nẵng",
    formatLabel: "Phỏng vấn nhân vật · Tạp chí Đời sống",
    paragraphs: [
      "Ở tuổi ba mươi, khi nhiều bạn bè cùng lứa đang tăng tốc cho vị trí giám đốc tại Sài Gòn, chị Thu Hà lại chọn thu dọn hành lý ra Đà Nẵng mở một xưởng gốm thủ công gần biển. Quyết định tưởng như mạo hiểm đó thực ra đã được chị ấp ủ suốt ba năm, từ ngày chị tham gia một lớp nặn gốm cuối tuần để xả căng thẳng sau những dự án quảng cáo triền miên.",
      "Chị Hà kể rằng năm đầu tiên khởi nghiệp không hề dễ dàng: có những mẻ gốm nung xong bị nứt vỡ gần một nửa, doanh thu những tháng mưa bão cũng trồi sụt thất thường. Tuy vậy, việc sống tối giản và kiểm soát tốt khoản tiết kiệm dự phòng đã giúp chị giữ vững tinh thần để kiên trì cải thiện từng công đoạn.",
      "Hiện tại, xưởng gốm của chị không chỉ bán ly tách cho các quán cà phê địa phương mà còn mở lớp trải nghiệm cuối tuần cho cư dân và khách du lịch. Với chị, thành công ở giai đoạn này không còn đo bằng chức danh lấp lánh, mà bằng cảm giác hào hứng mỗi sáng mở cửa xưởng và thấy mình đang tạo ra những món đồ có ích.",
    ],
    glossary: {
      "tăng tốc": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Đẩy nhanh nhịp độ cố gắng để tiến lên mạnh mẽ hơn.",
        en: "accelerate / push ahead",
      },
      "mạo hiểm": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Chứa đựng nhiều rủi ro và khó đoán trước kết quả.",
        en: "risky / bold",
      },
      "ấp ủ": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Nuôi dưỡng một ý định hoặc ước mơ trong lòng suốt thời gian dài.",
        en: "nurture / cherish (a plan)",
      },
      "triền miên": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Kéo dài liên tục hết đợt này sang đợt khác, ít khi dứt.",
        en: "endless / nonstop",
      },
      "khởi nghiệp": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Tự xây dựng và vận hành một công việc kinh doanh riêng từ đầu.",
        en: "start a business",
      },
      "thất thường": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Thay đổi lên xuống bất ngờ, không ổn định theo quy luật.",
        en: "erratic / unpredictable",
      },
      "sống tối giản": {
        pos: "cụm động từ",
        ipa: "",
        definitionVi: "Cắt giảm những nhu cầu dư thừa để tập trung vào điều thực sự cần thiết.",
        en: "live minimally",
      },
      "dự phòng": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Chuẩn bị sẵn từ trước để ứng phó khi gặp khó khăn bất ngờ.",
        en: "backup / emergency (fund)",
      },
      "chức danh": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Tên gọi vị trí và cấp bậc của một người trong tổ chức.",
        en: "job title",
      },
    },
    questions: [
      {
        id: "rp-self-3-q1",
        questionVi: "Chị Thu Hà nảy ra ý định làm gốm từ hoàn cảnh nào?",
        options: [
          "Từ khi học đại học mỹ thuật tại Đà Nẵng",
          "Từ lần tham gia lớp nặn gốm cuối tuần để xả căng thẳng sau các dự án quảng cáo",
          "Từ việc thừa kế xưởng gốm lâu đời của gia đình",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 1 cho biết chị ấp ủ ý định suốt ba năm từ khi đi học lớp nặn gốm cuối tuần để xả căng thẳng.",
      },
      {
        id: "rp-self-3-q2",
        questionVi: "Điều gì giúp chị Hà vượt qua năm đầu khởi nghiệp nhiều khó khăn?",
        options: [
          "Vay vốn ngân hàng lớn để mở ngay ba chi nhánh",
          "Chuyển toàn bộ xưởng về lại Sài Gòn vào mùa mưa bão",
          "Sống tối giản và quản lý tốt khoản tiết kiệm dự phòng",
        ],
        correctIndex: 2,
        explanationVi: "Đoạn 2 nêu rõ: «việc sống tối giản và kiểm soát tốt khoản tiết kiệm dự phòng đã giúp chị giữ vững tinh thần».",
      },
      {
        id: "rp-self-3-q3",
        questionVi: "Hiện nay chị Hà định nghĩa thành công dựa trên điều gì?",
        options: [
          "Cảm giác hào hứng mỗi sáng và tạo ra những món đồ có ích",
          "Giữ chức danh giám đốc tại một tập đoàn quảng cáo lớn",
          "Bán gốm xuất khẩu sang châu Âu với sản lượng hàng loạt",
        ],
        correctIndex: 0,
        explanationVi: "Câu cuối đoạn 3 khẳng định chị đo thành công bằng cảm giác hào hứng mỗi sáng mở cửa xưởng và tạo ra món đồ có ích.",
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
  {
    id: "rp-food-2",
    topicId: "food",
    titleVi: "Cà phê sáng vỉa hè Sài Gòn: Hơn cả một thức uống tỉnh táo",
    formatLabel: "Góc văn hóa · Đời sống đô thị",
    paragraphs: [
      "Từ sáu giờ rưỡi sáng, nhiều góc phố ở Sài Gòn đã rộn ràng tiếng muỗng chạm ly đá và mùi cà phê rang xay thoang thoảng trong gió sớm. Không cần không gian cầu kỳ, chỉ vài chiếc ghế nhựa thấp đặt dưới tán cây xanh là đủ tạo nên một phòng khách ngoài trời thân thuộc cho đủ mọi lứa tuổi — từ bác về hưu đọc báo giấy đến nhân viên công sở tranh thủ gặp nhanh trước giờ họp.",
      "Khẩu vị cà phê nơi đây cũng rất đa dạng. Người chuộng vị đậm truyền thống thường gọi một ly cà phê sữa đá pha phin hoặc cà phê vợt nấu trong ấm đất có hậu vị béo ngậy. Những ai sợ say cà phê lại hay chọn bạc xỉu nhiều sữa, còn giới trẻ mấy năm gần đây đặc biệt ưa thích cà phê ủ lạnh kết hợp hương cam tươi vừa thanh mát vừa dễ uống giữa tiết trời nắng nóng.",
      "Điều thú vị là đi cà phê ở Sài Gòn hiếm khi chỉ để uống cho xong. Người ta gọi một ly nước giá bình dân, nhâm nhi cùng ly trà đá miễn phí và trò chuyện đủ chuyện từ công việc đến đời sống. Chính sự phóng khoáng và gần gũi ấy biến thói quen buổi sáng giản dị này thành một nét bản sắc khó thay thế của thành phố.",
    ],
    glossary: {
      "thoang thoảng": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Tỏa hương nhẹ nhàng, dịu mắt hoặc dịu mũi trong không khí.",
        en: "faintly wafting / delicate",
      },
      "thân thuộc": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Gần gũi, quen thuộc đến mức tạo cảm giác thoải mái như ở nhà.",
        en: "familiar / intimate",
      },
      "chuộng": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Ưa thích và hay lựa chọn một phong cách hay hương vị nào đó.",
        en: "prefer / favor",
      },
      "hậu vị": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Vị còn đọng lại trong miệng sau khi nuốt thức ăn hoặc đồ uống.",
        en: "aftertaste",
      },
      "bạc xỉu": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Thức uống kiểu Sài Gòn gồm nhiều sữa đặc, sữa tươi và một chút cà phê.",
        en: "Saigon sweet milk coffee",
      },
      "cà phê ủ lạnh": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Cà phê ngâm chiết xuất bằng nước lạnh nhiều giờ, vị êm và ít đắng gắt.",
        en: "cold brew coffee",
      },
      "nhâm nhi": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Uống hoặc ăn từng ngụm nhỏ một cách thong thả để thưởng thức.",
        en: "sip slowly / savor",
      },
      "phóng khoáng": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Rộng rãi, cởi mở, không câu nệ hình thức hay tiểu tiết.",
        en: "open-hearted / easygoing",
      },
      "bản sắc": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Nét đặc trưng riêng tạo nên dấu ấn không trộn lẫn của một cộng đồng.",
        en: "cultural identity",
      },
    },
    questions: [
      {
        id: "rp-food-2-q1",
        questionVi: "Theo đoạn 2, người sợ say cà phê ở Sài Gòn thường chọn món nào?",
        options: [
          "Cà phê đen đặc không đường",
          "Bạc xỉu có nhiều sữa",
          "Cà phê vợt nấu hai lần cho đậm",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 2 viết: «Những ai sợ say cà phê lại hay chọn bạc xỉu nhiều sữa».",
      },
      {
        id: "rp-food-2-q2",
        questionVi: "Thức uống nào gần đây được giới trẻ Sài Gòn ưa thích vào ngày nắng nóng?",
        options: [
          "Cà phê ủ lạnh kết hợp hương cam tươi",
          "Trà gừng mật ong uống thật nóng",
          "Sữa đậu nành không đá",
        ],
        correctIndex: 0,
        explanationVi: "Đoạn 2 nêu rõ giới trẻ ưa thích «cà phê ủ lạnh kết hợp hương cam tươi vừa thanh mát vừa dễ uống».",
      },
      {
        id: "rp-food-2-q3",
        questionVi: "Theo tác giả, yếu tố nào biến cà phê vỉa hè thành bản sắc riêng của Sài Gòn?",
        options: [
          "Nội thất sang trọng và quy định ngồi tối đa hai mươi phút",
          "Giá đồ uống đắt đỏ bậc nhất cả nước",
          "Không khí phóng khoáng, gần gũi để mọi người thong thả trò chuyện",
        ],
        correctIndex: 2,
        explanationVi: "Đoạn 3 nhấn mạnh chính sự phóng khoáng, gần gũi khi nhâm nhi và trò chuyện đã tạo nên bản sắc thành phố.",
      },
    ],
  },
  {
    id: "rp-food-3",
    topicId: "food",
    titleVi: "Một buổi chiều khám phá ẩm thực quanh chợ Hàn, Đà Nẵng",
    formatLabel: "Nhật ký trải nghiệm · Ẩm thực miền Trung",
    paragraphs: [
      "Trong chuyến công tác ba ngày tại Đà Nẵng, mình tranh thủ một buổi chiều rảnh để dạo quanh khu ẩm thực chợ Hàn. Khác với kiểu thưởng thức cầu kỳ ở nhà hàng lớn, các gian hàng trong chợ bày biện gọn ghẽ, cô bán hàng vừa thoăn thoắt trụng mì vừa niềm nở giới thiệu từng món đặc sản địa phương cho khách phương xa.",
      "Món đầu tiên mình thử là mì Quảng tôm thịt. Sợi mì dày và mềm, chan vừa xăm xắp thứ nước nhân sánh thơm mùi nghệ và dầu phộng chứ không ngập nước như phở hay bún bò. Khi ăn, mình bẻ thêm miếng bánh tráng nướng giòn tan, rắc đậu phộng rang và trộn cùng đĩa rau sống thái nhỏ gồm bắp chuối, xà lách và rau thơm nên hương vị hòa quyện cực kỳ bắt miệng.",
      "Đi thêm vài gian, mình tò mò nếm thử bánh tráng cuốn thịt heo chấm mắm nêm. Mùi mắm nêm pha dứa băm và ớt tỏi khá nồng với người ăn lần đầu, nhưng một khi đã quen lại thấy cuốn hút lạ kỳ. Trước lúc rời chợ, mình ghé quầy đồ khô mua ít mực rim me và mè xửng làm quà cho đồng nghiệp ở văn phòng, thấy chuyến đi trọn vẹn hơn hẳn nhờ những trải nghiệm vị giác chân thật như thế.",
    ],
    glossary: {
      "thoăn thoắt": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Thao tác tay chân cực kỳ nhanh nhẹn, thuần thục và nhịp nhàng.",
        en: "nimble / deftly quick",
      },
      "niềm nở": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Tỏ thái độ vui vẻ, nồng hậu và hiếu khách khi đón tiếp.",
        en: "warm and welcoming",
      },
      "đặc sản": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Món ăn hoặc sản vật tiêu biểu gắn liền với một vùng miền.",
        en: "local specialty",
      },
      "xăm xắp": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Lượng nước vừa chạm mặt đồ ăn, không nhiều đến mức ngập hẳn.",
        en: "just barely covering / shallow",
      },
      "hòa quyện": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Các hương vị kết hợp chặt chẽ tạo nên tổng thể hài hòa.",
        en: "blend harmoniously",
      },
      "bắt miệng": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Hương vị ngon cuốn khiến người ăn muốn ăn tiếp không ngán.",
        en: "appetizing / moreish",
      },
      "mắm nêm": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Loại nước chấm lên men đậm vị đặc trưng của ẩm thực miền Trung.",
        en: "fermented anchovy dipping sauce",
      },
      "cuốn hút": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Có sức hấp dẫn khiến người trải nghiệm bị thu hút mạnh mẽ.",
        en: "captivating / irresistible",
      },
      "vị giác": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Cảm quan cảm nhận vị chua, cay, mặn, ngọt khi ăn uống.",
        en: "sense of taste / palate",
      },
    },
    questions: [
      {
        id: "rp-food-3-q1",
        questionVi: "Nước dùng của món mì Quảng có điểm gì khác so với phở hay bún bò?",
        options: [
          "Được chan đầy ngập bát với vị thật ngọt",
          "Chỉ chan vừa xăm xắp, sánh thơm mùi nghệ và dầu phộng",
          "Không hề có nước mà ăn hoàn toàn khô",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 2 miêu tả mì Quảng «chan vừa xăm xắp thứ nước nhân sánh thơm mùi nghệ và dầu phộng chứ không ngập nước».",
      },
      {
        id: "rp-food-3-q2",
        questionVi: "Tác giả cảm nhận thế nào về món mắm nêm ăn kèm bánh tráng cuốn thịt heo?",
        options: [
          "Khá nồng với người ăn lần đầu, nhưng khi đã quen lại rất cuốn hút",
          "Hoàn toàn nhạt nhẽo và không có mùi đặc trưng",
          "Quá cay nên tác giả không thể thử hết một cuốn",
        ],
        correctIndex: 0,
        explanationVi: "Đoạn 3 nhận xét mắm nêm «khá nồng với người ăn lần đầu, nhưng một khi đã quen lại thấy cuốn hút lạ kỳ».",
      },
      {
        id: "rp-food-3-q3",
        questionVi: "Tác giả đã mua gì tại chợ Hàn để mang về làm quà cho đồng nghiệp?",
        options: [
          "Cà phê phin và hạt sen tươi",
          "Bánh xèo nóng và rau sống",
          "Mực rim me và mè xửng",
        ],
        correctIndex: 2,
        explanationVi: "Câu cuối đoạn 3 cho biết tác giả ghé quầy đồ khô mua mực rim me và mè xửng làm quà.",
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
  {
    id: "rp-routine-2",
    topicId: "routine",
    titleVi: "Nghệ thuật «ngủ trưa hai mươi phút» ở văn phòng Việt Nam",
    formatLabel: "Ghi chép công sở · Sức khỏe & Năng suất",
    paragraphs: [
      "Nhiều đồng nghiệp nước ngoài khi mới sang Việt Nam làm việc thường khá ngạc nhiên trước cảnh tượng đúng mười hai giờ mười lăm: đèn văn phòng đồng loạt tắt bớt, nhiều người trải tấm chiếu gấp gọn dưới bàn, kê gối cổ và yên lặng chìm vào giấc ngủ ngắn. Với dân công sở Việt, thói quen nghỉ trưa không phải biểu hiện của sự lười biếng, mà là cách phục hồi năng lượng rất thực tế giữa khí hậu nhiệt đới.",
      "Tuy nhiên, ngủ trưa sao cho hiệu quả lại cần vài nguyên tắc nhỏ. Nếu ăn trưa quá no với nhiều tinh bột và đồ chiên rán rồi ngủ liền hơn một tiếng, lúc tỉnh dậy cơ thể thường nặng nề, đau đầu và càng thêm uể oải. Ngược lại, một bữa trưa nhẹ nhàng vừa đủ chất, kết hợp chợp mắt từ mười lăm đến hai mươi lăm phút lại giúp não bộ tỉnh táo nhanh mà không làm xáo trộn giấc ngủ ban đêm.",
      "Sau khi chuông báo thức nhẹ reo lên lúc một giờ mười lăm, mình thường đứng dậy vươn vai vài nhịp, rửa mặt nước mát rồi uống một cốc nước lọc thay vì vội vàng uống thêm cà phê đậm. Chỉ một khoảng nghỉ ngắn nhưng có kỷ luật như vậy cũng đủ giúp buổi họp lúc hai giờ chiều trôi chảy và tập trung hơn rất nhiều.",
    ],
    glossary: {
      "đồng loạt": {
        pos: "phó từ",
        ipa: "",
        definitionVi: "Cùng xảy ra một lúc ở nhiều người hoặc nhiều thiết bị.",
        en: "simultaneously / all at once",
      },
      "phục hồi": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Lấy lại trạng thái khỏe khoắn và tỉnh táo như ban đầu.",
        en: "recover / restore",
      },
      "nguyên tắc": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Quy tắc cơ bản cần tuân theo để đạt hiệu quả ổn định.",
        en: "principle / rule",
      },
      "tinh bột": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Nhóm chất bột đường có nhiều trong cơm, bún, bánh mì.",
        en: "carbohydrates / starch",
      },
      "uể oải": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Cảm giác mệt mỏi, thiếu sức sống và chậm chạp.",
        en: "sluggish / listless",
      },
      "chợp mắt": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Ngủ tranh thủ một giấc ngắn để nghỉ ngơi giữa ngày.",
        en: "take a quick nap",
      },
      "xáo trộn": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Làm đảo lộn, phá vỡ nhịp sinh học hoặc trật tự vốn có.",
        en: "disrupt / throw off",
      },
      "vươn vai": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Duỗi thẳng tay và lưng để giảm căng cơ sau khi ngồi hoặc ngủ.",
        en: "stretch one's arms and back",
      },
      "kỷ luật": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Khả năng tuân thủ đều đặn kế hoạch và giới hạn mình đã đặt ra.",
        en: "discipline",
      },
    },
    questions: [
      {
        id: "rp-routine-2-q1",
        questionVi: "Theo bài viết, điều gì xảy ra nếu ăn trưa quá nhiều tinh bột rồi ngủ liền hơn một tiếng?",
        options: [
          "Buổi chiều sẽ tập trung cao gấp đôi bình thường",
          "Tối hôm đó sẽ ngủ sớm hơn mọi ngày",
          "Khi tỉnh dậy cơ thể dễ nặng nề, đau đầu và thêm uể oải",
        ],
        correctIndex: 2,
        explanationVi: "Đoạn 2 chỉ rõ ăn quá no rồi ngủ hơn một tiếng khiến cơ thể nặng nề, đau đầu và uể oải.",
      },
      {
        id: "rp-routine-2-q2",
        questionVi: "Thời lượng ngủ trưa được tác giả đánh giá là hiệu quả nhất là bao lâu?",
        options: [
          "Từ 15 đến 25 phút",
          "Đúng 60 phút liên tục",
          "Ít nhất 90 phút mỗi ngày",
        ],
        correctIndex: 0,
        explanationVi: "Đoạn 2 khuyến nghị chợp mắt «từ mười lăm đến hai mươi lăm phút» để tỉnh táo mà không xáo trộn giấc ngủ tối.",
      },
      {
        id: "rp-routine-2-q3",
        questionVi: "Sau khi ngủ trưa dậy, tác giả thường làm gì để bắt đầu ca chiều?",
        options: [
          "Uống ngay hai ly cà phê đen đặc",
          "Vươn vai, rửa mặt nước mát và uống một cốc nước lọc",
          "Đi bộ ra quán ăn thêm một bữa phụ nhiều đường",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 3 nêu rõ tác giả vươn vai, rửa mặt nước mát và uống nước lọc thay vì uống thêm cà phê đậm.",
      },
    ],
  },
  {
    id: "rp-routine-3",
    topicId: "routine",
    titleVi: "Cuối tuần «giảm màn hình» của hai vợ chồng trẻ ở Hà Nội",
    formatLabel: "Nhật ký cuối tuần · Lối sống cân bằng",
    paragraphs: [
      "Cả hai vợ chồng mình đều làm công việc gắn chặt với máy tính từ thứ Hai đến thứ Sáu, nên trước đây cứ đến cuối tuần là mắt mỏi nhừ mà vẫn giữ thói quen lướt điện thoại suốt buổi sáng. Nửa năm nay, tụi mình thỏa thuận áp dụng quy tắc «sáng thứ Bảy không màn hình» cho đến tận mười hai giờ trưa.",
      "Thay vì nằm dài trên giường xem tin tức, bảy giờ sáng hai đứa chở nhau ra chợ dân sinh gần nhà mua rau tươi, hoa theo mùa và ghé ăn bát bún riêu nóng. Về đến căn hộ, chồng mình loay hoay pha ấm trà mạn ngoài ban công còn mình cắm lọ hoa cúc nhỏ và bật đĩa nhạc nhẹ. Nhịp buổi sáng chậm lại hẳn, hai vợ chồng cũng có nhiều thời gian trò chuyện những điều nhỏ nhặt bị bỏ quên suốt tuần bận rộn.",
      "Chiều Chủ nhật, tụi mình dành đúng một tiếng rưỡi dọn dẹp nhà cửa, giặt giũ và lên danh sách thực đơn sơ bộ cho tuần mới. Nhờ sắp xếp gọn ghẽ từ tối Chủ nhật, sáng thứ Hai không còn cảnh vội vã tìm chìa khóa hay loay hoay nghĩ trưa nay ăn gì. Cuối tuần hóa ra không cần đi du lịch xa mới thấy được nghỉ ngơi đúng nghĩa.",
    ],
    glossary: {
      "mỏi nhừ": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Mệt mỏi rã rời sau thời gian dài căng thẳng hoặc hoạt động quá mức.",
        en: "achingly tired / strained",
      },
      "thỏa thuận": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Bàn bạc và thống nhất cùng làm theo một quy ước chung.",
        en: "agree upon / make a pact",
      },
      "quy tắc": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Nguyên tắc nhỏ đặt ra để mọi người cùng giữ nề nếp.",
        en: "rule / guideline",
      },
      "chợ dân sinh": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Chợ truyền thống phục vụ thực phẩm và nhu yếu phẩm hằng ngày cho cư dân quanh khu vực.",
        en: "local neighborhood market",
      },
      "nhỏ nhặt": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Chi tiết nhỏ bé, đời thường nhưng đôi khi rất ý nghĩa.",
        en: "small / everyday (details)",
      },
      "dọn dẹp": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Thu xếp, lau chùi không gian sống cho sạch sẽ, ngăn nắp.",
        en: "tidy up / clean",
      },
      "sơ bộ": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Mang tính khung chính ban đầu, chưa quá chi tiết cứng nhắc.",
        en: "rough / preliminary",
      },
      "gọn ghẽ": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Ngăn nắp, chỉnh tề và được chuẩn bị sẵn sàng.",
        en: "neat / orderly",
      },
      "đúng nghĩa": {
        pos: "cụm tính từ",
        ipa: "",
        definitionVi: "Thực sự đạt được trọn vẹn bản chất và giá trị vốn có.",
        en: "in the true sense / genuine",
      },
    },
    questions: [
      {
        id: "rp-routine-3-q1",
        questionVi: "Quy tắc mới mà hai vợ chồng áp dụng suốt nửa năm qua là gì?",
        options: [
          "Không dùng màn hình vào sáng thứ Bảy cho đến mười hai giờ trưa",
          "Tắt điện thoại liên tục từ tối thứ Sáu đến sáng thứ Hai",
          "Mỗi cuối tuần đều đi du lịch ngoại thành hai ngày",
        ],
        correctIndex: 0,
        explanationVi: "Đoạn 1 nêu rõ quy tắc của họ là «sáng thứ Bảy không màn hình» đến tận mười hai giờ trưa.",
      },
      {
        id: "rp-routine-3-q2",
        questionVi: "Sáng thứ Bảy, hai vợ chồng thường bắt đầu ngày mới bằng hoạt động nào?",
        options: [
          "Ngủ bù đến mười giờ rồi đặt đồ ăn nhanh",
          "Đi chợ dân sinh mua rau hoa và ăn bát bún riêu nóng",
          "Ra quán cà phê mở máy tính làm bù việc tồn đọng",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 2 kể bảy giờ sáng hai đứa chở nhau ra chợ dân sinh mua rau tươi, hoa theo mùa và ăn bún riêu.",
      },
      {
        id: "rp-routine-3-q3",
        questionVi: "Việc chuẩn bị gọn ghẽ vào chiều Chủ nhật mang lại lợi ích gì?",
        options: [
          "Giúp tiết kiệm toàn bộ tiền đi chợ cả tháng",
          "Giúp không cần nấu ăn vào các buổi tối trong tuần",
          "Giúp sáng thứ Hai bớt vội vã và không phải loay hoay nghĩ thực đơn",
        ],
        correctIndex: 2,
        explanationVi: "Đoạn 3 giải thích nhờ sắp xếp từ tối Chủ nhật nên sáng thứ Hai không còn cảnh vội vã tìm đồ hay nghĩ trưa ăn gì.",
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
  {
    id: "rp-weather-2",
    topicId: "weather",
    titleVi: "Mùa nồm miền Bắc và vài mẹo nhỏ giữ nhà luôn khô ráo",
    formatLabel: "Cẩm nang đời sống · Thời tiết Việt Nam",
    paragraphs: [
      "Với những ai lần đầu trải qua tháng Hai và tháng Ba ở Hà Nội, hiện tượng trời nồm ẩm thường gây không ít bất ngờ. Khi gió biển mang hơi ẩm tràn vào gặp nền nhà còn lạnh từ mùa đông, hơi nước lập tức ngưng tụ thành từng giọt li ti khiến sàn gạch trơn trượt và tường như «đổ mồ hôi». Độ ẩm không khí có hôm vượt quá chín mươi phần trăm, làm đồ gỗ dễ mốc và quần áo phơi cả tuần vẫn ẩm lạnh.",
      "Sai lầm phổ biến nhất của nhiều người là mở toang cửa sổ đón gió với hy vọng nhà sẽ mau khô. Thực tế, không khí bên ngoài lúc này ẩm hơn nhiều so với trong phòng, nên càng mở cửa thì sàn càng ướt nhẹp. Cách xử lý hiệu quả hơn là đóng kín cửa sổ những ngày ẩm đỉnh điểm, lau sàn bằng khăn khô thay vì nước, và bật máy hút ẩm hoặc điều hòa ở chế độ làm khô khoảng vài tiếng mỗi ngày.",
      "Ngoài ra, với các thiết bị điện tử, máy ảnh hay giày da, bạn nên bảo quản trong hộp kín có đặt thêm túi hút ẩm và thỉnh thoảng mở tủ kiểm tra. Mùa nồm tuy hơi bất tiện nhưng thường chỉ kéo dài theo từng đợt vài ngày đến một tuần. Chuẩn bị sẵn vài thói quen nhỏ sẽ giúp không gian sống của bạn dễ chịu hơn rất nhiều trước khi nắng ấm thực sự về.",
    ],
    glossary: {
      "ngưng tụ": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Hơi nước chuyển thành giọt nước nhỏ khi gặp bề mặt lạnh.",
        en: "condense",
      },
      "trơn trượt": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Bề mặt ướt bóng khiến người đi lại rất dễ bị ngã.",
        en: "slippery",
      },
      "mở toang": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Mở rộng hết cỡ cửa ra vào hoặc cửa sổ.",
        en: "throw wide open",
      },
      "ướt nhẹp": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Đọng nhiều nước và ẩm ướt gây cảm giác rất khó chịu.",
        en: "soaking wet / damp all over",
      },
      "đỉnh điểm": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Mức cao nhất hoặc nghiêm trọng nhất của một hiện tượng.",
        en: "peak / height",
      },
      "máy hút ẩm": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Thiết bị điện giúp tách bớt hơi nước trong không khí trong phòng.",
        en: "dehumidifier",
      },
      "chế độ làm khô": {
        pos: "cụm danh từ",
        ipa: "",
        definitionVi: "Chức năng Dry trên điều hòa giúp giảm độ ẩm không khí.",
        en: "dry mode (on AC)",
      },
      "bảo quản": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Cất giữ đồ đạc đúng cách để tránh hư hại, ẩm mốc.",
        en: "store / preserve",
      },
      "bất tiện": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Gây phiền toái, kém thuận lợi cho sinh hoạt hằng ngày.",
        en: "inconvenient",
      },
    },
    questions: [
      {
        id: "rp-weather-2-q1",
        questionVi: "Vì sao sàn nhà miền Bắc thường bị ướt và trơn trượt vào mùa nồm?",
        options: [
          "Vì gió ẩm tràn vào gặp nền nhà còn lạnh khiến hơi nước ngưng tụ",
          "Vì mưa rào tạt mạnh vào cửa sổ suốt cả ngày",
          "Vì người dân lau nhà quá nhiều lần trong ngày",
        ],
        correctIndex: 0,
        explanationVi: "Đoạn 1 giải thích gió mang hơi ẩm gặp nền nhà còn lạnh làm hơi nước ngưng tụ thành giọt trên sàn.",
      },
      {
        id: "rp-weather-2-q2",
        questionVi: "Theo bài viết, vì sao KHÔNG nên mở toang cửa sổ vào ngày nồm ẩm đỉnh điểm?",
        options: [
          "Vì gió ngoài trời quá khô làm nứt đồ gỗ",
          "Vì không khí bên ngoài ẩm hơn trong phòng nên mở cửa càng khiến nhà ướt hơn",
          "Vì tiếng ồn giao thông làm ảnh hưởng giấc ngủ",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 2 chỉ rõ không khí bên ngoài ẩm hơn trong phòng nên càng mở cửa thì sàn càng ướt nhẹp.",
      },
      {
        id: "rp-weather-2-q3",
        questionVi: "Tác giả khuyên nên bảo quản máy ảnh hoặc giày da thế nào trong mùa nồm?",
        options: [
          "Đem phơi trực tiếp ngoài ban công mỗi sáng",
          "Lau bằng khăn ướt rồi đặt sát sàn gạch",
          "Cất trong hộp kín kèm túi hút ẩm và thỉnh thoảng kiểm tra",
        ],
        correctIndex: 2,
        explanationVi: "Đoạn 3 hướng dẫn bảo quản thiết bị điện tử, máy ảnh và giày da trong hộp kín có túi hút ẩm.",
      },
    ],
  },
  {
    id: "rp-weather-3",
    topicId: "weather",
    titleVi: "Chọn mùa du lịch miền Trung: Nắng rực rỡ hay mưa trầm mặc?",
    formatLabel: "Cẩm nang du lịch · Huế – Đà Nẵng – Hội An",
    paragraphs: [
      "Dải đất miền Trung từ Huế qua Đà Nẵng đến Hội An chỉ cách nhau vài tiếng đi xe, nhưng việc chọn thời điểm ghé thăm ảnh hưởng rất lớn đến trải nghiệm của bạn. Khác với bốn mùa rõ rệt ở miền Bắc, khí hậu nơi đây chia khá rõ thành mùa khô và mùa mưa, mỗi giai đoạn mang một sắc thái hoàn toàn riêng biệt.",
      "Từ tháng Hai đến tháng Tám là mùa khô với bầu trời trong xanh và biển êm, cực kỳ lý tưởng cho các hoạt động tắm biển, lặn ngắm san hô hay chạy xe qua đèo Hải Vân. Riêng tháng Ba và tháng Tư được nhiều người xem là khoảng thời gian đẹp nhất vì nắng ấm vừa phải, chưa quá gay gắt. Sang tháng Sáu và tháng Bảy, nhiệt độ ban ngày có thể chạm ba mươi tám độ, nên du khách thường tham quan sáng sớm và nghỉ trưa tránh nắng.",
      "Từ tháng Chín đến tháng Mười Hai, miền Trung bước vào mùa mưa bão với những cơn mưa dầm đặc trưng xứ Huế và nguy cơ ngập lụt ở phố cổ Hội An vào đợt mưa lớn. Tuy phải theo dõi dự báo sát sao và chuẩn bị lịch trình linh hoạt, nhiều người vẫn yêu nét trầm mặc, vắng khách của mùa này — ngồi quán cà phê cổ ngắm mưa rơi và thưởng thức bát bún bò nóng hổi cũng là một kỷ niệm rất đáng nhớ.",
    ],
    glossary: {
      "sắc thái": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Vẻ riêng, không khí đặc trưng tạo nên cảm nhận khác biệt.",
        en: "character / vibe / nuance",
      },
      "biển êm": {
        pos: "cụm tính từ",
        ipa: "",
        definitionVi: "Mặt biển lặng sóng, an toàn và thuận lợi để tắm biển hoặc đi tàu.",
        en: "calm sea",
      },
      "lý tưởng": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Đạt điều kiện tốt nhất, rất phù hợp cho một mục đích nào đó.",
        en: "ideal",
      },
      "gay gắt": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Ở mức độ mạnh, chói chang và khắc nghiệt.",
        en: "harsh / intense",
      },
      "mưa dầm": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Mưa rả rích kéo dài liên miên nhiều giờ hoặc nhiều ngày.",
        en: "persistent / lingering rain",
      },
      "nguy cơ": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Khả năng có thể xảy ra điều bất lợi hoặc rủi ro.",
        en: "risk / hazard",
      },
      "sát sao": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Theo dõi kỹ lưỡng, liên tục và không bỏ sót biến động mới.",
        en: "closely / attentively",
      },
      "trầm mặc": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Yên tĩnh, sâu lắng và hơi đượm nét hoài cổ.",
        en: "quietly contemplative / pensive",
      },
      "đáng nhớ": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Để lại ấn tượng đẹp và khó quên trong lòng người trải nghiệm.",
        en: "memorable",
      },
    },
    questions: [
      {
        id: "rp-weather-3-q1",
        questionVi: "Theo bài viết, hai tháng nào được xem là đẹp nhất để du lịch miền Trung?",
        options: [
          "Tháng Mười và tháng Mười Một",
          "Tháng Ba và tháng Tư",
          "Tháng Sáu và tháng Bảy",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 2 nêu rõ tháng Ba và tháng Tư đẹp nhất vì «nắng ấm vừa phải, chưa quá gay gắt».",
      },
      {
        id: "rp-weather-3-q2",
        questionVi: "Vào tháng Sáu và tháng Bảy, du khách thường sắp xếp lịch tham quan ra sao?",
        options: [
          "Tham quan buổi sáng sớm và nghỉ trưa tránh nắng",
          "Đi dạo ngoài trời liên tục từ mười một giờ đến ba giờ chiều",
          "Hủy toàn bộ hoạt động biển vì mưa bão lớn",
        ],
        correctIndex: 0,
        explanationVi: "Đoạn 2 viết khi nhiệt độ chạm 38 độ, du khách thường «tham quan sáng sớm và nghỉ trưa tránh nắng».",
      },
      {
        id: "rp-weather-3-q3",
        questionVi: "Điểm hấp dẫn riêng của miền Trung vào mùa mưa là gì?",
        options: [
          "Biển hoàn toàn không có sóng và trời xanh không một gợn mây",
          "Có nhiều lễ hội bãi biển lớn nhất trong năm",
          "Không khí trầm mặc, vắng khách, thích hợp ngồi cà phê ngắm mưa và ăn đồ nóng",
        ],
        correctIndex: 2,
        explanationVi: "Đoạn 3 nhắc nhiều người yêu nét trầm mặc, vắng khách, ngồi cà phê cổ ngắm mưa và ăn bún bò nóng.",
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
  {
    id: "rp-emotions-2",
    topicId: "emotions",
    titleVi: "Học cách gọi tên sự mệt mỏi trước khi kiệt sức",
    formatLabel: "Tản văn đời sống · Sức khỏe tinh thần",
    paragraphs: [
      "Nhiều người trưởng thành quen đo sức khỏe của mình bằng những dấu hiệu rõ ràng như đau đầu hay cảm cúm, nhưng lại hay bỏ qua sự mệt mỏi tinh thần đang âm thầm tích tụ. Đôi khi tín hiệu không hề ồn ào: chỉ là tự dưng mình dễ cáu gắt khi gặp đèn đỏ lâu, mở cuốn sách yêu thích ra mà đọc mãi không vào, hoặc thấy trống rỗng ngay cả lúc vừa hoàn thành xong một mục tiêu lớn.",
      "Trước đây, mỗi lần rơi vào cảm giác chênh vênh như thế, mình thường cố lấp đầy lịch trình bằng thêm công việc vì nghĩ bận rộn sẽ giúp quên đi lo âu. Kết quả là càng chạy nhanh mình càng mất hứng thú với những điều vốn từng mang lại niềm vui. Phải đến khi dành một buổi chiều ngồi viết nhật ký thật thành thật với bản thân, mình mới nhận ra điều mình thiếu không phải thêm nỗ lực, mà là sự tạm dừng đúng lúc.",
      "Bây giờ mình tập đặt ra vài ranh giới nhẹ nhàng: dám từ chối những buổi hẹn quá sức, nói thật với người thân khi tâm trạng chưa ổn, và cho phép bản thân có một ngày không cần phải «hiệu quả». Gọi tên được cảm xúc của mình không phải là yếu đuối, mà là bước đầu tiên để chăm sóc tâm trí một cách tỉnh táo và bền bỉ hơn.",
    ],
    glossary: {
      "tích tụ": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Dồn lại dần dần qua thời gian cho đến khi trở nên đáng kể.",
        en: "accumulate / build up",
      },
      "cáu gắt": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Dễ nổi nóng, bực bội trước những chuyện nhỏ nhặt.",
        en: "irritable / snappy",
      },
      "trống rỗng": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Cảm giác hụt hẫng, thiếu kết nối cảm xúc bên trong.",
        en: "empty / hollow",
      },
      "chênh vênh": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Bấp bênh, thiếu điểm tựa vững vàng trong tâm trạng hoặc định hướng.",
        en: "unsettled / off-balance",
      },
      "lấp đầy": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Chất kín mọi khoảng trống thời gian để không còn lúc nghỉ.",
        en: "fill up / pack full",
      },
      "tạm dừng": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Chủ động ngừng lại một nhịp để quan sát và hồi phục.",
        en: "pause / take a breather",
      },
      "ranh giới": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Giới hạn lành mạnh bảo vệ thời gian và sức khỏe tinh thần cá nhân.",
        en: "boundaries",
      },
      "quá sức": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Vượt quá khả năng chịu đựng về thể chất hoặc tinh thần.",
        en: "beyond one's capacity / draining",
      },
      "bền bỉ": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Dẻo dai, vững vàng và duy trì được lâu dài.",
        en: "resilient / enduring",
      },
    },
    questions: [
      {
        id: "rp-emotions-2-q1",
        questionVi: "Theo đoạn 1, đâu là một dấu hiệu âm thầm của sự mệt mỏi tinh thần?",
        options: [
          "Dễ cáu gắt khi gặp đèn đỏ lâu hoặc đọc sách mãi không vào",
          "Ngủ sâu suốt tám tiếng mỗi đêm và dậy rất sớm",
          "Luôn muốn trò chuyện nhiều hơn với người lạ",
        ],
        correctIndex: 0,
        explanationVi: "Đoạn 1 nêu các tín hiệu như dễ cáu gắt khi gặp đèn đỏ lâu, đọc sách không vào hoặc thấy trống rỗng.",
      },
      {
        id: "rp-emotions-2-q2",
        questionVi: "Điều gì xảy ra khi trước đây tác giả cố lấp đầy lịch trình để quên đi lo âu?",
        options: [
          "Tác giả lập tức thấy vui vẻ và giàu năng lượng hơn",
          "Tác giả càng dễ mất hứng thú với những điều vốn từng mang lại niềm vui",
          "Tác giả tìm được ngay công việc mới có lương cao hơn",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 2 viết: «Kết quả là càng chạy nhanh mình càng mất hứng thú với những điều vốn từng mang lại niềm vui.»",
      },
      {
        id: "rp-emotions-2-q3",
        questionVi: "Thông điệp chính ở đoạn cuối bài viết là gì?",
        options: [
          "Người trưởng thành nên giữ im lặng và không chia sẻ tâm trạng với ai",
          "Cần giữ lịch làm việc hiệu quả bảy ngày mỗi tuần",
          "Nhận diện cảm xúc và đặt ranh giới nhẹ nhàng giúp chăm sóc tâm trí bền bỉ hơn",
        ],
        correctIndex: 2,
        explanationVi: "Đoạn 3 nhấn mạnh đặt ranh giới lành mạnh và gọi tên cảm xúc giúp chăm sóc tâm trí tỉnh táo, bền bỉ hơn.",
      },
    ],
  },
  {
    id: "rp-emotions-3",
    topicId: "emotions",
    titleVi: "Thư gửi người bạn sắp chuyển công tác xa nhà",
    formatLabel: "Thư tay · Tình bạn trưởng thành",
    paragraphs: [
      "Huy thân mến, cuối tuần này cậu đã lên máy bay sang văn phòng mới ở nước ngoài nhận nhiệm vụ hai năm rồi. Ngồi viết mấy dòng này cho cậu, lòng mình cứ đan xen hai cảm xúc rất lạ: một bên là niềm tự hào lớn khi thấy bao nỗ lực của cậu cuối cùng cũng mở ra cơ hội xứng đáng, còn bên kia lại không tránh khỏi chút lưu luyến vì từ nay thiếu mất người bạn quen cuối tuần rủ nhau đi cà phê.",
      "Mình biết bên cạnh sự háo hức trước môi trường mới, chắc cậu cũng đang hơi lo âu về chuyện hòa nhập và sống xa gia đình. Ngày trước khi mình mới chuyển vào miền Nam làm việc, vài tháng đầu mình cũng từng thấy lạc lõng và nhớ cơm nhà kinh khủng. Nhưng cậu cứ yên tâm rằng cảm giác chới với đó chỉ là một giai đoạn ngắn thôi — khi đã quen nhịp sinh hoạt và có vài người bạn mới, mọi thứ sẽ dần ấm áp trở lại.",
      "Nếu những tối đầu tiên sang đó cậu thấy nhớ nhà hay cần ai đó nghe kể chuyện công việc, cứ gọi điện cho mình bất cứ lúc nào đừng ngại chênh lệch múi giờ nhé. Chúc cậu lên đường bình an, giữ gìn sức khỏe thật tốt và tận hưởng trọn vẹn hành trình đáng quý này. Hẹn dịp Tết về Hà Nội mình lại ngồi quán phở quen kể chuyện cả buổi!",
    ],
    glossary: {
      "đan xen": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Nhiều cảm xúc hoặc yếu tố cùng tồn tại, hòa lẫn vào nhau.",
        en: "intertwine / mix together",
      },
      "tự hào": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Cảm thấy hãnh diện và vui mừng trước thành quả tốt đẹp.",
        en: "proud",
      },
      "lưu luyến": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Bịn rịn, nhớ nhung và không nỡ rời xa khi chia tay.",
        en: "reluctant to part / wistful",
      },
      "háo hức": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Mong chờ đầy phấn khởi trước một trải nghiệm mới sắp tới.",
        en: "eager / excited",
      },
      "hòa nhập": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Thích nghi và gắn kết tự nhiên với cộng đồng hoặc môi trường mới.",
        en: "integrate / fit in",
      },
      "lạc lõng": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Cảm thấy bơ vơ, chưa thuộc về nơi mình đang sống.",
        en: "out of place / lonely",
      },
      "chới với": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Cảm giác hụt hẫng, mất phương hướng tạm thời khi thay đổi lớn.",
        en: "adrift / unsteady",
      },
      "chênh lệch múi giờ": {
        pos: "cụm danh từ",
        ipa: "",
        definitionVi: "Sự khác nhau về thời gian giữa hai quốc gia hoặc vùng địa lý.",
        en: "time zone difference",
      },
      "đáng quý": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Có giá trị lớn về tinh thần và xứng đáng được trân trọng.",
        en: "precious / valuable",
      },
    },
    questions: [
      {
        id: "rp-emotions-3-q1",
        questionVi: "Hai cảm xúc nào đang đan xen trong lòng người viết bức thư?",
        options: [
          "Tức giận vì bạn đi xa và ghen tị với cơ hội mới",
          "Tự hào về thành quả của bạn và lưu luyến vì sắp xa người bạn quen",
          "Thờ ơ và hoàn toàn không bận tâm về chuyến đi",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 1 nêu rõ hai cảm xúc đan xen là niềm tự hào lớn và chút lưu luyến.",
      },
      {
        id: "rp-emotions-3-q2",
        questionVi: "Người viết kể lại trải nghiệm cũ của bản thân nhằm mục đích gì?",
        options: [
          "Để trấn an Huy rằng cảm giác lạc lõng ban đầu chỉ là tạm thời rồi sẽ qua",
          "Để khuyên Huy nên từ chối lời mời công tác nước ngoài",
          "Để so sánh thời tiết giữa miền Nam và Hà Nội",
        ],
        correctIndex: 0,
        explanationVi: "Đoạn 2 dùng trải nghiệm chuyển vào miền Nam để nhắn Huy yên tâm rằng cảm giác chới với chỉ kéo dài ngắn hạn.",
      },
      {
        id: "rp-emotions-3-q3",
        questionVi: "Người viết hẹn gặp lại Huy vào dịp nào?",
        options: [
          "Ngay thứ Hai tuần sau ở sân bay",
          "Mùa hè hai năm sau ở nước ngoài",
          "Dịp Tết khi Huy về Hà Nội để đi ăn quán phở quen",
        ],
        correctIndex: 2,
        explanationVi: "Câu cuối đoạn 3 viết: «Hẹn dịp Tết về Hà Nội mình lại ngồi quán phở quen kể chuyện cả buổi!»",
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
  {
    id: "rp-opinions-2",
    topicId: "opinions",
    titleVi: "Thanh toán không tiền mặt: Tiện lợi nhưng có nên xóa bỏ hoàn toàn tiền mặt?",
    formatLabel: "Bình luận xã hội · Kinh tế số",
    paragraphs: [
      "Chỉ trong vài năm gần đây, thói quen thanh toán ở các đô thị Việt Nam đã thay đổi chóng mặt. Từ quán cà phê hiện đại đến xe bánh mì hay gánh hàng rau trong chợ nhỏ, tấm bảng mã QR xuất hiện khắp nơi. Nhiều bạn trẻ thậm chí có thể đi làm cả tuần mà trong ví không hề mang theo một tờ tiền giấy nào.",
      "Không thể phủ nhận những lợi ích rõ rệt của xu hướng này. Thanh toán số giúp giao dịch diễn ra nhanh gọn, đỡ mất công chờ thối tiền lẻ và hạn chế rủi ro rơi ví hay nhận nhầm tiền giả. Ngoài ra, việc mọi khoản chi đều được lưu lại trên ứng dụng ngân hàng cũng giúp người dùng dễ dàng thống kê chi tiêu cuối tháng một cách minh bạch hơn.",
      "Tuy nhiên, theo quan điểm của tôi, chúng ta không nên hướng tới việc xóa bỏ hoàn toàn tiền mặt. Thực tế vẫn còn nhiều cô chú lớn tuổi hoặc lao động tự do chưa quen thao tác trên điện thoại thông minh, chưa kể những lúc mất sóng mạng hay hệ thống ngân hàng bảo trì đột xuất. Bên cạnh đó, nhiều người thừa nhận cảm giác tiêu tiền trên màn hình quá «nhẹ tay» khiến họ dễ mua sắm bốc đồng. Vì thế, duy trì song song cả hai phương thức để mỗi nhóm cư dân đều có lựa chọn phù hợp vẫn là giải pháp nhân văn và thực tế nhất.",
    ],
    glossary: {
      "chóng mặt": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Diễn ra với tốc độ cực kỳ nhanh, vượt xa nhịp thay đổi thông thường.",
        en: "dizzyingly fast / rapid",
      },
      "không thể phủ nhận": {
        pos: "cụm động từ",
        ipa: "",
        definitionVi: "Rõ ràng đến mức ai cũng phải công nhận là đúng.",
        en: "undeniable",
      },
      "giao dịch": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Hoạt động mua bán, chuyển tiền hoặc trao đổi dịch vụ.",
        en: "transaction",
      },
      "tiền lẻ": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Các tờ tiền mệnh giá nhỏ dùng để trả hoặc thối lại khi mua hàng.",
        en: "small change",
      },
      "thống kê": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Tổng hợp và theo dõi các con số theo từng nhóm rõ ràng.",
        en: "track / compile statistics",
      },
      "bảo trì": {
        pos: "động từ",
        ipa: "",
        definitionVi: "Tạm dừng hoặc kiểm tra hệ thống kỹ thuật để sửa chữa và nâng cấp.",
        en: "undergo maintenance",
      },
      "bốc đồng": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Hành động vội vàng theo cảm xúc nhất thời mà thiếu suy xét kỹ.",
        en: "impulsive",
      },
      "song song": {
        pos: "phó từ",
        ipa: "",
        definitionVi: "Cùng tồn tại và vận hành đồng thời bên cạnh nhau.",
        en: "in parallel / side by side",
      },
      "nhân văn": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Tôn trọng và quan tâm đến nhu cầu của mọi con người, không bỏ ai lại phía sau.",
        en: "humane / inclusive",
      },
    },
    questions: [
      {
        id: "rp-opinions-2-q1",
        questionVi: "Một trong những ưu điểm của thanh toán số được nêu ở đoạn 2 là gì?",
        options: [
          "Giúp giao dịch nhanh gọn, đỡ chờ tiền lẻ và dễ thống kê chi tiêu",
          "Giúp tất cả các mặt hàng ở chợ giảm giá một nửa",
          "Hoạt động bình thường ngay cả khi điện thoại hết pin",
        ],
        correctIndex: 0,
        explanationVi: "Đoạn 2 liệt kê các ưu điểm: giao dịch nhanh gọn, đỡ chờ thối tiền lẻ, giảm rủi ro mất ví và dễ thống kê chi tiêu.",
      },
      {
        id: "rp-opinions-2-q2",
        questionVi: "Tác giả đưa ra lý do nào để phản đối việc xóa bỏ hoàn toàn tiền mặt?",
        options: [
          "Vì các cửa hàng ở thành phố không còn in mã QR nữa",
          "Vì còn người lớn tuổi chưa quen thao tác, có rủi ro lỗi mạng và dễ tiêu tiền bốc đồng",
          "Vì ứng dụng ngân hàng không lưu lại lịch sử giao dịch",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 3 chỉ ra ba vấn đề: người lớn tuổi/lao động tự do chưa quen, sự cố mạng/bảo trì, và tâm lý mua sắm bốc đồng.",
      },
      {
        id: "rp-opinions-2-q3",
        questionVi: "Giải pháp nào được tác giả ủng hộ ở cuối bài?",
        options: [
          "Bắt buộc mọi hàng quán chỉ nhận chuyển khoản từ năm sau",
          "Quay lại dùng tiền mặt hoàn toàn ở tất cả đô thị lớn",
          "Duy trì song song cả thanh toán số và tiền mặt",
        ],
        correctIndex: 2,
        explanationVi: "Câu cuối đoạn 3 khẳng định duy trì song song cả hai phương thức là giải pháp nhân văn và thực tế nhất.",
      },
    ],
  },
  {
    id: "rp-opinions-3",
    topicId: "opinions",
    titleVi: "Lối sống tối giản ở thành phố lớn: Trào lưu hay lựa chọn bền vững?",
    formatLabel: "Diễn đàn lối sống · Người trẻ đô thị",
    paragraphs: [
      "Giữa những căn hộ đô thị diện tích khiêm tốn và vô số đợt khuyến mãi trực tuyến diễn ra mỗi tháng, lối sống tối giản đang trở thành chủ đề được nhiều người đi làm trẻ quan tâm. Trên mạng xã hội, không khó để bắt gặp hình ảnh những căn phòng trống trải chỉ có vài món đồ cơ bản kèm lời khen ngợi về sự tự do tinh thần.",
      "Xét về mặt tích cực, tinh thần tối giản mang lại nhiều giá trị rất thiết thực. Khi dừng lại tự hỏi mình có thực sự cần món đồ này không trước khi bấm nút mua, người trẻ tiết kiệm được khoản tài chính đáng kể, bớt tốn công dọn dẹp nhà cửa và có thêm ngân sách cho trải nghiệm như học kỹ năng mới hay đi du lịch cùng gia đình. Giảm bớt sự bừa bộn xung quanh cũng giúp đầu óc dễ tập trung hơn sau ngày làm việc căng thẳng.",
      "Mặt khác, lối sống này dễ trở nên cực đoan nếu bị biến thành một khuôn mẫu cứng nhắc để khoe khoang. Tối giản không đồng nghĩa với việc tự ép mình sống thiếu thốn hay vứt bỏ cả những kỷ vật gắn bó chỉ để căn nhà trông giống tạp chí. Nói chung, tinh thần đẹp nhất của sự tối giản là hiểu rõ nhu cầu thực tế của bản thân — giữ lại những gì phục vụ tốt cho cuộc sống và mạnh dạn buông bỏ những thứ chỉ gây thêm gánh nặng.",
    ],
    glossary: {
      "khiêm tốn": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Có kích thước hoặc mức độ vừa nhỏ, không quá rộng lớn.",
        en: "modest / compact",
      },
      "khuyến mãi": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Chương trình giảm giá hoặc ưu đãi để thu hút người mua.",
        en: "promotion / sale",
      },
      "thiết thực": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Gắn sát với đời sống và đem lại ích lợi cụ thể, rõ ràng.",
        en: "practical / tangible",
      },
      "đáng kể": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Ở mức khá lớn, đủ tạo ra sự khác biệt rõ rệt.",
        en: "significant / considerable",
      },
      "bừa bộn": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Đồ đạc bày lung tung, thiếu ngăn nắp.",
        en: "cluttered / messy",
      },
      "cực đoan": {
        pos: "tính từ",
        ipa: "",
        definitionVi: "Đi quá giới hạn hợp lý theo một chiều cứng nhắc.",
        en: "extreme / rigid",
      },
      "khuôn mẫu": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Kiểu mẫu rập khuôn buộc mọi người phải làm giống hệt nhau.",
        en: "rigid template / mold",
      },
      "kỷ vật": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Đồ vật gắn liền với kỷ niệm đẹp và tình cảm cá nhân.",
        en: "keepsake / memento",
      },
      "gánh nặng": {
        pos: "danh từ",
        ipa: "",
        definitionVi: "Điều gây áp lực, mệt mỏi về tài chính, thời gian hoặc tinh thần.",
        en: "burden",
      },
    },
    questions: [
      {
        id: "rp-opinions-3-q1",
        questionVi: "Theo đoạn 2, cân nhắc kỹ trước khi mua sắm mang lại lợi ích gì cho người trẻ?",
        options: [
          "Tiết kiệm tài chính, đỡ tốn công dọn dẹp và có thêm ngân sách cho trải nghiệm",
          "Giúp căn hộ tự động rộng gấp đôi diện tích ban đầu",
          "Không bao giờ cần mua sắm quần áo mới nữa",
        ],
        correctIndex: 0,
        explanationVi: "Đoạn 2 liệt kê các lợi ích: tiết kiệm khoản tài chính đáng kể, bớt dọn dẹp và dành ngân sách cho trải nghiệm.",
      },
      {
        id: "rp-opinions-3-q2",
        questionVi: "Tác giả cảnh báo điều gì ở đoạn 3?",
        options: [
          "Lối sống tối giản hoàn toàn không phù hợp với thành phố lớn",
          "Lối sống tối giản dễ trở nên cực đoan nếu ép mình sống thiếu thốn hay vứt bỏ cả kỷ vật",
          "Người sống tối giản không nên đi du lịch cùng gia đình",
        ],
        correctIndex: 1,
        explanationVi: "Đoạn 3 cảnh báo tránh biến tối giản thành khuôn mẫu cứng nhắc, tự ép sống thiếu thốn hoặc vứt cả kỷ vật.",
      },
      {
        id: "rp-opinions-3-q3",
        questionVi: "Theo kết luận của bài viết, tinh thần cốt lõi của lối sống tối giản là gì?",
        options: [
          "Chỉ sở hữu tối đa mười món đồ trong toàn bộ căn phòng",
          "Làm theo đúng mọi bức ảnh trang trí trên mạng xã hội",
          "Hiểu rõ nhu cầu thực tế để giữ lại điều hữu ích và buông bỏ thứ gây gánh nặng",
        ],
        correctIndex: 2,
        explanationVi: "Câu cuối khẳng định tinh thần đẹp nhất là hiểu rõ nhu cầu thực tế, giữ điều phục vụ tốt và bỏ thứ gây gánh nặng.",
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
  {
    id: "sb-self-4",
    topicId: "self",
    promptEn: "After five years working abroad, he decided to return to Da Nang to live near his family.",
    hintVi: "Mở đầu bằng «Sau năm năm» và dùng «quyết định về ... sống gần ...».",
    targetSentenceVi: "Sau năm năm làm việc ở nước ngoài, anh ấy quyết định về Đà Nẵng sống gần gia đình.",
    chunks: ["Sau năm năm", "làm việc ở nước ngoài,", "anh ấy", "quyết định", "về Đà Nẵng", "sống gần gia đình."],
    grammarNoteVi: "Động từ «về» thể hiện cảm giác trở lại quê hương hoặc nơi gắn bó thân thuộc.",
  },
  {
    id: "sb-self-5",
    topicId: "self",
    promptEn: "Besides my main job at the company, I also take on freelance design work on weekends.",
    hintVi: "Dùng cặp «Ngoài ... mình còn ...» để bổ sung hoạt động thứ hai.",
    targetSentenceVi: "Ngoài công việc chính ở công ty, mình còn nhận thiết kế tự do vào cuối tuần.",
    chunks: ["Ngoài công việc chính", "ở công ty,", "mình còn", "nhận thiết kế", "tự do", "vào cuối tuần."],
    grammarNoteVi: "Cấu trúc «Ngoài A, S còn B» rất gọn và tự nhiên khi kể thêm công việc phụ hoặc sở thích.",
  },
  {
    id: "sb-self-6",
    topicId: "self",
    promptEn: "Thanks to proactively learning every day, she quickly adapted to the new environment.",
    hintVi: "Dùng «Nhờ chủ động...» và cụm «thích nghi với...».",
    targetSentenceVi: "Nhờ chủ động học hỏi mỗi ngày, cô ấy nhanh chóng thích nghi với môi trường mới.",
    chunks: ["Nhờ chủ động", "học hỏi mỗi ngày,", "cô ấy", "nhanh chóng", "thích nghi với", "môi trường mới."],
    grammarNoteVi: "«Nhờ + [nguyên nhân tích cực]» luôn đi với kết quả tốt đẹp ở vế sau.",
  },
  {
    id: "sb-self-7",
    topicId: "self",
    promptEn: "My goal this year is to improve my foreign language and maintain steady health.",
    hintVi: "Bắt đầu với «Mục tiêu năm nay của tôi là...» và nối hai động từ bằng «và».",
    targetSentenceVi: "Mục tiêu năm nay của tôi là nâng cao ngoại ngữ và duy trì sức khỏe ổn định.",
    chunks: ["Mục tiêu năm nay", "của tôi là", "nâng cao", "ngoại ngữ", "và duy trì", "sức khỏe ổn định."],
    grammarNoteVi: "«Nâng cao» (improve/level up) và «duy trì» (maintain) là hai động từ cốt lõi khi nói về mục tiêu cá nhân.",
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
  {
    id: "sb-food-4",
    topicId: "food",
    promptEn: "This vegetarian spot cooks with fresh mushrooms and vegetables, so the flavor is really light and easy to eat.",
    hintVi: "Nối nguyên nhân và nhận xét hương vị bằng «nên vị rất...».",
    targetSentenceVi: "Quán chay này nấu từ nấm và rau củ tươi nên vị rất thanh và dễ ăn.",
    chunks: ["Quán chay này", "nấu từ nấm", "và rau củ tươi", "nên vị", "rất thanh", "và dễ ăn."],
    grammarNoteVi: "«Nấu từ + [nguyên liệu]» nhấn mạnh thành phần chính làm nên hương vị tự nhiên của món ăn.",
  },
  {
    id: "sb-food-5",
    topicId: "food",
    promptEn: "Thanks to adding a bit of lime and fresh chili, today's bowl of bun bo is way more flavorful.",
    hintVi: "Mở đầu bằng «Nhờ thêm chút...» và kết bằng «đậm đà hơn hẳn.»",
    targetSentenceVi: "Nhờ thêm chút chanh và ớt tươi, bát bún bò hôm nay đậm đà hơn hẳn.",
    chunks: ["Nhờ thêm chút", "chanh và ớt tươi,", "bát bún bò", "hôm nay", "đậm đà", "hơn hẳn."],
    grammarNoteVi: "«Hơn hẳn» đặt sau tính từ nhấn mạnh sự vượt trội rõ rệt so với trước khi nêm thêm gia vị.",
  },
  {
    id: "sb-food-6",
    topicId: "food",
    promptEn: "Excuse me, could I order an extra plate of boiled vegetables and some ginger fish sauce?",
    hintVi: "Dùng cách gọi món thân thiện «Em ơi cho anh gọi thêm... nhé.»",
    targetSentenceVi: "Em ơi cho anh gọi thêm một đĩa rau luộc và ít nước mắm gừng nhé.",
    chunks: ["Em ơi", "cho anh gọi thêm", "một đĩa", "rau luộc", "và ít", "nước mắm gừng nhé."],
    grammarNoteVi: "«Cho [đại từ] gọi thêm...» là câu nói chuẩn bản xứ khi muốn gọi bổ sung món giữa bữa ăn.",
  },
  {
    id: "sb-food-7",
    topicId: "food",
    promptEn: "On weekends I prefer going to the market to cook home-style meals rather than ordering takeout.",
    hintVi: "Dùng cấu trúc so sánh sở thích «thích ... hơn là ...».",
    targetSentenceVi: "Cuối tuần mình thích tự đi chợ nấu cơm nhà hơn là đặt đồ ăn ngoài.",
    chunks: ["Cuối tuần", "mình thích", "tự đi chợ", "nấu cơm nhà", "hơn là", "đặt đồ ăn ngoài."],
    grammarNoteVi: "Cấu trúc «thích A hơn là B» giúp diễn đạt lựa chọn rõ ràng và tự nhiên trong giao tiếp hằng ngày.",
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
  {
    id: "sb-routine-4",
    topicId: "routine",
    promptEn: "Before going to bed, I usually put my phone far away to avoid staying up late.",
    hintVi: "Dùng «Trước khi đi ngủ,» và cụm mục đích «để tránh...».",
    targetSentenceVi: "Trước khi đi ngủ, mình thường cất điện thoại ra xa để tránh thức khuya.",
    chunks: ["Trước khi đi ngủ,", "mình thường", "cất điện thoại", "ra xa", "để tránh", "thức khuya."],
    grammarNoteVi: "«Cất ... ra xa» mang nghĩa đặt gọn ở khoảng cách xa tầm với để giữ kỷ luật sinh hoạt.",
  },
  {
    id: "sb-routine-5",
    topicId: "routine",
    promptEn: "Whenever I have an early meeting, I prepare breakfast ahead of time the night before.",
    hintVi: "Dùng mẫu câu «Hôm nào ... thì ...» và «chuẩn bị sẵn ... từ tối hôm trước.»",
    targetSentenceVi: "Hôm nào phải họp sớm thì tôi chuẩn bị sẵn đồ ăn sáng từ tối hôm trước.",
    chunks: ["Hôm nào", "phải họp sớm", "thì tôi", "chuẩn bị sẵn", "đồ ăn sáng", "từ tối hôm trước."],
    grammarNoteVi: "Chữ «sẵn» sau động từ «chuẩn bị» nhấn mạnh mọi thứ đã làm trước, sáng hôm sau chỉ việc dùng.",
  },
  {
    id: "sb-routine-6",
    topicId: "routine",
    promptEn: "Just taking a fifteen-minute nap at noon makes afternoon work noticeably sharper.",
    hintVi: "Dùng cấu trúc «Chỉ cần ... là ...» để nhấn mạnh điều kiện đơn giản mà hiệu quả.",
    targetSentenceVi: "Chỉ cần chợp mắt mười lăm phút buổi trưa là chiều làm việc tỉnh táo hơn hẳn.",
    chunks: ["Chỉ cần", "chợp mắt", "mười lăm phút buổi trưa", "là chiều", "làm việc", "tỉnh táo hơn hẳn."],
    grammarNoteVi: "«Chỉ cần A là B» diễn đạt mối quan hệ nguyên nhân – kết quả rất gọn và giàu sức thuyết phục.",
  },
  {
    id: "sb-routine-7",
    topicId: "routine",
    promptEn: "Every Sunday the two of us go to the market early and then tidy up the apartment.",
    hintVi: "Dùng cặp «Chủ nhật nào ... cũng ...» để nói về thói quen đều đặn.",
    targetSentenceVi: "Chủ nhật nào hai vợ chồng mình cũng đi chợ sớm rồi dọn dẹp lại căn hộ.",
    chunks: ["Chủ nhật nào", "hai vợ chồng mình", "cũng đi chợ sớm", "rồi", "dọn dẹp lại", "căn hộ."],
    grammarNoteVi: "Cấu trúc «[Thời điểm] nào ... cũng ...» nhấn mạnh thói quen lặp lại đều đặn không bỏ sót.",
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
  {
    id: "sb-weather-4",
    topicId: "weather",
    promptEn: "Dalat is sunny and warm at midday, yet once evening falls it turns cold very quickly.",
    hintVi: "Dùng «nhưng tối xuống» và cụm «trở lạnh rất nhanh.»",
    targetSentenceVi: "Đà Lạt buổi trưa nắng ấm nhưng tối xuống trời trở lạnh rất nhanh.",
    chunks: ["Đà Lạt", "buổi trưa nắng ấm", "nhưng tối xuống", "trời", "trở lạnh", "rất nhanh."],
    grammarNoteVi: "Động từ «trở + [tính từ thời tiết]» (trở lạnh, trở gió, trở nắng) tả sự chuyển biến nhanh trong ngày.",
  },
  {
    id: "sb-weather-5",
    topicId: "weather",
    promptEn: "During northern humid season, if you throw the windows wide open, the floor gets even damper.",
    hintVi: "Dùng cấu trúc nhấn mạnh «... mà ... thì ... càng ... hơn.»",
    targetSentenceVi: "Mùa nồm ở miền Bắc mà mở toang cửa sổ thì nền nhà càng ẩm ướt hơn.",
    chunks: ["Mùa nồm", "ở miền Bắc", "mà mở toang cửa sổ", "thì nền nhà", "càng ẩm ướt", "hơn."],
    grammarNoteVi: "Chữ «mà» đứng giữa bối cảnh và hành động mang sắc thái giả định cảnh báo rất tự nhiên trong văn nói.",
  },
  {
    id: "sb-weather-6",
    topicId: "weather",
    promptEn: "Thanks to the late-afternoon shower, the sweltering air in the city cooled down noticeably.",
    hintVi: "Bắt đầu với «Nhờ cơn mưa rào...» và kết bằng «dịu hẳn xuống.»",
    targetSentenceVi: "Nhờ cơn mưa rào cuối chiều, không khí oi bức trong thành phố dịu hẳn xuống.",
    chunks: ["Nhờ cơn mưa rào", "cuối chiều,", "không khí oi bức", "trong thành phố", "dịu hẳn", "xuống."],
    grammarNoteVi: "«Dịu hẳn xuống» là cụm từ giàu hình ảnh để nói cái nóng gay gắt giảm rõ rệt.",
  },
  {
    id: "sb-weather-7",
    topicId: "weather",
    promptEn: "October is an ideal time to stroll the Old Quarter because the weather is cool and overcast with little rain.",
    hintVi: "Dùng «là thời điểm lý tưởng để...» và nối lý do bằng «vì trời...».",
    targetSentenceVi: "Tháng Mười là thời điểm lý tưởng để đi dạo phố cổ vì trời râm mát và ít mưa.",
    chunks: ["Tháng Mười là", "thời điểm lý tưởng", "để đi dạo phố cổ", "vì trời", "râm mát", "và ít mưa."],
    grammarNoteVi: "«Thời điểm lý tưởng để + V» là cụm câu rất hay dùng khi gợi ý lịch du lịch hoặc sự kiện ngoài trời.",
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
  {
    id: "sb-emotions-4",
    topicId: "emotions",
    promptEn: "Thanks to the team's timely encouragement, I regained my composure and felt more confident.",
    hintVi: "Dùng «Nhờ sự động viên đúng lúc» và động từ «lấy lại bình tĩnh».",
    targetSentenceVi: "Nhờ sự động viên đúng lúc của cả nhóm, mình đã lấy lại bình tĩnh và tự tin hơn.",
    chunks: ["Nhờ sự động viên", "đúng lúc", "của cả nhóm,", "mình đã", "lấy lại bình tĩnh", "và tự tin hơn."],
    grammarNoteVi: "«Lấy lại + [trạng thái tích cực]» (lấy lại bình tĩnh, lấy lại tinh thần) diễn tả sự hồi phục cảm xúc.",
  },
  {
    id: "sb-emotions-5",
    topicId: "emotions",
    promptEn: "Anyone who just moved to an unfamiliar city can hardly avoid feeling out of place.",
    hintVi: "Dùng «Ai mới ... cũng khó tránh khỏi ...».",
    targetSentenceVi: "Ai mới chuyển đến một thành phố xa lạ cũng khó tránh khỏi cảm giác lạc lõng.",
    chunks: ["Ai mới chuyển đến", "một thành phố xa lạ", "cũng", "khó tránh khỏi", "cảm giác", "lạc lõng."],
    grammarNoteVi: "«Khó tránh khỏi + [cảm xúc/tình huống]» thể hiện sự thấu hiểu và đồng cảm sâu sắc với người nghe.",
  },
  {
    id: "sb-emotions-6",
    topicId: "emotions",
    promptEn: "Don't feel too guilty anymore; as long as we learn from this small mistake it's fine.",
    hintVi: "Dùng «Đừng quá ... nữa,» và kết bằng «rút kinh nghiệm là được.»",
    targetSentenceVi: "Cậu đừng quá áy náy nữa, sai sót nhỏ lần này mình rút kinh nghiệm là được.",
    chunks: ["Cậu đừng quá", "áy náy nữa,", "sai sót nhỏ", "lần này", "mình rút kinh nghiệm", "là được."],
    grammarNoteVi: "«... là được» ở cuối câu mang giọng điệu nhẹ nhàng, rộng lượng khi trấn an bạn bè hoặc đồng nghiệp.",
  },
  {
    id: "sb-emotions-7",
    topicId: "emotions",
    promptEn: "After many months of nonstop effort, she felt immensely proud of this result.",
    hintVi: "Dùng «Sau nhiều tháng...» và tính từ «vô cùng tự hào về...».",
    targetSentenceVi: "Sau nhiều tháng cố gắng không ngừng, cô ấy thấy vô cùng tự hào về kết quả này.",
    chunks: ["Sau nhiều tháng", "cố gắng không ngừng,", "cô ấy thấy", "vô cùng tự hào", "về", "kết quả này."],
    grammarNoteVi: "«Tự hào» đi kèm giới từ «về» trước thành quả hoặc người khiến mình hãnh diện.",
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
  {
    id: "sb-opinions-4",
    topicId: "opinions",
    promptEn: "Cashless payment is very convenient; however, consumers can easily overspend.",
    hintVi: "Nối ưu điểm và lưu ý bằng liên từ «tuy nhiên» và cụm «chi tiêu quá tay.»",
    targetSentenceVi: "Thanh toán không tiền mặt rất tiện lợi, tuy nhiên người tiêu dùng dễ chi tiêu quá tay.",
    chunks: ["Thanh toán", "không tiền mặt", "rất tiện lợi,", "tuy nhiên", "người tiêu dùng", "dễ chi tiêu quá tay."],
    grammarNoteVi: "«Chi tiêu quá tay» là cách diễn đạt tự nhiên như người bản xứ cho việc tiêu vượt mức dự tính.",
  },
  {
    id: "sb-opinions-5",
    topicId: "opinions",
    promptEn: "In the long run, investing in health and knowledge always brings the most lasting value.",
    hintVi: "Mở đầu bằng «Về lâu dài,» và dùng cụm «mang lại giá trị bền vững nhất.»",
    targetSentenceVi: "Về lâu dài, đầu tư vào sức khỏe và tri thức luôn mang lại giá trị bền vững nhất.",
    chunks: ["Về lâu dài,", "đầu tư vào", "sức khỏe và tri thức", "luôn mang lại", "giá trị", "bền vững nhất."],
    grammarNoteVi: "«Về lâu dài» giúp câu nhận định có tầm nhìn sâu rộng và thuyết phục hơn ở trình độ B1.",
  },
  {
    id: "sb-opinions-6",
    topicId: "opinions",
    promptEn: "I partly agree with your opinion, yet we still need to consider the cost further.",
    hintVi: "Dùng «đồng tình một phần» và nối bằng «nhưng vẫn cần xem xét thêm...».",
    targetSentenceVi: "Mình đồng tình một phần với ý kiến của cậu, nhưng vẫn cần xem xét thêm chi phí.",
    chunks: ["Mình đồng tình", "một phần", "với ý kiến của cậu,", "nhưng vẫn cần", "xem xét thêm", "chi phí."],
    grammarNoteVi: "«Đồng tình một phần» là cụm từ vàng giúp bạn phản biện mềm mỏng mà vẫn giữ vững lập trường.",
  },
  {
    id: "sb-opinions-7",
    topicId: "opinions",
    promptEn: "Overall, every option has its own strengths; what matters is fitting one's circumstances.",
    hintVi: "Bắt đầu với «Nói chung là...» và kết luận bằng «quan trọng là phù hợp với...».",
    targetSentenceVi: "Nói chung là phương án nào cũng có ưu điểm riêng, quan trọng là phù hợp với hoàn cảnh.",
    chunks: ["Nói chung là", "phương án nào cũng", "có ưu điểm riêng,", "quan trọng là", "phù hợp với", "hoàn cảnh."],
    grammarNoteVi: "«Quan trọng là...» giúp chốt lại trọng tâm vấn đề một cách khách quan và cân bằng.",
  },
];
