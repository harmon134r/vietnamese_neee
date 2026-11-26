/**
 * 6 Interactive Multi-Turn Branching Roleplay Dialogues (1 per topic, 4 turns each = 24 turns).
 * Every turn's expectedResponses links cleanly via nextTurnId through all 4 turns to null.
 */

export const DIALOGUE_SCENARIOS = [
  // =========================================================================
  // 1. SELF — Networking Coffee with a New Colleague
  // =========================================================================
  {
    id: "dlg-self-1",
    topicId: "self",
    titleVi: "Cà phê làm quen với đồng nghiệp mới",
    settingVi: "Quán cà phê gần văn phòng ở Quận 1, buổi sáng thứ Hai trước giờ họp nhóm.",
    partnerName: "Chị Minh Châu",
    partnerRole: "Quản lý dự án cùng bộ phận",
    goalVi: "Giới thiệu tự nhiên về kinh nghiệm làm việc, quê quán, tính cách và cuộc sống ngoài giờ làm.",
    openingLineVi:
      "Chào bạn! Mình là Châu, quản lý dự án ở nhóm kế bên. Nghe bảo bạn mới gia nhập công ty tuần này, trước đây bạn làm trong lĩnh vực nào vậy?",
    turns: [
      {
        id: "self-t1",
        npcTextVi:
          "Chào bạn! Mình là Châu, quản lý dự án ở nhóm kế bên. Nghe bảo bạn mới gia nhập công ty tuần này, trước đây bạn làm trong lĩnh vực nào vậy?",
        npcEn:
          "Hi! I'm Chau, a project manager on the neighboring team. I heard you just joined this week — what field were you working in previously?",
        mood: "warm",
        hintsVi: [
          "Dùng mẫu: «Trước đây mình làm trong lĩnh vực ... được ... năm rồi.»",
          "Có thể thêm lý do chuyển việc để câu chuyện sâu hơn.",
        ],
        expectedResponses: [
          {
            id: "self-t1-r1",
            labelVi: "Chia sẻ kinh nghiệm & mục tiêu đổi mới",
            textVi: "Chào chị Châu ạ! Trước đây mình làm thiết kế sản phẩm được hơn ba năm, rồi muốn chuyển việc để thử thách ở môi trường lớn hơn.",
            textEn: "Hi Chau! Previously I worked in product design for over three years, and wanted to switch jobs for a challenge in a larger environment.",
            keywords: ["chào", "trước đây", "làm", "ba năm", "chuyển việc", "thử thách"],
            npcReactionVi: "Ồ hay quá, nhóm mình cũng đang rất cần góc nhìn thiết kế mới mẻ như vậy!",
            nextTurnId: "self-t2",
            scoreBonus: 15,
          },
          {
            id: "self-t1-r2",
            labelVi: "Trả lời ngắn gọn về chuyên ngành cũ",
            textVi: "Chào chị, trước đây tôi học chuyên ngành kinh doanh nhưng gần đây chuyển sang làm về dữ liệu.",
            textEn: "Hi, I originally majored in business, though recently I transitioned into data work.",
            keywords: ["chào", "chuyên ngành", "kinh doanh", "chuyển sang", "dữ liệu"],
            npcReactionVi: "Chuyển ngành như vậy đòi hỏi tự học nhiều lắm đấy, thật đáng nể!",
            nextTurnId: "self-t2",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "self-t2",
        npcTextVi:
          "Thế bạn là người ở đây luôn hay từ tỉnh khác chuyển vào sống? Nhịp sống ở thành phố có khiến bạn thấy bỡ ngỡ không?",
        npcEn:
          "So are you originally from here or did you move from another province? Does the city's pace feel overwhelming at all?",
        mood: "curious",
        hintsVi: [
          "Dùng từ «quê gốc» hoặc «chuyển vào / chuyển ra».",
          "Chia sẻ cảm nhận thật về việc tự lập ở thành phố.",
        ],
        expectedResponses: [
          {
            id: "self-t2-r1",
            labelVi: "Kể về quê gốc & hành trình tự lập",
            textVi: "Quê gốc của mình ở miền Trung, nhưng mình chuyển vào đây sống tự lập từ hồi đại học nên giờ quen hẳn nhịp sống này rồi.",
            textEn: "My hometown is in Central Vietnam, but I moved here to live independently back in college, so I'm totally used to the pace now.",
            keywords: ["quê gốc", "chuyển vào", "tự lập", "đại học", "nhịp sống"],
            npcReactionVi: "Sống tự lập từ hồi sinh viên thì chắc chắn bản lĩnh và linh hoạt lắm rồi.",
            nextTurnId: "self-t3",
            scoreBonus: 15,
          },
          {
            id: "self-t2-r2",
            labelVi: "Nói mình mới chuyển đến gần đây",
            textVi: "Mình mới chuyển tới thành phố này gần một năm nên vẫn đang khám phá thêm nhiều điều mới mẻ.",
            textEn: "I just moved to this city nearly a year ago, so I'm still discovering lots of new things.",
            keywords: ["mới chuyển", "thành phố", "một năm", "khám phá"],
            npcReactionVi: "Vậy để hôm nào mình giới thiệu cho bạn mấy góc cà phê và quán ăn ngon quanh đây nhé!",
            nextTurnId: "self-t3",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "self-t3",
        npcTextVi:
          "Ở phòng mình mọi người hay làm việc nhóm khá sát sao. Phong cách làm việc và tính cách của bạn thiên về kiểu nào hơn?",
        npcEn:
          "In our department everyone collaborates pretty closely. What's your working style and personality more like?",
        mood: "friendly",
        hintsVi: [
          "Dùng tính từ như «hướng nội», «hòa đồng», «sở trường».",
          "Nối bằng «hơi ... nhưng ... lại khá ...» cho tự nhiên.",
        ],
        expectedResponses: [
          {
            id: "self-t3-r1",
            labelVi: "Hướng nội nhưng hòa đồng khi làm nhóm",
            textVi: "Tính mình hơi hướng nội khi mới quen, nhưng làm việc nhóm lại khá hòa đồng và thích trao đổi rõ ràng.",
            textEn: "I'm a bit introverted when first meeting people, yet quite sociable in teamwork and enjoy clear communication.",
            keywords: ["hướng nội", "làm việc nhóm", "hòa đồng", "trao đổi"],
            npcReactionVi: "Rất hợp với văn hóa nhóm mình luôn! Tụi mình đề cao sự thẳng thắn nhưng thoải mái.",
            nextTurnId: "self-t4",
            scoreBonus: 15,
          },
          {
            id: "self-t3-r2",
            labelVi: "Nhấn mạnh sở trường tổ chức & lắng nghe",
            textVi: "Mình khá điềm tĩnh và sở trường của mình là lắng nghe, tổng hợp ý kiến để mọi người dễ phối hợp.",
            textEn: "I'm fairly calm and my strong suit is listening and synthesizing ideas so everyone coordinates smoothly.",
            keywords: ["điềm tĩnh", "sở trường", "lắng nghe", "phối hợp"],
            npcReactionVi: "Nghe là thấy yên tâm rồi, có người kết nối như bạn thì họp nhóm nhẹ nhàng hơn nhiều.",
            nextTurnId: "self-t4",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "self-t4",
        npcTextVi:
          "Câu cuối nhé, ngoài giờ làm bạn thường làm gì để giữ cân bằng cuộc sống? Cuối tuần nhóm mình thỉnh thoảng cũng có câu lạc bộ chạy bộ đấy.",
        npcEn:
          "Last question — outside of work, what do you usually do to keep work-life balance? Our team occasionally has a weekend running club too.",
        mood: "enthusiastic",
        hintsVi: [
          "Dùng «Ngoài giờ làm...» hoặc «Dạo này mình đang...».",
          "Bày tỏ sự hào hứng nếu muốn tham gia cùng đồng nghiệp.",
        ],
        expectedResponses: [
          {
            id: "self-t4-r1",
            labelVi: "Hào hứng tham gia câu lạc bộ chạy bộ",
            textVi: "Ngoài giờ làm mình cũng hay chạy bộ và đọc sách. Cuối tuần nào có lịch chạy chị rủ mình tham gia với nhé!",
            textEn: "Outside of work I also jog and read. Whenever there's a weekend run, count me in please!",
            keywords: ["ngoài giờ làm", "chạy bộ", "cuối tuần", "tham gia"],
            npcReactionVi: "Tuyệt vời! Sáng thứ Bảy này tụi mình chạy quanh công viên, để mình thêm bạn vào nhóm chat luôn nhé.",
            nextTurnId: null,
            scoreBonus: 15,
          },
          {
            id: "self-t4-r2",
            labelVi: "Chia sẻ sở thích nấu ăn & cà phê yên tĩnh",
            textVi: "Mình hay nấu ăn tại nhà và đi cà phê yên tĩnh cuối tuần để cân bằng cuộc sống, nhưng thỉnh thoảng đi bộ cùng nhóm cũng rất vui ạ.",
            textEn: "I usually cook at home and visit quiet cafes on weekends for balance, though joining the team for a walk occasionally sounds fun too.",
            keywords: ["nấu ăn", "cà phê", "cân bằng cuộc sống", "cuối tuần"],
            npcReactionVi: "Hẹn bạn tuần sau cả nhóm đi ăn trưa làm quen kỹ hơn nhé. Rất vui được làm việc cùng bạn!",
            nextTurnId: null,
            scoreBonus: 15,
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 2. FOOD — Ordering & Talking Flavors at a Vietnamese Bistro
  // =========================================================================
  {
    id: "dlg-food-1",
    topicId: "food",
    titleVi: "Gọi món và trao đổi khẩu vị tại quán ăn Việt",
    settingVi: "Quán ăn gia đình ấm cúng vào bữa tối cùng bạn người Việt và nhân viên phục vụ.",
    partnerName: "Anh Khang",
    partnerRole: "Chủ quán kiêm đầu bếp thân thiện",
    goalVi: "Hỏi gợi ý món đặc trưng, báo dị ứng thực phẩm, điều chỉnh vị giác và nhận xét hương vị tự nhiên.",
    openingLineVi:
      "Chào anh chị đến quán! Tối nay bên em mới nấu nồi cá kho tộ và canh chua bông điên điển rất tươi. Anh chị hay ăn khẩu vị đậm đà hay thanh đạm hơn ạ?",
    turns: [
      {
        id: "food-t1",
        npcTextVi:
          "Chào anh chị đến quán! Tối nay bên em mới nấu nồi cá kho tộ và canh chua bông điên điển rất tươi. Anh chị hay ăn khẩu vị đậm đà hay thanh đạm hơn ạ?",
        npcEn:
          "Welcome! Tonight we just made fresh clay-pot braised fish and sour soup with sesbania flowers. Do you prefer richer flavors or something lighter?",
        mood: "welcoming",
        hintsVi: [
          "Dùng «hợp khẩu vị», «thanh đạm», «đậm đà».",
          "Có thể hỏi thêm quán có món rau hoặc món chay đi kèm không.",
        ],
        expectedResponses: [
          {
            id: "food-t1-r1",
            labelVi: "Chọn kết hợp đậm đà và thanh đạm",
            textVi: "Nghe hấp dẫn quá! Cho mình gọi một phần cá kho tộ đậm đà, thêm một đĩa rau luộc cho bữa tối thanh đạm và đỡ ngấy nhé.",
            textEn: "That sounds tempting! Let's order a portion of flavorful braised fish plus a plate of boiled greens to keep dinner light and not too heavy.",
            keywords: ["cá kho tộ", "đậm đà", "rau luộc", "thanh đạm", "đỡ ngấy"],
            npcReactionVi: "Chọn quá chuẩn luôn anh chị ơi, hai món đó cân vị với nhau cực kỳ hợp!",
            nextTurnId: "food-t2",
            scoreBonus: 15,
          },
          {
            id: "food-t1-r2",
            labelVi: "Ưu tiên món thanh đạm, ít dầu mỡ",
            textVi: "Buổi tối mình thích ăn thanh đạm, ít dầu mỡ hơn, quán có gợi ý món chay hay canh nhẹ nào không?",
            textEn: "In the evening I prefer lighter, less oily food — do you recommend any vegetarian dishes or light soups?",
            keywords: ["thanh đạm", "ít dầu mỡ", "món chay", "gợi ý"],
            npcReactionVi: "Dạ có ngay đậu phụ hấp nấm hương và canh bầu nấu nhẹ, rất thanh và dễ ăn ạ.",
            nextTurnId: "food-t2",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "food-t2",
        npcTextVi:
          "Trước khi em chuyển thực đơn xuống bếp, anh chị có bị dị ứng thực phẩm gì hoặc cần nêm nếm giảm cay, giảm đường không ạ?",
        npcEn:
          "Before I send the order to the kitchen, do you have any food allergies or want us to season it less spicy or less sweet?",
        mood: "attentive",
        hintsVi: [
          "Dùng cụm «Mình bị dị ứng...» hoặc «nhờ bếp nêm...».",
          "Thêm «giúp mình nhé» để nghe lịch sự và gần gũi.",
        ],
        expectedResponses: [
          {
            id: "food-t2-r1",
            labelVi: "Báo dị ứng hải sản và dặn giảm ngọt",
            textVi: "Mình bị dị ứng tôm cua nên nhờ bếp đừng bỏ hải sản vào canh, và nêm nếm ít ngọt một chút giúp mình nhé.",
            textEn: "I'm allergic to shrimp and crab, so please ask the kitchen not to put shellfish in the soup and make it a bit less sweet.",
            keywords: ["dị ứng", "hải sản", "nêm nếm", "ít ngọt", "giúp mình"],
            npcReactionVi: "Dạ em ghi chú kỹ ngay đây, bếp sẽ nấu riêng nước dùng không hải sản và giữ vị thanh tự nhiên ạ.",
            nextTurnId: "food-t3",
            scoreBonus: 15,
          },
          {
            id: "food-t2-r2",
            labelVi: "Không dị ứng nhưng xin giảm cay",
            textVi: "Mình không bị dị ứng thực phẩm nào cả, chỉ nhờ quán giảm bớt ớt vì mình không ăn cay giỏi lắm.",
            textEn: "I don't have any food allergies, just please go easy on the chili since I'm not great with spicy food.",
            keywords: ["không bị dị ứng", "giảm", "ớt", "không ăn cay"],
            npcReactionVi: "Dạ rõ rồi ạ, em sẽ để ớt tươi riêng bên ngoài để ai ăn cay thì tự thêm nhé.",
            nextTurnId: "food-t3",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "food-t3",
        npcTextVi:
          "Đồ ăn lên rồi đây ạ! Anh chị có muốn gọi thêm đồ uống không — bên em có trà sen lạnh, nước mơ và cà phê phin rang mộc.",
        npcEn:
          "Here comes your food! Would you like to order drinks — we have iced lotus tea, salted apricot juice, and pure roasted drip coffee.",
        mood: "cheerful",
        hintsVi: [
          "Dùng «Cho mình một ly ... ít đường / ít đá nhé».",
          "Có thể giải thích ngắn lý do không uống cà phê buổi tối (kẻo khó ngủ).",
        ],
        expectedResponses: [
          {
            id: "food-t3-r1",
            labelVi: "Chọn trà sen vì tối tránh cà phê",
            textVi: "Tối uống cà phê phin sợ khó ngủ, nên cho mình một ly trà sen lạnh ít đường và ít đá nhé.",
            textEn: "I'm afraid drip coffee at night will make it hard to sleep, so I'll take an iced lotus tea with less sugar and less ice.",
            keywords: ["cà phê phin", "khó ngủ", "trà sen", "ít đường", "ít đá"],
            npcReactionVi: "Trà sen uống kèm bữa tối vừa thơm dịu vừa dễ tiêu lắm ạ!",
            nextTurnId: "food-t4",
            scoreBonus: 15,
          },
          {
            id: "food-t3-r2",
            labelVi: "Gọi nước mơ và hỏi thêm về cà phê",
            textVi: "Cho mình một ly nước mơ ít đá nhé, cuối tuần rảnh mình sẽ quay lại thử cà phê phin buổi sáng.",
            textEn: "I'll have an apricot juice with less ice, and when I'm free on the weekend I'll come back to try your drip coffee in the morning.",
            keywords: ["nước mơ", "ít đá", "quay lại", "cà phê phin"],
            npcReactionVi: "Dạ cuối tuần sáng nào quán em cũng mở từ bảy giờ rưỡi, rất mong được đón anh chị quay lại!",
            nextTurnId: "food-t4",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "food-t4",
        npcTextVi:
          "Không biết các món tối nay có hợp khẩu vị của anh chị không ạ? Có điểm nào bên em cần chỉnh thêm không?",
        npcEn:
          "How did the dishes tonight suit your palate? Is there anything we should adjust?",
        mood: "curious",
        hintsVi: [
          "Dùng «rất hợp khẩu vị», «vừa miệng», «không bị ngấy».",
          "Lời khen cụ thể về hương vị nghe chân thành và bản xứ hơn.",
        ],
        expectedResponses: [
          {
            id: "food-t4-r1",
            labelVi: "Khen chi tiết hương vị và tính tiền",
            textVi: "Rất hợp khẩu vị luôn anh ơi! Đồ ăn nêm nếm vừa miệng, canh thanh và không bị ngấy. Anh cho mình thanh toán nhé.",
            textEn: "It really suited my taste! Everything was seasoned just right, the soup was light and not greasy. Could I get the bill, please?",
            keywords: ["hợp khẩu vị", "nêm nếm", "vừa miệng", "không bị ngấy", "thanh toán"],
            npcReactionVi: "Cảm ơn anh chị nhiều lắm! Em gửi hóa đơn ngay đây, hẹn gặp lại anh chị lần sau nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
          {
            id: "food-t4-r2",
            labelVi: "Khen ngon và hứa giới thiệu bạn bè",
            textVi: "Món nào cũng đậm đà và tươi lắm, chắc chắn tuần sau mình sẽ rủ thêm đồng nghiệp ghé lại quán.",
            textEn: "Every dish was flavorful and fresh — I'll definitely bring colleagues back here next week.",
            keywords: ["đậm đà", "tươi", "rủ", "đồng nghiệp", "ghé lại"],
            npcReactionVi: "Nghe vậy em mừng quá! Lần sau anh chị đi nhóm đông cứ nhắn trước để em giữ bàn đẹp nhé.",
            nextTurnId: null,
            scoreBonus: 15,
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 3. ROUTINE — Catching Up on Workdays & Weekend Plans
  // =========================================================================
  {
    id: "dlg-routine-1",
    topicId: "routine",
    titleVi: "Chia sẻ lịch sinh hoạt và hẹn cuối tuần với bạn",
    settingVi: "Gặp lại người bạn cũ ở quán trà chiều sau giờ tan làm thứ Năm.",
    partnerName: "Quốc Bảo",
    partnerRole: "Bạn học đại học",
    goalVi: "Kể về lịch đi làm, cách tránh giờ cao điểm, duy trì tập thể dục và chốt hẹn cuối tuần.",
    openingLineVi:
      "Lâu lắm mới thấy cậu tan làm sớm thế này! Dạo này lịch trình công việc của cậu có còn dày đặc như tháng trước không?",
    turns: [
      {
        id: "routine-t1",
        npcTextVi:
          "Lâu lắm mới thấy cậu tan làm sớm thế này! Dạo này lịch trình công việc của cậu có còn dày đặc như tháng trước không?",
        npcEn:
          "It's been ages since I saw you get off work this early! Is your work schedule still as packed as last month?",
        mood: "friendly",
        hintsVi: [
          "Dùng «đỡ hơn trước», «tăng ca», «lịch trình dày đặc».",
          "So sánh tháng trước và hiện tại để câu nói mạch lạc.",
        ],
        expectedResponses: [
          {
            id: "routine-t1-r1",
            labelVi: "Công việc đã đỡ bận hơn tháng trước",
            textVi: "Đỡ hơn nhiều rồi cậu ạ! Tháng trước ngày nào cũng tăng ca, nhưng tuần này lịch trình bớt dày đặc nên mình tan làm đúng giờ.",
            textEn: "Much better now! Last month I worked overtime every day, but this week my schedule is less packed so I get off on time.",
            keywords: ["đỡ hơn", "tăng ca", "lịch trình", "tan làm", "đúng giờ"],
            npcReactionVi: "Thế thì mừng rồi, chứ làm liên tục kiểu tháng trước dễ kiệt sức lắm.",
            nextTurnId: "routine-t2",
            scoreBonus: 15,
          },
          {
            id: "routine-t1-r2",
            labelVi: "Vẫn bận nhưng biết cách sắp xếp hơn",
            textVi: "Việc vẫn khá nhiều nhưng mình biết sắp xếp lại thời gian và tranh thủ làm việc quan trọng vào buổi sáng.",
            textEn: "Work is still heavy, though I've gotten better at organizing my time and tackling key tasks in the morning.",
            keywords: ["sắp xếp", "thời gian", "tranh thủ", "buổi sáng"],
            npcReactionVi: "Hay đấy, xử lý việc khó từ sáng thì buổi chiều nhẹ đầu hơn hẳn.",
            nextTurnId: "routine-t2",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "routine-t2",
        npcTextVi:
          "Mà nhà cậu hơi xa công ty, sáng nào đi làm cậu cũng gặp tắc đường giờ cao điểm à?",
        npcEn:
          "Your place is pretty far from the office — do you run into rush-hour traffic jams every morning?",
        mood: "curious",
        hintsVi: [
          "Dùng «rời nhà trước... để tránh tắc đường / kẹt xe».",
          "Kể thêm bạn tranh thủ làm gì trên đường đi làm.",
        ],
        expectedResponses: [
          {
            id: "routine-t2-r1",
            labelVi: "Đi sớm tránh tắc đường",
            textVi: "Mình tập dậy sớm và rời nhà trước bảy giờ rưỡi để tránh tắc đường giờ cao điểm, đỡ mệt hơn nhiều.",
            textEn: "I trained myself to wake up early and leave before 7:30 to avoid rush-hour traffic — way less tiring.",
            keywords: ["dậy sớm", "rời nhà", "bảy giờ rưỡi", "tránh tắc đường", "giờ cao điểm"],
            npcReactionVi: "Đi sớm hơn có hai mươi phút mà tiết kiệm được cả nửa tiếng ngoài đường đúng không!",
            nextTurnId: "routine-t3",
            scoreBonus: 15,
          },
          {
            id: "routine-t2-r2",
            labelVi: "Đi phương tiện công cộng và nghe podcast",
            textVi: "Dạo này mình chuyển sang đi xe buýt rồi tranh thủ nghe podcast nên dù có kẹt xe cũng không thấy phí thời gian.",
            textEn: "Lately I switched to taking the bus and squeeze in podcasts, so even in traffic I don't feel time is wasted.",
            keywords: ["xe buýt", "tranh thủ", "podcast", "kẹt xe"],
            npcReactionVi: "Cách đó thông minh đấy, vừa đỡ hít bụi vừa có thời gian thư giãn.",
            nextTurnId: "routine-t3",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "routine-t3",
        npcTextVi:
          "Thế buổi tối cậu có còn thức khuya như hồi trước không, hay đã duy trì được thói quen thể thao nào chưa?",
        npcEn:
          "Do you still stay up late like before, or have you managed to keep up an exercise routine?",
        mood: "playful",
        hintsVi: [
          "Dùng «Dạo trước ... nhưng giờ ...».",
          "Nhắc tới «duy trì thói quen» hoặc «tập thể dục / ngủ sớm».",
        ],
        expectedResponses: [
          {
            id: "routine-t3-r1",
            labelVi: "Đã bỏ thức khuya và tập thể dục đều",
            textVi: "Mình hạn chế thức khuya rồi, giờ sau khi tan làm mình ghé phòng tập ba buổi một tuần rồi ngủ trước mười một giờ.",
            textEn: "I've cut back on staying up late — now after work I hit the gym three times a week and sleep before eleven.",
            keywords: ["thức khuya", "tan làm", "phòng tập", "ngủ trước"],
            npcReactionVi: "Kỷ luật quá luôn! Nhìn sắc mặt cậu hôm nay cũng tươi tắn hơn hẳn hồi trước.",
            nextTurnId: "routine-t4",
            scoreBonus: 15,
          },
          {
            id: "routine-t3-r2",
            labelVi: "Đang cố duy trì thói quen chạy bộ",
            textVi: "Cũng đang cố gắng cậu ạ, mình duy trì thói quen chạy bộ buổi sáng để nạp lại năng lượng cho cả ngày.",
            textEn: "I'm working on it — I've been keeping up a morning jogging habit to recharge for the whole day.",
            keywords: ["duy trì thói quen", "chạy bộ", "nạp lại năng lượng"],
            npcReactionVi: "Cứ giữ đều được vậy vài tháng là sức khỏe khác biệt rõ rệt ngay.",
            nextTurnId: "routine-t4",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "routine-t4",
        npcTextVi:
          "Chủ nhật này cậu đã có kế hoạch gì chưa? Hay mình đi đạp xe quanh hồ buổi sáng rồi ăn phở xong uống cà phê nạp lại năng lượng?",
        npcEn:
          "Do you have any plans this Sunday yet? Want to bike around the lake in the morning, grab pho, then get coffee to recharge?",
        mood: "enthusiastic",
        hintsVi: [
          "Chốt hẹn tự nhiên bằng «Nghe tuyệt quá!» hoặc đề xuất khung giờ cụ thể.",
        ],
        expectedResponses: [
          {
            id: "routine-t4-r1",
            labelVi: "Đồng ý ngay và chốt giờ gặp",
            textVi: "Nghe quá hợp lý luôn! Vậy sáng Chủ nhật bảy giờ mình gặp nhau đầu đường ven hồ nhé, vừa mát vừa đỡ đông.",
            textEn: "Sounds ideal! Let's meet at 7 a.m. Sunday at the lakeside entrance — cool weather and less crowded.",
            keywords: ["hợp lý", "sáng Chủ nhật", "bảy giờ", "gặp nhau"],
            npcReactionVi: "Chốt kèo nhé! Tối thứ Bảy mình nhắn nhắc cậu kẻo lại ngủ quên.",
            nextTurnId: null,
            scoreBonus: 15,
          },
          {
            id: "routine-t4-r2",
            labelVi: "Hẹn muộn hơn một chút vào giữa buổi sáng",
            textVi: "Ý hay đấy, nhưng sáng Chủ nhật mình muốn ngủ bù một chút, mình hẹn tám giờ rưỡi đi cà phê rồi ăn trưa luôn được không?",
            textEn: "Great idea, though on Sunday morning I'd like to sleep in a bit — can we meet at 8:30 for coffee and early lunch?",
            keywords: ["ngủ bù", "tám giờ rưỡi", "cà phê", "ăn trưa"],
            npcReactionVi: "Quá ổn luôn, cuối tuần cứ thong thả mà nghỉ ngơi. Hẹn cậu tám giờ rưỡi Chủ nhật nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 4. WEATHER — Adjusting Weekend Travel Plans for Vietnamese Weather
  // =========================================================================
  {
    id: "dlg-weather-1",
    topicId: "weather",
    titleVi: "Bàn chuyện thời tiết và đổi kế hoạch cuối tuần",
    settingVi: "Gọi điện thoại với người bạn ở Hà Nội trước chuyến đi chơi ngoại thành.",
    partnerName: "Thu Hà",
    partnerRole: "Bạn đồng hành chuyến đi cuối tuần",
    goalVi: "Mô tả thời tiết giao mùa / độ ẩm, hỏi dự báo, chọn trang phục và điều chỉnh kế hoạch linh hoạt.",
    openingLineVi:
      "Alo cậu ơi! Cậu có thấy mấy hôm nay thời tiết đổi nhanh quá không? Tuần trước còn oi bức mà sáng nay ra đường đã thấy khác hẳn rồi.",
    turns: [
      {
        id: "weather-t1",
        npcTextVi:
          "Alo cậu ơi! Cậu có thấy mấy hôm nay thời tiết đổi nhanh quá không? Tuần trước còn oi bức mà sáng nay ra đường đã thấy khác hẳn rồi.",
        npcEn:
          "Hey! Have you noticed how fast the weather shifted these past few days? Last week it was still sweltering, yet stepping out this morning felt totally different.",
        mood: "chatty",
        hintsVi: [
          "Dùng tính từ «giao mùa», «se lạnh», «nồm ẩm», «râm mát».",
        ],
        expectedResponses: [
          {
            id: "weather-t1-r1",
            labelVi: "Nhận xét sáng se lạnh, trưa hửng nắng",
            textVi: "Đúng thật, đang đợt giao mùa nên sáng sớm hơi se lạnh nhưng đến trưa lại hửng nắng và khá dễ chịu.",
            textEn: "So true — it's seasonal transition, so early morning is mildly chilly yet by noon the sun breaks out and it feels quite pleasant.",
            keywords: ["giao mùa", "se lạnh", "hửng nắng", "dễ chịu"],
            npcReactionVi: "Trời kiểu này dễ chịu thật, nhưng ai yếu cổ họng là dễ cảm cúm lắm đấy.",
            nextTurnId: "weather-t2",
            scoreBonus: 15,
          },
          {
            id: "weather-t1-r2",
            labelVi: "Nhắc độ ẩm cao / trời chuyển râm mát",
            textVi: "Công nhận trời trở trời nhanh thật, may là hôm nay râm mát chứ không còn oi bức hay nồm ẩm như mấy hôm trước.",
            textEn: "The weather really turned fast — luckily today is overcast and cool instead of sweltering or clammy like a few days ago.",
            keywords: ["trở trời", "râm mát", "oi bức", "nồm ẩm"],
            npcReactionVi: "Ừ, trời râm mát đi ngoài đường đỡ mệt hơn hẳn.",
            nextTurnId: "weather-t2",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "weather-t2",
        npcTextVi:
          "Cậu đã xem dự báo thời tiết cho thứ Bảy này chưa? Mình hơi lo đang đi dã ngoại mà gặp mưa rào bất chợt thì bất tiện lắm.",
        npcEn:
          "Have you checked the weather forecast for this Saturday? I'm a bit worried a sudden downpour during our picnic would be inconvenient.",
        mood: "concerned",
        hintsVi: [
          "Dùng «dự báo thời tiết bảo...» và nói rõ khả năng mưa nắng.",
        ],
        expectedResponses: [
          {
            id: "weather-t2-r1",
            labelVi: "Báo dự báo buổi sáng râm mát, chiều có thể mưa",
            textVi: "Mình vừa xem dự báo thời tiết xong: buổi sáng râm mát không mưa, nhưng chiều muộn có khả năng mưa rào bất chợt.",
            textEn: "I just checked the forecast: the morning will be overcast and dry, though late afternoon might bring sudden showers.",
            keywords: ["dự báo thời tiết", "râm mát", "chiều", "mưa rào bất chợt"],
            npcReactionVi: "Ồ thế thì vẫn ổn nếu mình xuất phát sớm hơn dự định một tiếng nhỉ!",
            nextTurnId: "weather-t3",
            scoreBonus: 15,
          },
          {
            id: "weather-t2-r2",
            labelVi: "Đề xuất dời lịch nếu mưa to",
            textVi: "Dự báo bảo chiều thứ Bảy dễ có mưa lớn, nên nếu sáng dậy thấy mây đen quá thì mình dời sang tuần sau cho an toàn.",
            textEn: "The forecast says Saturday afternoon could see heavy rain, so if it's heavily overcast when we wake up, let's postpone to next week to be safe.",
            keywords: ["dự báo", "mưa lớn", "dời sang", "tuần sau", "an toàn"],
            npcReactionVi: "Nhất trí luôn, đi chơi phải thoải mái chứ dính mưa ướt hết thì mất vui.",
            nextTurnId: "weather-t3",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "weather-t3",
        npcTextVi:
          "Nếu sáng thứ Bảy mình vẫn đi sớm, theo cậu nên chuẩn bị trang phục và đồ dùng gì cho hợp thời tiết này?",
        npcEn:
          "If we still head out early Saturday morning, what clothes and gear do you think we should pack for this weather?",
        mood: "practical",
        hintsVi: [
          "Dùng cấu trúc «Nhớ mang theo ... kẻo ...».",
        ],
        expectedResponses: [
          {
            id: "weather-t3-r1",
            labelVi: "Nhắc mang áo khoác mỏng và áo mưa",
            textVi: "Cậu nhớ mang theo một chiếc áo khoác mỏng kẻo sáng sớm se lạnh, và nhét sẵn áo mưa gọn trong ba lô nhé.",
            textEn: "Remember to bring a light jacket in case early morning feels chilly, and tuck a compact raincoat in your backpack.",
            keywords: ["mang theo", "áo khoác mỏng", "kẻo", "se lạnh", "áo mưa"],
            npcReactionVi: "Cẩn thận thế là chuẩn nhất rồi! Mình sẽ mang thêm đôi giày chống nước nữa.",
            nextTurnId: "weather-t4",
            scoreBonus: 15,
          },
          {
            id: "weather-t3-r2",
            labelVi: "Nhắc mang ô và kem chống nắng",
            textVi: "Trời giao mùa thất thường lắm, mình mang theo cả ô nhỏ lẫn kem chống nắng kẻo trưa lại hửng nắng gắt.",
            textEn: "Transitional weather is unpredictable — let's bring both a small umbrella and sunscreen in case noon turns fiercely sunny.",
            keywords: ["giao mùa", "ô", "kem chống nắng", "kẻo", "hửng nắng"],
            npcReactionVi: "Chuẩn luôn, trưa mùa này nắng cũng rát phết đấy!",
            nextTurnId: "weather-t4",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "weather-t4",
        npcTextVi:
          "Còn nếu chiều bất ngờ đổ mưa thì mình có phương án dự phòng trong nhà nào gần đó không cậu?",
        npcEn:
          "And if it unexpectedly pours in the afternoon, do we have an indoor backup plan nearby?",
        mood: "upbeat",
        hintsVi: [
          "Gợi ý quán cà phê / bảo tàng / nhà hàng gần đó bằng «Nếu mưa thì mình ghé...».",
        ],
        expectedResponses: [
          {
            id: "weather-t4-r1",
            labelVi: "Ghé quán cà phê nhìn ra hồ trú mưa",
            textVi: "Nếu chiều đổ mưa thì mình ghé quán cà phê gỗ nhìn ra hồ gần đó trú mưa, uống trà nóng và ăn nhẹ cũng rất chill.",
            textEn: "If it pours in the afternoon, we can duck into that wooden lakeside cafe to shelter, drink hot tea, and snack — super chill too.",
            keywords: ["đổ mưa", "ghé", "quán cà phê", "trú mưa", "trà nóng"],
            npcReactionVi: "Nghe thôi đã thấy thư giãn rồi! Thế chốt sáng thứ Bảy nhé, tối thứ Sáu mình xem lại dự báo lần nữa.",
            nextTurnId: null,
            scoreBonus: 15,
          },
          {
            id: "weather-t4-r2",
            labelVi: "Chuyển sang thăm bảo tàng và ăn tối sớm",
            textVi: "Mình có thể chạy qua bảo tàng gần trung tâm tham quan rồi đi ăn lẩu nóng, trời mưa lạnh ăn lẩu là hợp nhất.",
            textEn: "We can swing by the museum near downtown and then get hotpot — hotpot is unbeatable on a rainy chilly evening.",
            keywords: ["bảo tàng", "ăn lẩu", "trời mưa", "hợp nhất"],
            npcReactionVi: "Ý tưởng ăn lẩu trời mưa quá đỉnh luôn! Chốt lịch thứ Bảy cậu nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 5. EMOTIONS — Checking In on a Stressed Friend
  // =========================================================================
  {
    id: "dlg-emotions-1",
    topicId: "emotions",
    titleVi: "Hỏi thăm và động viên bạn thân đang căng thẳng",
    settingVi: "Ngồi trò chuyện buổi tối ở một quán trà yên tĩnh với người bạn thân vừa trải qua tuần làm việc áp lực.",
    partnerName: "Hoàng Nam",
    partnerRole: "Bạn thân lâu năm",
    goalVi: "Hỏi thăm tinh tế, bày tỏ sự đồng cảm, an ủi đúng mực và gợi ý cách nghỉ ngơi hồi phục.",
    openingLineVi:
      "Cảm ơn cậu đã ra ngồi với mình tối nay. Thật ra cả tuần vừa rồi mình thấy bức bối và gần như kiệt sức vì dự án ở công ty cứ trục trặc liên tục.",
    turns: [
      {
        id: "emotions-t1",
        npcTextVi:
          "Cảm ơn cậu đã ra ngồi với mình tối nay. Thật ra cả tuần vừa rồi mình thấy bức bối và gần như kiệt sức vì dự án ở công ty cứ trục trặc liên tục.",
        npcEn:
          "Thanks for coming out to sit with me tonight. Honestly, this whole past week I've felt frustrated and nearly burned out because our project at work kept hitting snags.",
        mood: "tired",
        hintsVi: [
          "Thể hiện sự đồng cảm trước bằng «Nghe cậu kể mình thật sự đồng cảm...».",
          "Đừng vội phán xét; hãy hỏi han nhẹ nhàng để bạn chia sẻ thêm.",
        ],
        expectedResponses: [
          {
            id: "emotions-t1-r1",
            labelVi: "Đồng cảm chân thành và lắng nghe",
            textVi: "Nghe cậu nói vậy mình thật sự đồng cảm, ai rơi vào cảnh dồn áp lực suốt cả tuần cũng kiệt sức thôi. Chuyện cụ thể có chỗ nào làm cậu nặng đầu nhất?",
            textEn: "Hearing you say that, I really empathize — anyone under nonstop pressure all week would burn out. What part is weighing on you most?",
            keywords: ["đồng cảm", "áp lực", "kiệt sức", "nặng đầu"],
            npcReactionVi: "Khách hàng đổi yêu cầu sát hạn chót mà nhóm mình lại thiếu người nên mình cứ phải gánh thêm suốt.",
            nextTurnId: "emotions-t2",
            scoreBonus: 15,
          },
          {
            id: "emotions-t1-r2",
            labelVi: "An ủi dịu dàng và cho bạn không gian tâm sự",
            textVi: "Tội nghiệp cậu quá, làm căng thẳng thế thảo nào trông cậu hơi mệt. Cậu cứ kể thoải mái đi, mình ngồi nghe cùng cậu.",
            textEn: "I feel for you — no wonder you look tired after such a stressful week. Go ahead and vent freely, I'm here to listen.",
            keywords: ["căng thẳng", "mệt", "kể thoải mái", "nghe"],
            npcReactionVi: "Có người chịu nghe mình xả ra như này thấy đỡ bí bách hơn hẳn rồi cậu ạ.",
            nextTurnId: "emotions-t2",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "emotions-t2",
        npcTextVi:
          "Lúc chiều mình còn hơi chạnh lòng vì cố gắng tăng ca bao nhiêu mà sếp chỉ nhắc đúng một lỗi nhỏ trong báo cáo. Mình thấy nản quá.",
        npcEn:
          "This afternoon I also felt a bit hurt because despite all my overtime, my manager only pointed out one tiny error in the report. I feel so discouraged.",
        mood: "down",
        hintsVi: [
          "Công nhận cảm xúc «chạnh lòng» là hoàn toàn bình thường.",
          "Khuyên bạn giữ «bình tĩnh» và đừng phủ nhận công sức của chính mình.",
        ],
        expectedResponses: [
          {
            id: "emotions-t2-r1",
            labelVi: "Công nhận cảm xúc và nhắc bạn ghi nhận nỗ lực",
            textVi: "Bị nhắc ngay lúc đang mệt thì ai cũng chạnh lòng cả. Nhưng cậu bình tĩnh nhìn lại nhé, cả tuần cậu đã gánh bao nhiêu phần khó rồi, một lỗi nhỏ không phủ nhận nỗ lực của cậu đâu.",
            textEn: "Getting called out while exhausted would make anyone feel hurt. Still, stay calm and step back — you carried so much heavy lifting this week; one small error doesn't erase your effort.",
            keywords: ["chạnh lòng", "bình tĩnh", "nỗ lực", "lỗi nhỏ"],
            npcReactionVi: "Ừ nhỉ, lúc đang căng thẳng quá mình toàn phóng đại chuyện tiêu cực lên.",
            nextTurnId: "emotions-t3",
            scoreBonus: 15,
          },
          {
            id: "emotions-t2-r2",
            labelVi: "Khuyên trao đổi lại rõ ràng khi đã nguôi",
            textVi: "Mình hiểu cảm giác nản lúc đó. Hay đợi đầu tuần sau bình tĩnh lại, cậu nói chuyện thẳng thắn với sếp về khối lượng việc của nhóm?",
            textEn: "I get how discouraging that felt. Once things cool down early next week, maybe have a candid talk with your manager about the team's workload?",
            keywords: ["hiểu", "bình tĩnh", "nói chuyện thẳng thắn", "khối lượng việc"],
            npcReactionVi: "Đúng đấy, mình không thể cứ im lặng ôm hết việc mãi được.",
            nextTurnId: "emotions-t3",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "emotions-t3",
        npcTextVi:
          "Thật ra tối nay mình vẫn đang tự dằn vặt xem có nên về mở máy tính làm tiếp cho xong hẳn không nữa.",
        npcEn:
          "Actually tonight I'm still torn about whether I should go home, open my laptop, and keep working to finish it completely.",
        mood: "anxious",
        hintsVi: [
          "Dùng cấu trúc «Đừng tự tạo áp lực quá nhé, cứ ... cho ... đã».",
        ],
        expectedResponses: [
          {
            id: "emotions-t3-r1",
            labelVi: "Khuyên tắt máy nghỉ ngơi trước đã",
            textVi: "Đừng tự tạo áp lực quá nhé! Cậu cứ tắt máy nghỉ ngơi một tối cho đầu óc thư thả đã, ngủ đủ giấc mai xử lý còn nhanh hơn nhiều.",
            textEn: "Don't put too much pressure on yourself! Just shut the laptop and rest tonight to let your mind unwind first — with proper sleep you'll handle it way faster tomorrow.",
            keywords: ["đừng tự tạo áp lực", "cứ", "nghỉ ngơi", "thư thả", "đã"],
            npcReactionVi: "Nghe cậu nói hợp lý thật, đầu óc lúc này cũng chẳng còn minh mẫn nữa. Tối nay mình quyết tâm không đụng vào máy tính!",
            nextTurnId: "emotions-t4",
            scoreBonus: 15,
          },
          {
            id: "emotions-t3-r2",
            labelVi: "Gợi ý ghi nhanh 3 việc rồi nghỉ",
            textVi: "Nếu còn sốt ruột thì cậu chỉ ghi nhanh ba việc cần làm sáng mai ra giấy thôi, rồi cứ nghỉ sớm cho lại sức đã.",
            textEn: "If you're still restless, just jot down three priorities for tomorrow morning on paper, then rest early to recover your strength first.",
            keywords: ["sáng mai", "cứ nghỉ sớm", "lại sức", "đã"],
            npcReactionVi: "Cách đó giúp mình đỡ lo quên việc mà vẫn được nghỉ ngơi trọn vẹn. Cảm ơn cậu nhiều nhé!",
            nextTurnId: "emotions-t4",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "emotions-t4",
        npcTextVi:
          "Ngồi tâm sự với cậu xong tự nhiên mình thấy nhẹ nhõm hẳn cả người. Sang tuần xong dự án này chắc mình xin nghỉ phép hai ngày đi biển cho khuây khỏa.",
        npcEn:
          "After talking with you I naturally feel so much lighter. Once this project wraps next week I'll probably take two days off to go to the beach and clear my head.",
        mood: "relieved",
        hintsVi: [
          "Ủng hộ kế hoạch nghỉ phép và bày tỏ niềm vui khi bạn đã nhẹ nhõm hơn.",
        ],
        expectedResponses: [
          {
            id: "emotions-t4-r1",
            labelVi: "Ủng hộ hết mình chuyến đi nghỉ phép",
            textVi: "Nghe cậu thấy nhẹ nhõm hơn mình cũng vui lây! Cậu rất xứng đáng có hai ngày đi biển để nạp lại năng lượng đấy.",
            textEn: "Hearing you feel lighter makes me happy too! You totally deserve two days by the beach to recharge.",
            keywords: ["nhẹ nhõm", "vui", "xứng đáng", "nạp lại năng lượng"],
            npcReactionVi: "Cảm ơn cậu vì luôn là chỗ dựa tinh thần tin cậy của mình. Về thôi kẻo khuya nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
          {
            id: "emotions-t4-r2",
            labelVi: "Chúc bạn giữ tinh thần thoải mái",
            textVi: "Tuyệt quá, nghe cậu hào hứng với kế hoạch đi biển là mình yên tâm rồi. Có gì căng thẳng cứ nhắn mình bất cứ lúc nào nhé!",
            textEn: "Awesome — hearing you excited about the beach plan puts me at ease. Whenever things get stressful, text me anytime!",
            keywords: ["hào hứng", "yên tâm", "nhắn mình", "bất cứ lúc nào"],
            npcReactionVi: "Nhất định rồi! Cảm ơn cậu nhiều lắm nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 6. OPINIONS — Discussing Remote Work vs Office & City vs Countryside
  // =========================================================================
  {
    id: "dlg-opinions-1",
    topicId: "opinions",
    titleVi: "Thảo luận quan điểm: Làm việc từ xa hay lên văn phòng?",
    settingVi: "Buổi cà phê thảo luận cởi mở cùng đồng nghiệp trước khi công ty lấy ý kiến về chính sách làm việc năm mới.",
    partnerName: "Anh Hoàng",
    partnerRole: "Đồng nghiệp nhóm kỹ thuật",
    goalVi: "Trình bày quan điểm rõ ràng bằng «theo tôi thì...», phân tích hai chiều với «một mặt / mặt khác» và phản biện lịch sự bằng «tuy nhiên».",
    openingLineVi:
      "Công ty sắp khảo sát ý kiến về chính sách làm việc năm tới đấy. Theo bạn thì làm việc từ xa hoàn toàn có hiệu quả hơn lên văn phòng mỗi ngày không?",
    turns: [
      {
        id: "opinions-t1",
        npcTextVi:
          "Công ty sắp khảo sát ý kiến về chính sách làm việc năm tới đấy. Theo bạn thì làm việc từ xa hoàn toàn có hiệu quả hơn lên văn phòng mỗi ngày không?",
        npcEn:
          "The company is about to survey everyone on next year's work policy. In your view, is working fully remotely more effective than coming into the office every day?",
        mood: "thoughtful",
        hintsVi: [
          "Mở đầu bằng «Theo tôi thì...» hoặc «Theo quan điểm của mình...».",
          "Nêu rõ bạn nghiêng về mô hình nào (từ xa, văn phòng hay kết hợp).",
        ],
        expectedResponses: [
          {
            id: "opinions-t1-r1",
            labelVi: "Ủng hộ mô hình làm việc kết hợp (hybrid)",
            textVi: "Theo tôi thì mô hình làm việc kết hợp mang lại hiệu quả tốt nhất, vì vừa giữ được sự linh hoạt vừa không mất kết nối đồng nghiệp.",
            textEn: "In my view, a hybrid model brings the best results, as it keeps flexibility without losing colleague connection.",
            keywords: ["theo tôi thì", "làm việc kết hợp", "hiệu quả", "linh hoạt", "kết nối"],
            npcReactionVi: "Góc nhìn rất cân bằng! Cá nhân mình cũng đang nghiêng về phương án kết hợp.",
            nextTurnId: "opinions-t2",
            scoreBonus: 15,
          },
          {
            id: "opinions-t1-r2",
            labelVi: "Ủng hộ làm việc từ xa là chính",
            textVi: "Theo quan điểm của mình, làm việc từ xa giúp tiết kiệm thời gian đi lại và tập trung sâu hơn nhiều so với văn phòng ồn ào.",
            textEn: "From my perspective, remote work saves commuting time and allows much deeper focus than a noisy office.",
            keywords: ["quan điểm", "làm việc từ xa", "tiết kiệm", "tập trung"],
            npcReactionVi: "Đúng là khoản đỡ mất gần hai tiếng tắc đường mỗi ngày rất thuyết phục thật.",
            nextTurnId: "opinions-t2",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "opinions-t2",
        npcTextVi:
          "Nhưng có vài quản lý lo ngại rằng nếu làm ở nhà nhiều quá, mọi người sẽ khó phối hợp nhanh và nhân sự mới khó hòa nhập. Bạn nghĩ sao về bất cập đó?",
        npcEn:
          "However, some managers worry that if people work from home too much, quick coordination gets harder and new hires struggle to integrate. What do you think of that drawback?",
        mood: "analytical",
        hintsVi: [
          "Dùng «Tôi đồng tình một phần... tuy nhiên...» hoặc «Một mặt ..., mặt khác ...».",
        ],
        expectedResponses: [
          {
            id: "opinions-t2-r1",
            labelVi: "Công nhận bất cập và đề xuất cân bằng",
            textVi: "Mình đồng tình rằng đó là một bất cập có thật; tuy nhiên, mình có thể quy định hai ngày cố định cả nhóm cùng lên công ty để họp và hỗ trợ nhau.",
            textEn: "I agree that's a real shortcoming; however, we can set two fixed days for the whole team to come in together to meet and support each other.",
            keywords: ["đồng tình", "bất cập", "tuy nhiên", "cố định", "hỗ trợ"],
            npcReactionVi: "Cách đó giải quyết được cả hai bài toán luôn, nghe rất thuyết phục!",
            nextTurnId: "opinions-t3",
            scoreBonus: 15,
          },
          {
            id: "opinions-t2-r2",
            labelVi: "Phân tích hai mặt của việc làm tại nhà",
            textVi: "Một mặt làm từ xa rất chủ động, mặt khác đúng là dễ khiến ranh giới công việc và nghỉ ngơi bị mờ đi nếu không có quy tắc rõ ràng.",
            textEn: "On one hand remote work gives autonomy; on the other hand it really does blur the work-rest boundary without clear guidelines.",
            keywords: ["một mặt", "chủ động", "mặt khác", "ranh giới", "quy tắc"],
            npcReactionVi: "Chuẩn luôn, ở nhà mà cứ nhắn tin công việc lúc chín giờ tối thì còn mệt hơn lên văn phòng.",
            nextTurnId: "opinions-t3",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "opinions-t3",
        npcTextVi:
          "Nói mở rộng thêm chút nhé: nếu được làm từ xa hoàn toàn, bạn có nghĩ đến chuyện rời thành phố lớn về quê hay ra thành phố biển sống không?",
        npcEn:
          "Expanding a bit: if you could work fully remotely, would you consider leaving the big city for the countryside or a coastal town?",
        mood: "curious",
        hintsVi: [
          "Dùng «cân nhắc», «tuy nhiên», «chi phí sinh hoạt», «cơ hội».",
        ],
        expectedResponses: [
          {
            id: "opinions-t3-r1",
            labelVi: "Thích trải nghiệm nhưng vẫn cân nhắc dịch vụ đô thị",
            textVi: "Mình cũng thấy ý tưởng đó rất đáng cân nhắc vì chi phí thấp và yên bình; tuy nhiên, thành phố lớn vẫn có nhiều cơ hội giao lưu và dịch vụ y tế tốt hơn.",
            textEn: "I think that idea is definitely worth considering for the lower cost and peace; however, big cities still offer better networking and healthcare services.",
            keywords: ["cân nhắc", "chi phí", "tuy nhiên", "thành phố lớn", "dịch vụ"],
            npcReactionVi: "Mình hoàn toàn đồng tình, nhất là khi có gia đình thì chuyện trường học và bệnh viện rất quan trọng.",
            nextTurnId: "opinions-t4",
            scoreBonus: 15,
          },
          {
            id: "opinions-t3-r2",
            labelVi: "Muốn thử sống ở thành phố biển vài tháng mỗi năm",
            textVi: "Theo tôi thì ở hẳn thì hơi khó, nhưng sống ở thành phố biển vài tháng mỗi năm để đổi gió và nâng cao chất lượng sống là lựa chọn rất tuyệt.",
            textEn: "In my view moving permanently is tough, yet living in a coastal city a few months a year for a change of pace and better quality of life is a great option.",
            keywords: ["theo tôi thì", "thành phố biển", "vài tháng", "chất lượng sống"],
            npcReactionVi: "Mô hình vừa làm việc vừa đổi không gian theo mùa nghe hấp dẫn quá!",
            nextTurnId: "opinions-t4",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "opinions-t4",
        npcTextVi:
          "Vậy trong bản khảo sát sắp tới của công ty, bạn sẽ chốt đề xuất thế nào để ban lãnh đạo dễ đồng tình nhất?",
        npcEn:
          "So in the company's upcoming survey, how will you frame your proposal so leadership is most likely to agree?",
        mood: "engaged",
        hintsVi: [
          "Tóm lược đề xuất ngắn gọn bằng «Nói chung là...» hoặc «Mình sẽ đề xuất...».",
        ],
        expectedResponses: [
          {
            id: "opinions-t4-r1",
            labelVi: "Đề xuất thử nghiệm 3 ngày văn phòng – 2 ngày từ xa",
            textVi: "Mình sẽ đề xuất thử nghiệm ba ngày lên văn phòng và hai ngày làm việc từ xa trong một quý, rồi đánh giá hiệu quả bằng kết quả công việc cụ thể.",
            textEn: "I'll propose piloting three office days and two remote days for one quarter, then evaluating effectiveness with concrete work outcomes.",
            keywords: ["đề xuất", "thử nghiệm", "làm việc từ xa", "đánh giá", "hiệu quả"],
            npcReactionVi: "Lập luận kèm giai đoạn thử nghiệm và tiêu chí đo lường rõ ràng vậy thì quá thuyết phục rồi. Cảm ơn cuộc trò chuyện thú vị hôm nay nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
          {
            id: "opinions-t4-r2",
            labelVi: "Đề xuất linh hoạt theo đặc thù từng nhóm",
            textVi: "Nói chung là còn tùy vào tính chất từng nhóm, nên mình sẽ kiến nghị công ty cho phép mỗi trưởng nhóm chủ động cân nhắc lịch phù hợp nhất.",
            textEn: "Overall it depends on each team's nature, so I'll recommend letting each team lead proactively weigh the best-fitting schedule.",
            keywords: ["nói chung là", "tùy vào", "chủ động", "cân nhắc"],
            npcReactionVi: "Ý kiến rất thực tế và tôn trọng đặc thù công việc của mọi người. Hẹn bạn trong buổi góp ý tuần tới nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
        ],
      },
    ],
  },
];
