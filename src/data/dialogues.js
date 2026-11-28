/**
 * 18 Interactive Multi-Turn Branching Roleplay Dialogues (3 per topic, 4 turns each = 72 turns).
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

  {
    id: "dlg-self-2",
    topicId: "self",
    titleVi: "Phỏng vấn trao đổi kinh nghiệm cho vị trí mới",
    settingVi: "Buổi phỏng vấn vòng hai thân thiện tại phòng họp một công ty công nghệ ở Hà Nội.",
    partnerName: "Anh Tuấn Minh",
    partnerRole: "Trưởng nhóm sản phẩm",
    goalVi: "Tự tin giới thiệu kinh nghiệm làm việc, chia sẻ dự án tiêu biểu, điểm mạnh phối hợp và đặt câu hỏi sắc sảo.",
    openingLineVi:
      "Chào bạn, cảm ơn bạn đã dành thời gian đến buổi trao đổi hôm nay. Bạn có thể giới thiệu ngắn gọn về hành trình nghề nghiệp của mình trước đây không?",
    turns: [
      {
        id: "self2-t1",
        npcTextVi:
          "Chào bạn, cảm ơn bạn đã dành thời gian đến buổi trao đổi hôm nay. Bạn có thể giới thiệu ngắn gọn về hành trình nghề nghiệp của mình trước đây không?",
        npcEn:
          "Hello, thank you for taking the time to meet today. Could you briefly walk me through your career background so far?",
        mood: "professional",
        hintsVi: [
          "Dùng mẫu: «Em có ... năm kinh nghiệm ...» hoặc «Em xuất thân từ ngành ...».",
          "Kết nối nền tảng của bạn với lý do quan tâm đến công ty.",
        ],
        expectedResponses: [
          {
            id: "self2-t1-r1",
            labelVi: "Chia sẻ bốn năm kinh nghiệm và sự quan tâm tới sản phẩm",
            textVi: "Chào anh Minh ạ! Em có bốn năm kinh nghiệm điều phối dự án phần mềm và rất ấn tượng với định hướng sản phẩm của công ty mình.",
            textEn: "Hello Minh! I have four years of experience coordinating software projects and am really impressed with your company's product direction.",
            keywords: ["chào anh", "bốn năm kinh nghiệm", "điều phối dự án", "định hướng", "sản phẩm"],
            npcReactionVi: "Cảm ơn em, kinh nghiệm làm sản phẩm phần mềm của em rất sát với nhu cầu nhóm anh lúc này.",
            nextTurnId: "self2-t2",
            scoreBonus: 15,
          },
          {
            id: "self2-t1-r2",
            labelVi: "Giới thiệu nền tảng truyền thông và hướng chuyển sang vận hành",
            textVi: "Chào anh ạ, em xuất thân từ ngành truyền thông nhưng hai năm gần đây đã chuyển sang quản lý vận hành để bám sát khách hàng hơn.",
            textEn: "Hello! I come from a communications background, though over the past two years I transitioned into operations management to work closer to customers.",
            keywords: ["xuất thân", "truyền thông", "chuyển sang", "quản lý vận hành", "khách hàng"],
            npcReactionVi: "Nền tảng truyền thông kết hợp vận hành là lợi thế rất lớn khi làm việc cùng nhiều bộ phận đấy.",
            nextTurnId: "self2-t2",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "self2-t2",
        npcTextVi:
          "Trong những công việc trước đó, dự án hoặc thành quả nào khiến bạn cảm thấy tự hào nhất và học được nhiều bài học nhất?",
        npcEn:
          "In your previous roles, which project or achievement are you proudest of and learned the most from?",
        mood: "curious",
        hintsVi: [
          "Dùng «Em tự hào nhất là...» kèm kết quả cụ thể như «rút ngắn thời gian», «giảm sai sót».",
          "Nêu ngắn gọn bài học kinh nghiệm bạn rút ra sau dự án.",
        ],
        expectedResponses: [
          {
            id: "self2-t2-r1",
            labelVi: "Kể về lần cải tiến quy trình bàn giao cho khách hàng",
            textVi: "Em tự hào nhất là lần cải tiến quy trình bàn giao cho khách hàng, giúp nhóm rút ngắn thời gian xử lý và giảm hẳn sai sót.",
            textEn: "I'm proudest of streamlining our client handover workflow, which helped the team cut turnaround time and noticeably reduce errors.",
            keywords: ["tự hào", "cải tiến", "quy trình", "rút ngắn", "sai sót"],
            npcReactionVi: "Nhìn ra nút thắt quy trình và đo được kết quả rõ ràng như vậy là điều anh rất đánh giá cao.",
            nextTurnId: "self2-t3",
            scoreBonus: 15,
          },
          {
            id: "self2-t2-r2",
            labelVi: "Chia sẻ trải nghiệm điều phối đợt ra mắt ứng dụng gấp rút",
            textVi: "Năm ngoái em phụ trách điều phối đợt ra mắt ứng dụng mới trong hai tháng gấp rút, qua đó em học cách giữ bình tĩnh dưới áp lực.",
            textEn: "Last year I coordinated a new app launch on a tight two-month timeline, which taught me how to stay calm under pressure.",
            keywords: ["phụ trách", "ra mắt", "ứng dụng mới", "bình tĩnh", "áp lực"],
            npcReactionVi: "Ra mắt đúng hẹn trong hai tháng không hề đơn giản, chắc chắn em đã tích lũy được nhiều bản lĩnh thực chiến.",
            nextTurnId: "self2-t3",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "self2-t3",
        npcTextVi:
          "Vị trí này cần làm việc chặt chẽ với cả nhóm kỹ thuật lẫn chăm sóc khách hàng. Theo bạn, điểm mạnh lớn nhất của bạn khi phối hợp liên phòng ban là gì?",
        npcEn:
          "This role works closely with both engineering and customer support. What would you say is your biggest strength in cross-functional collaboration?",
        mood: "analytical",
        hintsVi: [
          "Dùng «Điểm mạnh của em là...» hoặc «Em khá chủ động...».",
          "Nhấn mạnh cách bạn giảm hiểu nhầm hoặc xử lý vướng mắc giữa các nhóm.",
        ],
        expectedResponses: [
          {
            id: "self2-t3-r1",
            labelVi: "Nhấn mạnh khả năng lắng nghe và tóm tắt rõ ràng",
            textVi: "Điểm mạnh của em là biết lắng nghe nhu cầu từng bên rồi tóm tắt rõ ràng, nhờ vậy các nhóm ít hiểu nhầm và thống nhất nhanh hơn.",
            textEn: "My strength is listening to each side's needs and summarizing clearly, so teams have fewer misunderstandings and align faster.",
            keywords: ["điểm mạnh", "lắng nghe", "nhu cầu", "tóm tắt", "thống nhất"],
            npcReactionVi: "Rất chuẩn, nhiều khi vướng mắc giữa kỹ thuật và khách hàng chỉ cần một người truyền đạt rõ ràng là thông suốt ngay.",
            nextTurnId: "self2-t4",
            scoreBonus: 15,
          },
          {
            id: "self2-t3-r2",
            labelVi: "Nhấn mạnh tính chủ động cập nhật tiến độ và dự phòng rủi ro",
            textVi: "Em khá chủ động cập nhật tiến độ mỗi tuần và luôn chuẩn bị sẵn phương án dự phòng mỗi khi phát sinh vướng mắc giữa các nhóm.",
            textEn: "I proactively share weekly progress updates and always prepare a backup plan whenever bottlenecks arise between teams.",
            keywords: ["chủ động", "cập nhật tiến độ", "chuẩn bị", "phương án dự phòng", "vướng mắc"],
            npcReactionVi: "Phong cách minh bạch và có kế hoạch dự phòng như vậy rất hợp với tốc độ vận hành của nhóm anh.",
            nextTurnId: "self2-t4",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "self2-t4",
        npcTextVi:
          "Cảm ơn phần chia sẻ rất rõ ràng của bạn. Trước khi kết thúc, bạn có câu hỏi nào về văn hóa làm việc hay lộ trình phát triển ở đây không?",
        npcEn:
          "Thank you for sharing so clearly. Before we wrap up, do you have any questions about our work culture or growth path here?",
        mood: "warm",
        hintsVi: [
          "Đặt câu hỏi cụ thể về kỳ vọng trong ba tháng đầu hoặc cơ hội đào tạo.",
          "Kết câu bằng «ạ» để giữ sắc thái lịch sự, chuyên nghiệp.",
        ],
        expectedResponses: [
          {
            id: "self2-t4-r1",
            labelVi: "Hỏi về kỳ vọng quan trọng nhất trong ba tháng đầu",
            textVi: "Dạ có ạ, anh có thể chia sẻ thêm mục tiêu quan trọng nhất mà nhóm kỳ vọng ở vị trí này trong ba tháng đầu không ạ?",
            textEn: "Yes, could you share the most important goal the team expects from this role during the first three months?",
            keywords: ["chia sẻ", "mục tiêu", "kỳ vọng", "vị trí", "ba tháng đầu"],
            npcReactionVi: "Câu hỏi rất thực tế! Trong ba tháng đầu nhóm kỳ vọng em nắm vững quy trình sản phẩm và chủ trì một đợt cải tiến nhỏ. Bộ phận nhân sự sẽ phản hồi kết quả sớm nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
          {
            id: "self2-t4-r2",
            labelVi: "Hỏi về cách đánh giá hiệu quả và đào tạo nội bộ",
            textVi: "Em muốn hỏi thêm về cách nhóm mình đánh giá hiệu quả công việc và các cơ hội đào tạo nội bộ dành cho nhân sự mới ạ.",
            textEn: "I'd like to ask more about how the team evaluates performance and what internal training opportunities exist for new hires.",
            keywords: ["đánh giá", "hiệu quả", "cơ hội", "đào tạo nội bộ", "nhân sự mới"],
            npcReactionVi: "Bên anh đánh giá theo mục tiêu từng quý và có buổi chia sẻ chuyên môn mỗi tháng. Cảm ơn em đã đến trao đổi hôm nay nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
        ],
      },
    ],
  },

  {
    id: "dlg-self-3",
    topicId: "self",
    titleVi: "Làm quen tại câu lạc bộ đọc sách cuối tuần",
    settingVi: "Không gian cà phê sách yên tĩnh ở quận Cầu Giấy vào sáng Chủ nhật, trước buổi thảo luận sách hàng tháng.",
    partnerName: "Ngọc Linh",
    partnerRole: "Điều phối viên câu lạc bộ đọc sách",
    goalVi: "Bắt chuyện thân thiện với thành viên mới, chia sẻ thể loại sách yêu thích, sở thích cuối tuần và kết nối nhóm.",
    openingLineVi:
      "Chào bạn, trông bạn hơi lạ mặt, hôm nay là lần đầu bạn tham gia câu lạc bộ đọc sách bên mình đúng không? Bạn biết đến nhóm qua đâu thế?",
    turns: [
      {
        id: "self3-t1",
        npcTextVi:
          "Chào bạn, trông bạn hơi lạ mặt, hôm nay là lần đầu bạn tham gia câu lạc bộ đọc sách bên mình đúng không? Bạn biết đến nhóm qua đâu thế?",
        npcEn:
          "Hi! You look like a new face — is today your first time joining our book club? How did you hear about the group?",
        mood: "welcoming",
        hintsVi: [
          "Xác nhận lần đầu tham gia và nêu ngắn nguồn bạn biết đến câu lạc bộ.",
          "Thêm mục đích tham gia như «vừa đọc sách vừa giao lưu» hoặc «tạo động lực».",
        ],
        expectedResponses: [
          {
            id: "self3-t1-r1",
            labelVi: "Kể được đồng nghiệp giới thiệu để đọc sách và giao lưu",
            textVi: "Chào bạn! Đúng rồi, hôm nay mình mới đi buổi đầu tiên. Một người bạn đồng nghiệp giới thiệu nên mình đăng ký để vừa đọc sách vừa giao lưu.",
            textEn: "Hi! Yes, today is my very first session. A colleague recommended it, so I signed up to both read and socialize.",
            keywords: ["buổi đầu tiên", "đồng nghiệp", "giới thiệu", "đọc sách", "giao lưu"],
            npcReactionVi: "Ồ thích quá, mấy thành viên mới gần đây cũng toàn được bạn bè rủ sang chơi đấy!",
            nextTurnId: "self3-t2",
            scoreBonus: 15,
          },
          {
            id: "self3-t1-r2",
            labelVi: "Tình cờ thấy lịch nhóm trên mạng và muốn đọc đều đặn hơn",
            textVi: "Chào bạn, mình tình cờ thấy lịch sinh hoạt của nhóm trên mạng nên ghé thử để có thêm động lực đọc sách đều đặn hơn.",
            textEn: "Hi, I came across the group's schedule online and dropped by for extra motivation to read more consistently.",
            keywords: ["tình cờ", "lịch sinh hoạt", "động lực", "đọc sách", "đều đặn"],
            npcReactionVi: "Có lịch thảo luận hằng tháng đúng là giúp mọi người đọc hết sách nhanh hơn hẳn luôn!",
            nextTurnId: "self3-t2",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "self3-t2",
        npcTextVi:
          "Hoan nghênh bạn đến với nhóm nhé! Thường ngày bạn hay đọc thể loại sách nào nhất, và gần đây có cuốn nào để lại ấn tượng sâu sắc không?",
        npcEn:
          "Welcome to the club! What book genres do you usually read, and has anything left a strong impression on you recently?",
        mood: "curious",
        hintsVi: [
          "Dùng «Mình hay đọc...» hoặc «Mình mê thể loại...».",
          "Nêu tên một chủ đề hoặc cảm nhận ngắn về cuốn sách mới đọc.",
        ],
        expectedResponses: [
          {
            id: "self3-t2-r1",
            labelVi: "Chia sẻ gu sách tâm lý học và tản văn",
            textVi: "Mình hay đọc sách tâm lý học và tản văn nhẹ nhàng. Gần đây mình mới đọc xong một cuốn về thói quen tập trung thấy rất thực tế.",
            textEn: "I usually read psychology books and light essays. Recently I finished a book on focus habits that felt very practical.",
            keywords: ["tâm lý học", "tản văn", "thói quen", "tập trung", "thực tế"],
            npcReactionVi: "Trong nhóm cũng có mấy bạn mê mảng tâm lý lắm, lát nữa thảo luận chắc hợp cạ nhau ngay!",
            nextTurnId: "self3-t3",
            scoreBonus: 15,
          },
          {
            id: "self3-t2-r2",
            labelVi: "Thích tiểu thuyết trinh thám và lịch sử văn hóa",
            textVi: "Mình mê tiểu thuyết trinh thám và sách lịch sử văn hóa, vì mỗi cuốn đều giúp mình nhìn cuộc sống dưới góc độ mới mẻ hơn.",
            textEn: "I love detective novels and cultural history books, since each one helps me see life from a fresh perspective.",
            keywords: ["tiểu thuyết", "trinh thám", "lịch sử", "văn hóa", "góc độ mới mẻ"],
            npcReactionVi: "Gu đọc đa dạng quá, tụi mình cũng đang định chọn một cuốn lịch sử văn hóa cho tháng tới đấy.",
            nextTurnId: "self3-t3",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "self3-t3",
        npcTextVi:
          "Gu đọc của bạn thú vị thật đấy! Ngoài đọc sách ra, cuối tuần bạn còn theo đuổi sở thích hay hoạt động cộng đồng nào khác không?",
        npcEn:
          "Your reading taste is really interesting! Besides reading, do you pursue any other hobbies or community activities on weekends?",
        mood: "friendly",
        hintsVi: [
          "Dùng «Ngoài đọc sách, cuối tuần mình thích...».",
          "Kể một đến hai hoạt động thực tế giúp cuộc trò chuyện cởi mở hơn.",
        ],
        expectedResponses: [
          {
            id: "self3-t3-r1",
            labelVi: "Đi bộ quanh hồ chụp ảnh và ghé triển lãm nghệ thuật",
            textVi: "Ngoài đọc sách, cuối tuần mình thích đi bộ quanh hồ chụp ảnh đời thường và thỉnh thoảng ghé các buổi triển lãm nghệ thuật nhỏ.",
            textEn: "Besides reading, on weekends I enjoy walking around the lake taking candid photos and occasionally visiting small art exhibitions.",
            keywords: ["cuối tuần", "đi bộ", "chụp ảnh", "triển lãm", "nghệ thuật"],
            npcReactionVi: "Nghe thư thái thật đấy! Câu lạc bộ mình thỉnh thoảng cũng rủ nhau đi triển lãm rồi về viết cảm nhận.",
            nextTurnId: "self3-t4",
            scoreBonus: 15,
          },
          {
            id: "self3-t3-r2",
            labelVi: "Tập làm bánh tại nhà và tự học ngoại ngữ",
            textVi: "Mình hay dành sáng cuối tuần để tập làm bánh tại nhà, còn buổi chiều thì tự học ngoại ngữ ở quán cà phê quen gần nhà.",
            textEn: "I usually spend weekend mornings baking at home, and afternoons studying foreign languages at a favorite neighborhood cafe.",
            keywords: ["cuối tuần", "làm bánh", "tự học", "ngoại ngữ", "quán cà phê"],
            npcReactionVi: "Cuối tuần của bạn vừa năng suất vừa dễ thương quá! Hôm nào nhớ chia sẻ công thức bánh với nhóm nhé.",
            nextTurnId: "self3-t4",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "self3-t4",
        npcTextVi:
          "Buổi thảo luận sắp bắt đầu rồi. Để mình mời bạn vào nhóm trò chuyện chung để tháng sau tụi mình cùng bình chọn cuốn sách tiếp theo nhé?",
        npcEn:
          "The discussion is about to start. Let me add you to our group chat so we can vote on next month's book together, okay?",
        mood: "enthusiastic",
        hintsVi: [
          "Cảm ơn người điều phối và bày tỏ sự hào hứng khi tham gia nhóm.",
          "Có thể hẹn đóng góp đề xuất sách cho buổi tới.",
        ],
        expectedResponses: [
          {
            id: "self3-t4-r1",
            labelVi: "Vui vẻ vào nhóm và muốn đề xuất sách tháng tới",
            textVi: "Cảm ơn Linh nhiều nhé! Bạn cho mình vào nhóm với, tháng tới mình rất muốn đề xuất một cuốn sách hay để mọi người cùng đọc.",
            textEn: "Thanks so much, Linh! Please add me to the group — next month I'd love to suggest a great book for everyone to read.",
            keywords: ["cảm ơn", "vào nhóm", "tháng tới", "đề xuất", "cuốn sách"],
            npcReactionVi: "Rất hoan nghênh đề xuất của bạn! Mình vừa gửi lời mời rồi đấy, mời bạn ngồi gần bàn giữa để bắt đầu nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
          {
            id: "self3-t4-r2",
            labelVi: "Cảm ơn sự đón tiếp nhiệt tình và hẹn đi đều đặn",
            textVi: "Tuyệt quá, cảm ơn bạn đã đón tiếp rất nhiệt tình! Mình nhất định sẽ tham gia đều đặn và làm quen thêm với mọi người trong nhóm.",
            textEn: "Awesome, thank you for such a warm welcome! I'll definitely join regularly and get to know everyone in the group.",
            keywords: ["đón tiếp", "nhiệt tình", "tham gia", "đều đặn", "làm quen"],
            npcReactionVi: "Rất vui được có bạn đồng hành! Chúc bạn có buổi thảo luận đầu tiên thật nhiều cảm hứng nhé!",
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

  {
    id: "dlg-food-2",
    topicId: "food",
    titleVi: "Đặt bàn tiệc nhóm & yêu cầu món chay, ít cay",
    settingVi: "Gọi điện thoại đặt bàn trước cho buổi liên hoan tám người tại một nhà hàng Việt Nam vào tối thứ Sáu.",
    partnerName: "Chị Phương Thảo",
    partnerRole: "Quản lý nhà hàng",
    goalVi: "Đặt bàn đúng giờ và số người, yêu cầu khu vực yên tĩnh, sắp xếp thực đơn có món chay và dặn dò khẩu vị.",
    openingLineVi:
      "Nhà hàng Bếp Việt xin nghe ạ! Em là Phương Thảo, anh chị cần đặt bàn cho bao nhiêu người và vào khung giờ nào để bên em sắp xếp ạ?",
    turns: [
      {
        id: "food2-t1",
        npcTextVi:
          "Nhà hàng Bếp Việt xin nghe ạ! Em là Phương Thảo, anh chị cần đặt bàn cho bao nhiêu người và vào khung giờ nào để bên em sắp xếp ạ?",
        npcEn:
          "Bep Viet Restaurant speaking! I'm Phuong Thao — how many guests are you booking for and at what time so we can arrange your table?",
        mood: "welcoming",
        hintsVi: [
          "Nêu rõ số người, ngày giờ bằng «mình muốn đặt một bàn cho ... người vào ...».",
          "Hỏi thêm về khu vực yên tĩnh hoặc chỗ gửi xe nếu đi nhóm đông.",
        ],
        expectedResponses: [
          {
            id: "food2-t1-r1",
            labelVi: "Đặt bàn tám người tối thứ Sáu ở góc yên tĩnh",
            textVi: "Chào chị Thảo, mình muốn đặt một bàn cho tám người vào bảy giờ tối thứ Sáu này. Nhà hàng còn phòng riêng hoặc góc nào yên tĩnh không ạ?",
            textEn: "Hi Thao, I'd like to book a table for eight at 7 p.m. this Friday. Do you still have a private room or a quiet corner available?",
            keywords: ["đặt một bàn", "tám người", "bảy giờ tối", "phòng riêng", "yên tĩnh"],
            npcReactionVi: "Dạ để em kiểm tra sơ đồ bàn cho nhóm tám người tối thứ Sáu ngay đây ạ!",
            nextTurnId: "food2-t2",
            scoreBonus: 15,
          },
          {
            id: "food2-t1-r2",
            labelVi: "Đặt bàn tám người và hỏi chỗ gửi xe ô tô",
            textVi: "Chào chị, cho mình đặt bàn tám người lúc bảy giờ tối thứ Sáu nhé. Quán mình có chỗ gửi xe ô tô thuận tiện ngay gần đó không ạ?",
            textEn: "Hello, please book a table for eight at 7 p.m. this Friday. Is there convenient car parking right nearby?",
            keywords: ["đặt bàn", "tám người", "thứ Sáu", "chỗ gửi xe", "thuận tiện"],
            npcReactionVi: "Dạ trước cửa quán có bãi gửi xe rộng rãi và có nhân viên trông giữ miễn phí ạ!",
            nextTurnId: "food2-t2",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "food2-t2",
        npcTextVi:
          "Dạ tối thứ Sáu bên em vẫn còn khu vực ban công thoáng mát và yên tĩnh cho tám người ạ. Anh chị có muốn đặt trước vài món để đỡ phải chờ lâu không?",
        npcEn:
          "Yes, this Friday evening we still have a breezy, quiet balcony area for eight. Would you like to pre-order a few dishes so you won't have to wait long?",
        mood: "attentive",
        hintsVi: [
          "Đặt trước một hai món chính và báo nhóm có người ăn chay.",
          "Nhờ quản lý gợi ý thêm món chay thanh đạm đi kèm.",
        ],
        expectedResponses: [
          {
            id: "food2-t2-r1",
            labelVi: "Đặt trước món chính và xin gợi ý thêm ba món chay",
            textVi: "Hay quá, mình đặt trước món gà nướng lá chanh và lẩu riêu cua nhé. Nhóm mình có hai bạn ăn chay nên chị gợi ý thêm ba món chay giúp mình.",
            textEn: "Great, let's pre-order grilled chicken with lime leaves and crab hotpot. Two people in our group are vegetarian, so please suggest three vegetarian dishes too.",
            keywords: ["đặt trước", "gà nướng", "lẩu riêu cua", "ăn chay", "món chay"],
            npcReactionVi: "Dạ hai món đó lên cùng nhau rất hợp tiệc nhóm, để em chọn ngay ba món chay ngon nhất của bếp nhé!",
            nextTurnId: "food2-t3",
            scoreBonus: 15,
          },
          {
            id: "food2-t2-r2",
            labelVi: "Nhờ tư vấn thực đơn kết hợp cả món mặn lẫn món chay",
            textVi: "Vậy chị giúp mình lên một thực đơn gọn gồm cả món mặn truyền thống lẫn vài món chay thanh đạm để cả nhóm đều ăn thoải mái nhé.",
            textEn: "Then please help us put together a balanced menu with both traditional savory dishes and a few light vegetarian options so everyone can eat comfortably.",
            keywords: ["thực đơn", "món mặn", "truyền thống", "món chay", "thanh đạm"],
            npcReactionVi: "Dạ để em ghép thực đơn hài hòa giữa món mặn truyền thống và món chay cho nhóm mình ngay ạ!",
            nextTurnId: "food2-t3",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "food2-t3",
        npcTextVi:
          "Bên em có gỏi ngó sen chay, nấm kho tiêu và canh nấm hạt sen rất hợp vị. Về gia vị, nhóm mình có ai kiêng cay hay dị ứng gì không ạ?",
        npcEn:
          "We have vegetarian lotus-stem salad, pepper-braised mushrooms, and lotus-seed mushroom soup that pair wonderfully. As for seasoning, does anyone avoid spice or have allergies?",
        mood: "practical",
        hintsVi: [
          "Dùng «Nhờ bếp nấu ít cay...» hoặc «tách riêng đậu phộng / giảm ớt».",
          "Nêu rõ lý do dị ứng hoặc khẩu vị của khách đi cùng để bếp lưu ý kỹ.",
        ],
        expectedResponses: [
          {
            id: "food2-t3-r1",
            labelVi: "Chốt ba món chay và dặn ít cay, tách riêng đậu phộng",
            textVi: "Ba món chay nghe hấp dẫn quá, chị đặt hết giúp mình nhé. Nhờ bếp nấu ít cay và tách riêng đậu phộng vì có một bạn bị dị ứng.",
            textEn: "Those three vegetarian dishes sound delicious — please order all of them. Ask the kitchen to make them mild and keep peanuts separate since someone has an allergy.",
            keywords: ["món chay", "hấp dẫn", "ít cay", "đậu phộng", "dị ứng"],
            npcReactionVi: "Dạ em ghi chú đỏ phần dị ứng đậu phộng và nấu ít cay để bếp làm thật cẩn thận ạ.",
            nextTurnId: "food2-t4",
            scoreBonus: 15,
          },
          {
            id: "food2-t3-r2",
            labelVi: "Dặn nêm vừa phải, giảm ớt và không dùng mắm tôm",
            textVi: "Mấy món đó ổn lắm ạ! Nhờ nhà hàng nêm nếm vị vừa phải, giảm ớt và đừng dùng mắm tôm trong các món chung vì có khách nước ngoài.",
            textEn: "Those dishes sound great! Please keep the seasoning moderate, reduce chili, and skip shrimp paste in shared dishes since we have international guests.",
            keywords: ["nêm nếm", "vừa phải", "giảm ớt", "mắm tôm", "khách nước ngoài"],
            npcReactionVi: "Dạ quá tinh tế luôn ạ, bếp bên em sẽ giữ hương vị hài hòa để khách nước ngoài cũng ăn rất ngon miệng.",
            nextTurnId: "food2-t4",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "food2-t4",
        npcTextVi:
          "Dạ em đã ghi chú đầy đủ yêu cầu của anh chị rồi ạ. Anh chị cần chuẩn bị thêm trà nóng hay xuất hóa đơn công ty sau bữa tiệc không ạ?",
        npcEn:
          "I've noted all your requests carefully. Would you also like us to prepare hot tea or issue a company invoice after the dinner?",
        mood: "cheerful",
        hintsVi: [
          "Xác nhận đồ uống đi kèm và nhu cầu xuất hóa đơn rõ ràng.",
          "Chốt lại lịch hẹn kèm lời cảm ơn lịch sự.",
        ],
        expectedResponses: [
          {
            id: "food2-t4-r1",
            labelVi: "Đặt sẵn trà sen nóng và yêu cầu xuất hóa đơn công ty",
            textVi: "Chị chuẩn bị sẵn hai bình trà sen nóng và hỗ trợ xuất hóa đơn công ty giúp mình nhé. Cảm ơn chị đã tư vấn rất chu đáo ạ!",
            textEn: "Please prepare two pots of hot lotus tea and help us issue a company invoice. Thank you for the thoughtful assistance!",
            keywords: ["trà sen nóng", "hóa đơn công ty", "cảm ơn", "tư vấn", "chu đáo"],
            npcReactionVi: "Dạ em xác nhận bàn tám người lúc bảy giờ tối thứ Sáu ạ. Rất hân hạnh được đón tiếp anh chị!",
            nextTurnId: null,
            scoreBonus: 15,
          },
          {
            id: "food2-t4-r2",
            labelVi: "Chọn nước lọc, trà đá và hẹn ghé đúng giờ",
            textVi: "Bên mình chỉ cần nước lọc và trà đá là đủ rồi ạ, không cần hóa đơn. Cảm ơn chị Thảo nhiều, tối thứ Sáu nhóm mình sẽ ghé đúng giờ nhé!",
            textEn: "Bottled water and iced tea will be plenty, and no invoice needed. Thank you so much, Thao — our group will arrive on time Friday evening!",
            keywords: ["nước lọc", "trà đá", "không cần hóa đơn", "tối thứ Sáu", "đúng giờ"],
            npcReactionVi: "Dạ cảm ơn anh chị đã tin tưởng đặt bàn, hẹn gặp nhóm mình tối thứ Sáu ạ!",
            nextTurnId: null,
            scoreBonus: 15,
          },
        ],
      },
    ],
  },

  {
    id: "dlg-food-3",
    topicId: "food",
    titleVi: "Khám phá ẩm thực phố cổ cùng bạn bản xứ",
    settingVi: "Đi dạo khu phố cổ Hà Nội vào cuối chiều cùng người bạn bản xứ để thử các món đặc sản địa phương.",
    partnerName: "Đức Anh",
    partnerRole: "Bạn bản xứ am hiểu ẩm thực Hà Nội",
    goalVi: "Chọn đặc sản đường phố, lắng nghe cách ăn đúng điệu, miêu tả hương vị tự nhiên và chọn món tráng miệng.",
    openingLineVi:
      "Cuối tuần đi dạo phố cổ mà không thử đồ ăn vỉa hè thì phí lắm! Chiều nay cậu muốn ăn bún thang nóng hổi hay thử bún chả nướng thơm lừng?",
    turns: [
      {
        id: "food3-t1",
        npcTextVi:
          "Cuối tuần đi dạo phố cổ mà không thử đồ ăn vỉa hè thì phí lắm! Chiều nay cậu muốn ăn bún thang nóng hổi hay thử bún chả nướng thơm lừng?",
        npcEn:
          "Strolling through the Old Quarter on the weekend without trying street food would be such a waste! This afternoon do you want steaming bun thang or fragrant grilled bun cha?",
        mood: "enthusiastic",
        hintsVi: [
          "Chọn một món cụ thể và nói lý do hợp thời tiết hoặc sở thích.",
          "Nhờ bạn dẫn tới «quán quen» mà người địa phương hay ăn.",
        ],
        expectedResponses: [
          {
            id: "food3-t1-r1",
            labelVi: "Chọn bún chả nướng ở quán quen người bản xứ",
            textVi: "Nghe mùi than nướng dọc phố là mình đói bụng luôn rồi! Cậu dẫn mình đi ăn bún chả ở quán quen nào người bản xứ hay ngồi nhé.",
            textEn: "Smelling the charcoal grill along the street already makes me hungry! Take me to a local favorite spot for bun cha.",
            keywords: ["đói bụng", "bún chả", "quán quen", "người bản xứ"],
            npcReactionVi: "Chuẩn luôn, rẽ ngay con ngõ phía trước có quán bún chả gia truyền nướng than hoa cực thơm!",
            nextTurnId: "food3-t2",
            scoreBonus: 15,
          },
          {
            id: "food3-t1-r2",
            labelVi: "Chọn bún thang nóng hổi vì trời chiều hơi mát",
            textVi: "Hôm nay trời hơi mát nên mình muốn thử bún thang nóng hổi xem nước dùng có thanh và thơm vị nấm hương như lời đồn không.",
            textEn: "It's a bit cool today so I'd love to try steaming bun thang and see if the broth is as light and fragrant with shiitake as people say.",
            keywords: ["trời hơi mát", "bún thang", "nước dùng", "thanh", "nấm hương"],
            npcReactionVi: "Cậu chọn tinh tế lắm, chiều mát mà húp bát bún thang nóng với mùi nấm hương thì hết sảy!",
            nextTurnId: "food3-t2",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "food3-t2",
        npcTextVi:
          "Quán này đông nhưng phục vụ nhanh lắm, đồ ăn vừa ra rồi đây. Cậu nhớ thêm chút tỏi ngâm giấm và rau thơm cho cân vị, ăn thử miếng đầu thấy thế nào?",
        npcEn:
          "This place is crowded but super fast — here's our food already. Remember to add pickled garlic and fresh herbs to balance the flavor; how's the first bite?",
        mood: "cheerful",
        hintsVi: [
          "Miêu tả cụ thể kết cấu và vị như «chua ngọt hài hòa», «vừa miệng», «không hề bị ngấy».",
          "Bày tỏ sự thích thú tự nhiên như khi trò chuyện cùng bạn thân.",
        ],
        expectedResponses: [
          {
            id: "food3-t2-r1",
            labelVi: "Khen thịt nướng thơm, nước chấm hài hòa và không ngấy",
            textVi: "Ôi ngon bất ngờ luôn cậu ạ! Thịt nướng cháy cạnh rất thơm, nước chấm chua ngọt hài hòa mà ăn kèm rau thơm nên không hề bị ngấy.",
            textEn: "Oh, it's unexpectedly delicious! The charred grilled pork is so fragrant, the sweet-and-sour dipping sauce is well balanced, and the herbs keep it from feeling greasy.",
            keywords: ["ngon bất ngờ", "thịt nướng", "nước chấm", "rau thơm", "không hề bị ngấy"],
            npcReactionVi: "Đấy, mình đã bảo mà! Ở đây họ pha nước chấm ấm vừa tay nên ăn mãi không chán.",
            nextTurnId: "food3-t3",
            scoreBonus: 15,
          },
          {
            id: "food3-t2-r2",
            labelVi: "Khen hương vị đậm đà và muốn lưu lại địa chỉ",
            textVi: "Rất vừa miệng luôn cậu ơi, hương vị đậm đà khác hẳn mấy quán mình từng ăn trước đây, chắc chắn phải ghi lại địa chỉ này.",
            textEn: "It hits the spot! The flavor is so much richer than other places I've tried — I definitely have to save this address.",
            keywords: ["vừa miệng", "hương vị", "đậm đà", "ghi lại", "địa chỉ"],
            npcReactionVi: "Lưu ngay đi nhé, lần sau có bạn bè từ xa ghé chơi cậu cứ dẫn thẳng tới đây là ghi điểm tuyệt đối!",
            nextTurnId: "food3-t3",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "food3-t3",
        npcTextVi:
          "Thấy cậu ăn ngon miệng là mình mừng rồi! Ăn xong bát này cậu còn đủ bụng đi bộ sang phố bên cạnh thử chè sen hoặc cà phê trứng không?",
        npcEn:
          "I'm so glad you're enjoying it! After finishing this bowl, do you still have room to walk to the next street for lotus-seed dessert or egg coffee?",
        mood: "playful",
        hintsVi: [
          "Dùng cụm tự nhiên như «chừa bụng cho đồ tráng miệng» hoặc «sợ uống cà phê khó ngủ».",
          "Chốt lựa chọn kèm khẩu vị như «ít đường», «thanh mát».",
        ],
        expectedResponses: [
          {
            id: "food3-t3-r1",
            labelVi: "Hào hứng thử cà phê trứng phố cổ nổi tiếng",
            textVi: "Lúc nào mình cũng chừa bụng cho đồ tráng miệng mà! Mình nghe danh cà phê trứng phố cổ lâu lắm rồi, nay nhất định phải thử một ly.",
            textEn: "I always save room for dessert! I've heard about Old Quarter egg coffee for ages, so I definitely have to try a cup today.",
            keywords: ["chừa bụng", "tráng miệng", "cà phê trứng", "phố cổ", "nhất định"],
            npcReactionVi: "Đi luôn! Quán nằm trong con ngõ nhỏ cổ kính, lớp kem trứng đánh bông béo mịn mê lắm.",
            nextTurnId: "food3-t4",
            scoreBonus: 15,
          },
          {
            id: "food3-t3-r2",
            labelVi: "Chọn chè hạt sen long nhãn ít đường cho thanh mát",
            textVi: "Tối rồi mình sợ uống cà phê khó ngủ, hay tụi mình đi ăn một cốc chè hạt sen long nhãn ít đường cho thanh mát cậu nhé.",
            textEn: "It's getting late and I'm worried coffee will keep me awake — how about a cup of lightly sweetened lotus-seed longan dessert to refresh?",
            keywords: ["khó ngủ", "chè hạt sen", "long nhãn", "ít đường", "thanh mát"],
            npcReactionVi: "Hợp lý quá, chè sen long nhãn ở phố cổ nấu ngọt dịu và thơm thoang thoảng hoa nhài, ăn xong dễ chịu lắm!",
            nextTurnId: "food3-t4",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "food3-t4",
        npcTextVi:
          "Vừa ăn ngon vừa ngắm phố cổ lên đèn đúng là trải nghiệm khó quên nhỉ. Hôm nào rảnh cậu có muốn đi thêm một vòng đồ ăn sáng Hà Nội không?",
        npcEn:
          "Eating well while watching the Old Quarter light up is truly unforgettable, right? Next time you're free, want to do a Hanoi breakfast food tour too?",
        mood: "warm",
        hintsVi: [
          "Bày tỏ sự hào hứng với lời hẹn tiếp theo và kể tên món ăn sáng bạn muốn thử.",
          "Cảm ơn người bạn bản xứ đã dẫn đi khám phá.",
        ],
        expectedResponses: [
          {
            id: "food3-t4-r1",
            labelVi: "Hẹn cuối tuần tới dậy sớm thử phở bò và xôi xéo",
            textVi: "Chắc chắn rồi cậu ơi! Cuối tuần tới tụi mình dậy sớm đi thử phở bò với xôi xéo nhé, cảm ơn cậu đã làm hướng dẫn viên tận tâm hôm nay.",
            textEn: "Count me in! Next weekend let's wake up early to try beef pho and sticky rice with mung bean — thanks for being such a dedicated guide today.",
            keywords: ["cuối tuần tới", "dậy sớm", "phở bò", "xôi xéo", "hướng dẫn viên"],
            npcReactionVi: "Chốt luôn! Sáng cuối tuần mình đón cậu từ bảy giờ, bảo đảm có thêm cả tá quán ngon nữa.",
            nextTurnId: null,
            scoreBonus: 15,
          },
          {
            id: "food3-t4-r2",
            labelVi: "Cảm ơn bạn và hẹn lần tới mời lại bữa cơm nhà",
            textVi: "Cảm ơn cậu nhiều vì buổi tối quá tuyệt vời! Lần tới để mình mời lại cậu một bữa cơm nhà hoặc lẩu hải sản cho đổi vị nhé.",
            textEn: "Thank you so much for such a wonderful evening! Next time let me treat you back to a home-style meal or seafood hotpot for a change.",
            keywords: ["cảm ơn", "tuyệt vời", "mời lại", "cơm nhà", "đổi vị"],
            npcReactionVi: "Nghe hấp dẫn quá, mình nhận lời ngay! Giờ tụi mình đi bộ thêm một đoạn cho tiêu cơm rồi về nhé.",
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

  {
    id: "dlg-routine-2",
    topicId: "routine",
    titleVi: "Sắp xếp lịch làm việc kết hợp cùng quản lý",
    settingVi: "Buổi trao đổi ngắn sáng thứ Hai với quản lý trực tiếp về lịch làm việc kết hợp và giờ họp nhóm trong tháng mới.",
    partnerName: "Chị Lan Hương",
    partnerRole: "Trưởng bộ phận vận hành",
    goalVi: "Đề xuất ngày lên văn phòng hợp lý, bảo vệ khung giờ tập trung, cam kết liên lạc và thống nhất lịch rà soát.",
    openingLineVi:
      "Chào em, sang tháng mới nhóm mình áp dụng lịch làm việc kết hợp ba ngày ở văn phòng và hai ngày tại nhà. Em dự định chọn những ngày nào lên công ty?",
    turns: [
      {
        id: "routine2-t1",
        npcTextVi:
          "Chào em, sang tháng mới nhóm mình áp dụng lịch làm việc kết hợp ba ngày ở văn phòng và hai ngày tại nhà. Em dự định chọn những ngày nào lên công ty?",
        npcEn:
          "Hi, starting next month our team is adopting a hybrid schedule with three office days and two remote days. Which days do you plan to come into the office?",
        mood: "practical",
        hintsVi: [
          "Nêu cụ thể các thứ trong tuần và giải thích ngắn lý do chọn lịch đó.",
          "Dùng «để tiện họp đầu tuần» hoặc «để tập trung hoàn thiện báo cáo».",
        ],
        expectedResponses: [
          {
            id: "routine2-t1-r1",
            labelVi: "Đăng ký thứ Hai, thứ Tư, thứ Năm để tiện họp và phối hợp",
            textVi: "Chào chị Hương ạ! Em muốn đăng ký lên văn phòng vào thứ Hai, thứ Tư và thứ Năm để tiện họp đầu tuần và phối hợp trực tiếp với nhóm.",
            textEn: "Hi Huong! I'd like to come into the office on Monday, Wednesday, and Thursday to join kickoff meetings and collaborate directly with the team.",
            keywords: ["lên văn phòng", "thứ Hai", "thứ Tư", "thứ Năm", "phối hợp"],
            npcReactionVi: "Cách chia xen kẽ thế này rất hợp lý, các buổi họp chính của phòng mình cũng rơi vào mấy ngày đó.",
            nextTurnId: "routine2-t2",
            scoreBonus: 15,
          },
          {
            id: "routine2-t1-r2",
            labelVi: "Chọn ba ngày đầu tuần lên công ty và hai ngày cuối tuần làm ở nhà",
            textVi: "Dạ em dự định lên công ty từ thứ Hai đến thứ Tư, còn thứ Năm và thứ Sáu làm ở nhà để tập trung hoàn thiện báo cáo tuần ạ.",
            textEn: "I plan to come into the office Monday through Wednesday, and work from home Thursday and Friday to focus on finishing weekly reports.",
            keywords: ["lên công ty", "thứ Hai", "làm ở nhà", "tập trung", "báo cáo tuần"],
            npcReactionVi: "Dồn phần phối hợp vào đầu tuần rồi cuối tuần tập trung viết báo cáo cũng rất khoa học đấy em.",
            nextTurnId: "routine2-t2",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "routine2-t2",
        npcTextVi:
          "Lịch đó khá hợp lý với nhịp chung của phòng mình. Những ngày làm tại nhà, khung giờ nào em tập trung cao độ nhất để chị hạn chế đặt họp xen ngang?",
        npcEn:
          "That fits our department's rhythm well. On your work-from-home days, which time block is your peak focus period so I can avoid scheduling meetings in the middle of it?",
        mood: "attentive",
        hintsVi: [
          "Nêu khung giờ cụ thể bằng «từ ... đến ...» và đề xuất gom họp sang buổi còn lại.",
          "Hoặc nói bạn sẽ đánh dấu khung giờ tập trung lên lịch chung.",
        ],
        expectedResponses: [
          {
            id: "routine2-t2-r1",
            labelVi: "Giữ buổi sáng làm việc sâu và gom họp sang đầu giờ chiều",
            textVi: "Dạ buổi sáng từ chín giờ đến mười một giờ rưỡi em làm việc hiệu quả nhất, nên mình gom các buổi họp sang đầu giờ chiều chị nhé.",
            textEn: "Mornings from 9:00 to 11:30 are when I work most effectively, so let's group meetings into the early afternoon if possible.",
            keywords: ["buổi sáng", "chín giờ", "hiệu quả nhất", "buổi họp", "đầu giờ chiều"],
            npcReactionVi: "Được em, chị sẽ ưu tiên đặt các buổi họp trực tuyến sau một giờ rưỡi chiều để em giữ mạch làm việc.",
            nextTurnId: "routine2-t3",
            scoreBonus: 15,
          },
          {
            id: "routine2-t2-r2",
            labelVi: "Đánh dấu hai tiếng tập trung trên lịch chung mỗi sáng",
            textVi: "Em sẽ đánh dấu sẵn hai tiếng tập trung mỗi sáng trên lịch chung, còn khung giờ khác em luôn sẵn sàng trao đổi nhanh qua tin nhắn hoặc gọi trực tuyến ạ.",
            textEn: "I'll block two focus hours each morning on the shared calendar, and during other hours I'm always available for quick chats or video calls.",
            keywords: ["đánh dấu", "lịch chung", "sẵn sàng", "trao đổi nhanh", "gọi trực tuyến"],
            npcReactionVi: "Ghi rõ lên lịch chung như vậy mọi người nhìn vào là biết ngay khi nào nên nhắn, rất chuyên nghiệp!",
            nextTurnId: "routine2-t3",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "routine2-t3",
        npcTextVi:
          "Chị rất ủng hộ việc giữ khoảng thời gian tập trung như vậy. Tuy nhiên, mỗi khi có việc gấp với khách hàng, em dự tính giữ liên lạc và bàn giao tiến độ ra sao?",
        npcEn:
          "I strongly support protecting focus time like that. However, whenever urgent client issues come up, how do you plan to stay reachable and share progress updates?",
        mood: "thoughtful",
        hintsVi: [
          "Trấn an quản lý bằng thói quen cập nhật tiến độ cố định cuối ngày.",
          "Thể hiện sự linh hoạt sẵn sàng đổi ngày lên văn phòng khi có việc khẩn.",
        ],
        expectedResponses: [
          {
            id: "routine2-t3-r1",
            labelVi: "Mở kênh liên lạc giờ hành chính và báo cáo tiến độ lúc năm giờ",
            textVi: "Những ngày làm ở nhà em vẫn mở kênh liên lạc liên tục trong giờ hành chính và gửi bản cập nhật tiến độ ngắn trước năm giờ chiều ạ.",
            textEn: "On remote days I'll stay reachable throughout business hours and send a brief progress update before 5 p.m. each day.",
            keywords: ["kênh liên lạc", "giờ hành chính", "cập nhật tiến độ", "năm giờ chiều"],
            npcReactionVi: "Có bản tóm tắt cuối ngày như vậy chị nắm tình hình rất nhanh mà không cần hỏi lại nhiều lần.",
            nextTurnId: "routine2-t4",
            scoreBonus: 15,
          },
          {
            id: "routine2-t3-r2",
            labelVi: "Linh hoạt đổi ngày lên công ty khi có cuộc họp khẩn",
            textVi: "Nếu có cuộc họp khẩn với khách hàng, em hoàn toàn có thể đổi ngày linh hoạt để lên công ty xử lý cùng mọi người ngay chị ạ.",
            textEn: "If there's an urgent client meeting, I can easily swap days and come into the office to handle it together with everyone right away.",
            keywords: ["cuộc họp khẩn", "khách hàng", "đổi ngày", "linh hoạt", "xử lý"],
            npcReactionVi: "Tinh thần linh hoạt đó chị đánh giá rất cao, như vậy cả nhóm yên tâm vận hành trơn tru rồi.",
            nextTurnId: "routine2-t4",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "routine2-t4",
        npcTextVi:
          "Nghe rõ ràng và chủ động lắm rồi! Cuối tháng chị em mình sẽ ngồi rà soát lại xem lịch mới có giúp em cân bằng hơn không nhé.",
        npcEn:
          "That sounds very clear and proactive! At the end of the month, let's check back in to see whether the new schedule helps your work-life balance.",
        mood: "warm",
        hintsVi: [
          "Cảm ơn quản lý đã tạo điều kiện linh hoạt và xác nhận hành động tiếp theo.",
          "Giữ giọng điệu tích cực, đáng tin cậy khi chốt cuộc trao đổi.",
        ],
        expectedResponses: [
          {
            id: "routine2-t4-r1",
            labelVi: "Cảm ơn chị và cập nhật ngay lịch lên bảng chung",
            textVi: "Em cảm ơn chị đã tạo điều kiện rất linh hoạt ạ! Em sẽ cập nhật lịch lên bảng chung ngay sáng nay và đảm bảo tiến độ công việc thật tốt.",
            textEn: "Thank you for being so flexible! I'll update my schedule on the team board this morning and make sure all deliverables stay on track.",
            keywords: ["cảm ơn chị", "tạo điều kiện", "cập nhật lịch", "bảng chung", "tiến độ"],
            npcReactionVi: "Cảm ơn em nhé, chúc em một tuần làm việc thật hiệu quả và nhiều năng lượng!",
            nextTurnId: null,
            scoreBonus: 15,
          },
          {
            id: "routine2-t4-r2",
            labelVi: "Ghi chú lịch đánh giá cuối tháng và chủ động báo sớm nếu đổi",
            textVi: "Dạ vâng ạ, em sẽ ghi chú lịch đánh giá cuối tháng vào sổ tay. Có thay đổi gì phát sinh em sẽ báo trước cho chị ngay nhé!",
            textEn: "Yes, I'll note the end-of-month review in my planner. If anything comes up and changes, I'll let you know ahead of time right away!",
            keywords: ["ghi chú", "đánh giá cuối tháng", "sổ tay", "phát sinh", "báo trước"],
            npcReactionVi: "Nhất trí em nhé! Có vướng mắc gì trong tuần cứ nhắn chị trao đổi sớm.",
            nextTurnId: null,
            scoreBonus: 15,
          },
        ],
      },
    ],
  },

  {
    id: "dlg-routine-3",
    topicId: "routine",
    titleVi: "Đăng ký lịch tập thể thao sau giờ làm",
    settingVi: "Quầy lễ tân một câu lạc bộ thể thao và bơi lội gần khu chung cư vào chiều tối thứ Ba.",
    partnerName: "Minh Khoa",
    partnerRole: "Tư vấn viên phòng tập",
    goalVi: "Trình bày mục tiêu sức khỏe, hỏi khung giờ ít đông sau giờ làm, trao đổi về huấn luyện viên và chốt lịch tập thử.",
    openingLineVi:
      "Chào bạn đến với câu lạc bộ! Mình là Khoa, hôm nay bạn muốn tìm hiểu gói tập thể hình, bơi lội hay các lớp vận động nhóm sau giờ làm ạ?",
    turns: [
      {
        id: "routine3-t1",
        npcTextVi:
          "Chào bạn đến với câu lạc bộ! Mình là Khoa, hôm nay bạn muốn tìm hiểu gói tập thể hình, bơi lội hay các lớp vận động nhóm sau giờ làm ạ?",
        npcEn:
          "Welcome to the club! I'm Khoa — today are you looking into gym memberships, swimming, or after-work group fitness classes?",
        mood: "welcoming",
        hintsVi: [
          "Nêu mục tiêu cụ thể như «cải thiện thể lực», «đỡ mỏi vai gáy» hoặc «duy trì thói quen vận động».",
          "Cho biết tần suất bạn định đi tập mỗi tuần.",
        ],
        expectedResponses: [
          {
            id: "routine3-t1-r1",
            labelVi: "Tìm lớp giãn cơ kết hợp bơi lội để đỡ mỏi vai gáy",
            textVi: "Chào bạn Khoa! Do ngồi máy tính cả ngày nên mình hay mỏi vai gáy, mình muốn tìm lớp giãn cơ kết hợp bơi lội để cải thiện thể lực.",
            textEn: "Hi Khoa! Sitting at a computer all day gives me neck and shoulder stiffness, so I'm looking for stretching classes paired with swimming to build stamina.",
            keywords: ["ngồi máy tính", "mỏi vai gáy", "giãn cơ", "bơi lội", "cải thiện thể lực"],
            npcReactionVi: "Đúng nhu cầu của nhiều anh chị văn phòng quanh đây luôn, gói kết hợp bơi và giãn cơ bên mình rất được chuộng.",
            nextTurnId: "routine3-t2",
            scoreBonus: 15,
          },
          {
            id: "routine3-t1-r2",
            labelVi: "Tìm gói tập thể hình cơ bản ba buổi một tuần sau giờ làm",
            textVi: "Chào bạn, mình muốn đăng ký gói tập thể hình cơ bản khoảng ba buổi một tuần sau khi tan làm để duy trì thói quen vận động đều đặn.",
            textEn: "Hi, I want to sign up for a basic gym plan about three evenings a week after work to keep up a consistent exercise habit.",
            keywords: ["đăng ký", "thể hình", "ba buổi", "tan làm", "thói quen vận động"],
            npcReactionVi: "Tập đều ba buổi mỗi tuần là nhịp rất bền để bắt đầu và giữ phong độ lâu dài đấy bạn!",
            nextTurnId: "routine3-t2",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "routine3-t2",
        npcTextVi:
          "Bơi lội kết hợp giãn cơ rất hợp với dân văn phòng đấy ạ! Thường bạn tan làm lúc mấy giờ để mình kiểm tra khung giờ nào ít đông nhất cho bạn?",
        npcEn:
          "Swimming combined with stretching is ideal for office workers! What time do you usually get off work so I can check which time slots are least crowded for you?",
        mood: "helpful",
        hintsVi: [
          "Nói giờ tan làm và hỏi cụ thể mức độ đông vào «giờ cao điểm buổi tối».",
          "Có thể so sánh hai khung giờ buổi sáng sớm và buổi tối muộn.",
        ],
        expectedResponses: [
          {
            id: "routine3-t2-r1",
            labelVi: "Hỏi khung sáu giờ tối sau khi tan làm có đông máy không",
            textVi: "Mình thường tan làm lúc năm giờ rưỡi và ghé thẳng qua đây tầm sáu giờ tối. Không biết giờ cao điểm buổi tối ở đây có đông máy lắm không bạn?",
            textEn: "I usually finish work at 5:30 and head straight here around 6 p.m. Are the machines very crowded during the evening rush hour?",
            keywords: ["năm giờ rưỡi", "sáu giờ tối", "giờ cao điểm", "đông máy"],
            npcReactionVi: "Từ sáu giờ đến bảy giờ khu máy chạy hơi đông chút, nhưng bể bơi và phòng giãn cơ thì vẫn thoải mái bạn ạ.",
            nextTurnId: "routine3-t3",
            scoreBonus: 15,
          },
          {
            id: "routine3-t2-r2",
            labelVi: "So sánh khung bảy giờ tối và sáu giờ sáng sớm",
            textVi: "Buổi tối mình chỉ rảnh từ bảy giờ trở đi, hoặc thỉnh thoảng đi tập sớm lúc sáu giờ sáng trước khi vào làm. Hai khung đó giờ nào thoáng hơn?",
            textEn: "In the evening I'm only free from 7 p.m. onward, or occasionally I can work out early at 6 a.m. before work. Which of those two slots is quieter?",
            keywords: ["bảy giờ", "tập sớm", "sáu giờ sáng", "thoáng hơn"],
            npcReactionVi: "Cả hai khung đó đều là giờ đẹp đấy bạn, nhất là sáng sớm nước bể rất trong và không gian cực yên tĩnh.",
            nextTurnId: "routine3-t3",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "routine3-t3",
        npcTextVi:
          "Tầm bảy giờ tối hoặc sáng sớm rất thoáng và không phải chờ máy đâu ạ. Bên mình có huấn luyện viên hướng dẫn hai buổi đầu, bạn có muốn đăng ký kèm không?",
        npcEn:
          "Around 7 p.m. or early morning is very spacious with no waiting for equipment. We include a trainer for the first two sessions — would you like to add that?",
        mood: "practical",
        hintsVi: [
          "Nêu lý do muốn có huấn luyện viên (như «chỉnh tư thế chuẩn», «tránh chấn thương»).",
          "Hoặc đề nghị đăng ký một buổi tập thử và tham quan cơ sở vật chất trước.",
        ],
        expectedResponses: [
          {
            id: "routine3-t3-r1",
            labelVi: "Đồng ý tập cùng huấn luyện viên để tránh sai tư thế",
            textVi: "Có chứ bạn, mình mới bắt đầu tập lại nên rất cần huấn luyện viên chỉnh tư thế chuẩn ngay từ đầu để tránh chấn thương.",
            textEn: "Yes definitely — I'm just getting back into working out, so I really need a trainer to correct my form from the start to avoid injury.",
            keywords: ["bắt đầu tập lại", "huấn luyện viên", "chỉnh tư thế", "tránh chấn thương"],
            npcReactionVi: "Chuẩn luôn bạn ạ, nắm vững kỹ thuật từ đầu thì tập vừa an toàn vừa thấy hiệu quả nhanh hơn nhiều.",
            nextTurnId: "routine3-t4",
            scoreBonus: 15,
          },
          {
            id: "routine3-t3-r2",
            labelVi: "Xin tập thử một buổi và xem bể bơi trước khi chọn gói",
            textVi: "Nghe hay đấy, nhưng mình muốn đăng ký một buổi tập thử và tham quan bể bơi trước rồi mới chọn gói ba tháng hay sáu tháng.",
            textEn: "That sounds great, though I'd like to book one trial session and tour the pool first before choosing a three- or six-month plan.",
            keywords: ["buổi tập thử", "tham quan", "bể bơi", "ba tháng", "sáu tháng"],
            npcReactionVi: "Dạ tất nhiên rồi, bên mình luôn khuyến khích khách tập thử để cảm nhận trực tiếp trước khi đăng ký.",
            nextTurnId: "routine3-t4",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "routine3-t4",
        npcTextVi:
          "Hoàn toàn được luôn ạ! Bên mình đang trống lịch hướng dẫn thử lúc sáu giờ rưỡi tối thứ Năm hoặc sáng thứ Bảy, bạn thấy buổi nào tiện hơn?",
        npcEn:
          "Absolutely! We have trial guidance slots open at 6:30 p.m. Thursday or Saturday morning — which session works better for you?",
        mood: "enthusiastic",
        hintsVi: [
          "Chốt rõ ngày giờ buổi tập thử và hỏi thêm đồ dùng cần chuẩn bị.",
          "Cảm ơn tư vấn viên một cách tự nhiên, thân thiện.",
        ],
        expectedResponses: [
          {
            id: "routine3-t4-r1",
            labelVi: "Chốt tối thứ Năm và hỏi về giày, đồ bơi và khăn tắm",
            textVi: "Vậy chốt giúp mình sáu giờ rưỡi tối thứ Năm nhé! Mình chỉ cần mang giày thể thao và đồ bơi, còn khăn tắm thì phòng tập có sẵn đúng không?",
            textEn: "Let's lock in 6:30 p.m. Thursday! I just need to bring sneakers and swimwear, and the gym provides towels, right?",
            keywords: ["sáu giờ rưỡi", "tối thứ Năm", "giày thể thao", "đồ bơi", "khăn tắm"],
            npcReactionVi: "Đúng rồi bạn, khăn tắm và tủ khóa cá nhân đều có sẵn miễn phí! Hẹn gặp bạn tối thứ Năm nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
          {
            id: "routine3-t4-r2",
            labelVi: "Chọn sáng thứ Bảy cho thong thả, tránh kẹt xe",
            textVi: "Để mình chọn sáng thứ Bảy cho thong thả nhé, đi làm về trong tuần sợ kẹt xe lại tới muộn. Cảm ơn Khoa đã tư vấn rất nhiệt tình!",
            textEn: "Let me pick Saturday morning so it's relaxed — on weekdays after work I'm worried traffic will make me late. Thanks for the enthusiastic help, Khoa!",
            keywords: ["sáng thứ Bảy", "thong thả", "kẹt xe", "tới muộn", "nhiệt tình"],
            npcReactionVi: "Không có gì đâu bạn, sáng thứ Bảy mình sẽ đón bạn ở quầy lễ tân lúc tám giờ nhé!",
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

  {
    id: "dlg-weather-2",
    topicId: "weather",
    titleVi: "Đổi lịch chuyến đi biển vì dự báo mưa bão",
    settingVi: "Trò chuyện qua điện thoại với bạn thân vào tối thứ Tư khi miền Trung có tin áp thấp nhiệt đới sát ngày đi du lịch.",
    partnerName: "Thanh Tùng",
    partnerRole: "Bạn cùng nhóm du lịch",
    goalVi: "Trao đổi thông tin mưa bão, đặt ưu tiên an toàn, bàn cách đổi ngày khách sạn và vé máy bay rồi chốt kế hoạch mới.",
    openingLineVi:
      "Cậu đã xem bản tin thời tiết tối nay chưa? Biển miền Trung đang có áp thấp nhiệt đới, dự báo đúng hai hôm cuối tuần mình định bay là mưa to gió lớn đấy!",
    turns: [
      {
        id: "weather2-t1",
        npcTextVi:
          "Cậu đã xem bản tin thời tiết tối nay chưa? Biển miền Trung đang có áp thấp nhiệt đới, dự báo đúng hai hôm cuối tuần mình định bay là mưa to gió lớn đấy!",
        npcEn:
          "Have you seen tonight's weather bulletin? There's a tropical depression off the Central coast, and heavy rain and strong winds are forecast right on the weekend we plan to fly!",
        mood: "concerned",
        hintsVi: [
          "Dùng từ thời tiết biển như «gió giật mạnh», «biển động», «đổ bộ».",
          "Bày tỏ lo ngại thực tế về trải nghiệm chuyến đi hoặc nguy cơ hoãn chuyến bay.",
        ],
        expectedResponses: [
          {
            id: "weather2-t1-r1",
            labelVi: "Xác nhận đã xem tin và ngại biển động không đi chơi được",
            textVi: "Mình vừa đọc tin xong cũng thấy lo quá! Nếu gió giật mạnh và biển động thì không tắm biển hay đi thuyền được, ở lì trong phòng cũng phí chuyến đi.",
            textEn: "I just read the news and I'm worried too! With strong gusts and rough seas we can't swim or take a boat, and being stuck indoors would waste the trip.",
            keywords: ["lo quá", "gió giật mạnh", "biển động", "tắm biển", "phí chuyến đi"],
            npcReactionVi: "Đúng rồi, đi biển mà dính bão thì vừa nguy hiểm vừa chẳng đi đâu được.",
            nextTurnId: "weather2-t2",
            scoreBonus: 15,
          },
          {
            id: "weather2-t1-r2",
            labelVi: "Hỏi bão có đổ bộ trực tiếp không và lo hoãn chuyến bay",
            textVi: "Mình mới nghe loáng thoáng thôi, thế dự báo bảo bão có đổ bộ trực tiếp không cậu? Mình sợ nhất là ra sân bay rồi lại bị hoãn chuyến liên tục.",
            textEn: "I only caught bits of it — does the forecast say the storm will make direct landfall? What I dread most is getting to the airport only to face endless delays.",
            keywords: ["dự báo", "đổ bộ", "sân bay", "hoãn chuyến"],
            npcReactionVi: "Chưa chắc tâm bão vào thẳng nhưng hoàn lưu gây mưa gió rất rộng dọc bờ biển miền Trung cậu ạ.",
            nextTurnId: "weather2-t2",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "weather2-t2",
        npcTextVi:
          "Hãng bay chưa thông báo hủy nhưng khả năng hoãn chuyến khá cao. Theo cậu tụi mình nên giữ lịch cũ hay chủ động đổi sang cuối tuần sau cho yên tâm?",
        npcEn:
          "The airline hasn't announced cancellations yet, but delays are very likely. Should we keep our original dates or proactively reschedule to next weekend for peace of mind?",
        mood: "practical",
        hintsVi: [
          "Dùng «an toàn vẫn là trên hết» hoặc «dời hẳn sang cuối tuần sau».",
          "Đề xuất kiểm tra chính sách đổi ngày của khách sạn và hãng bay trước.",
        ],
        expectedResponses: [
          {
            id: "weather2-t2-r1",
            labelVi: "Ủng hộ dời hẳn sang tuần sau khi trời quang mây tạnh",
            textVi: "Theo mình thì an toàn vẫn là trên hết, mình nên dời hẳn sang cuối tuần sau khi trời quang mây tạnh để cả nhóm đi chơi thoải mái hơn.",
            textEn: "In my view safety comes first — we should push it back to next weekend when skies clear up so the whole group can enjoy comfortably.",
            keywords: ["an toàn", "dời hẳn", "cuối tuần sau", "quang mây tạnh", "thoải mái"],
            npcReactionVi: "Mình cũng nghĩ vậy, đi chơi mà cứ nơm nớp nhìn mây đen thì mất hết cả vui.",
            nextTurnId: "weather2-t3",
            scoreBonus: 15,
          },
          {
            id: "weather2-t2-r2",
            labelVi: "Kiểm tra phí đổi ngày với khách sạn và hãng bay ngay sáng mai",
            textVi: "Mình nghiêng về phương án đổi lịch, nhưng sáng mai tụi mình gọi ngay cho khách sạn và hãng bay hỏi xem có được hỗ trợ đổi ngày miễn phí không đã.",
            textEn: "I lean toward rescheduling, though tomorrow morning let's call the hotel and airline right away to ask if they allow free date changes.",
            keywords: ["đổi lịch", "khách sạn", "hãng bay", "đổi ngày", "miễn phí"],
            npcReactionVi: "Tính kỹ thế là chuẩn nhất rồi, gọi sớm trước hai ngày thường dễ thương lượng hơn nhiều.",
            nextTurnId: "weather2-t3",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "weather2-t3",
        npcTextVi:
          "Mình vừa kiểm tra rồi, khách sạn cho phép đổi ngày trước hai hôm nếu thời tiết xấu. Còn chuyện nghỉ phép ở công ty thì tuần sau cậu có sắp xếp được không?",
        npcEn:
          "I just checked — the hotel allows rescheduling two days in advance for bad weather. As for leave from work, can you arrange time off next week?",
        mood: "thoughtful",
        hintsVi: [
          "Bày tỏ sự nhẹ nhõm với chính sách khách sạn và nói rõ lịch công việc tuần sau.",
          "Nếu bận sáng thứ Sáu, đề xuất bay chuyến tối để vẫn kịp lịch chung.",
        ],
        expectedResponses: [
          {
            id: "weather2-t3-r1",
            labelVi: "Tuần sau đỡ bận hơn nên đổi đơn nghỉ phép rất dễ",
            textVi: "May quá, khách sạn hỗ trợ linh hoạt thế thì nhẹ đầu hẳn! Tuần sau công việc của mình đỡ bận hơn tuần này nên đổi đơn nghỉ phép rất dễ.",
            textEn: "Thank goodness the hotel is so flexible — what a relief! Next week my workload is lighter than this week, so shifting my leave request is easy.",
            keywords: ["linh hoạt", "nhẹ đầu", "đỡ bận hơn", "đổi đơn nghỉ phép"],
            npcReactionVi: "Tuyệt quá, vậy sáng mai mình báo các bạn còn lại trong nhóm thống nhất đổi luôn nhé!",
            nextTurnId: "weather2-t4",
            scoreBonus: 15,
          },
          {
            id: "weather2-t3-r2",
            labelVi: "Có họp sáng thứ Sáu nên đề xuất bay tối thứ Sáu",
            textVi: "Tuần sau thứ Sáu mình có cuộc họp buổi sáng, nên nếu đổi lịch mình bay chuyến tối thứ Sáu rồi về chiều Chủ nhật vẫn kịp cậu ạ.",
            textEn: "Next Friday I have a morning meeting, so if we reschedule I can take the Friday evening flight and return Sunday afternoon without missing a beat.",
            keywords: ["cuộc họp", "đổi lịch", "tối thứ Sáu", "chiều Chủ nhật", "vẫn kịp"],
            npcReactionVi: "Bay tối thứ Sáu xong sáng thứ Bảy ra biển đón bình minh cũng quá đẹp luôn cậu ạ!",
            nextTurnId: "weather2-t4",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "weather2-t4",
        npcTextVi:
          "Tuyệt vời, vậy cuối tuần này ở nhà tránh mưa bão thì tụi mình có nên hẹn nhau đi ăn nóng một bữa cho đỡ hụt hẫng không?",
        npcEn:
          "Awesome! Then while staying home to wait out the storm this weekend, should we meet up for a hot meal so we don't feel too let down?",
        mood: "relieved",
        hintsVi: [
          "Phân công nhanh việc đổi phòng và đổi vé máy bay sáng mai.",
          "Chốt kế hoạch thay thế ấm cúng trong nhà cho cuối tuần trời mưa.",
        ],
        expectedResponses: [
          {
            id: "weather2-t4-r1",
            labelVi: "Chia nhau đổi phòng, đổi vé và hẹn ăn lẩu tối thứ Bảy",
            textVi: "Ý hay đấy! Vậy sáng mai cậu xử lý phần phòng còn mình gọi đổi vé máy bay nhé, tối thứ Bảy trời mưa mình tụ tập ăn lẩu nóng bù lại.",
            textEn: "Great idea! Tomorrow morning you handle the hotel room and I'll call to change the flights, and Saturday rainy night we'll gather for hotpot to make up for it.",
            keywords: ["sáng mai", "đổi vé máy bay", "tối thứ Bảy", "trời mưa", "ăn lẩu nóng"],
            npcReactionVi: "Nhất trí cao độ! Trời mưa ăn lẩu xong tuần sau đi biển nắng đẹp là vẹn cả đôi đường luôn.",
            nextTurnId: null,
            scoreBonus: 15,
          },
          {
            id: "weather2-t4-r2",
            labelVi: "Hẹn ngồi quán cà phê ấm cúng rà lại lịch trình tuần sau",
            textVi: "Nhất trí luôn cậu ơi! Cuối tuần này tụi mình ngồi quán cà phê ấm cúng vừa tránh mưa vừa rà lại lịch trình cho tuần sau thật trọn vẹn.",
            textEn: "Totally agreed! This weekend let's sit at a cozy cafe to shelter from the rain and polish next week's itinerary so it's spotless.",
            keywords: ["nhất trí", "quán cà phê", "tránh mưa", "lịch trình", "trọn vẹn"],
            npcReactionVi: "Chốt nhé! Tối mai đổi xong vé mình nhắn chốt giờ cà phê với cả nhóm luôn.",
            nextTurnId: null,
            scoreBonus: 15,
          },
        ],
      },
    ],
  },

  {
    id: "dlg-weather-3",
    topicId: "weather",
    titleVi: "Hỏi chủ nhà cách xử lý trời nồm ẩm ở Hà Nội",
    settingVi: "Nói chuyện ngoài hành lang căn hộ thuê ở quận Tây Hồ vào một sáng tháng Ba ẩm ướt đặc trưng của miền Bắc.",
    partnerName: "Cô Hạnh",
    partnerRole: "Chủ nhà thân thiện ở Hà Nội",
    goalVi: "Mô tả hiện tượng trời nồm ẩm, hỏi mẹo chống ẩm thực tế của người bản địa, tìm hiểu dịch vụ giặt sấy và cảm ơn lịch sự.",
    openingLineVi:
      "Chào cháu, sáng nay đi làm sớm thế? Mấy hôm nay Hà Nội vào đợt nồm ẩm, trong phòng cháu nền nhà có bị đổ mồ hôi trơn trượt nhiều không?",
    turns: [
      {
        id: "weather3-t1",
        npcTextVi:
          "Chào cháu, sáng nay đi làm sớm thế? Mấy hôm nay Hà Nội vào đợt nồm ẩm, trong phòng cháu nền nhà có bị đổ mồ hôi trơn trượt nhiều không?",
        npcEn:
          "Good morning, heading to work early today? Hanoi has hit a humid spell these past few days — is the floor in your apartment sweating and slippery?",
        mood: "warm",
        hintsVi: [
          "Dùng xưng hô lễ phép «cô – cháu» kèm «ạ» khi trò chuyện với chủ nhà lớn tuổi.",
          "Mô tả tình trạng cụ thể như «nền gạch ướt nhẹp», «quần áo phơi mãi không khô».",
        ],
        expectedResponses: [
          {
            id: "weather3-t1-r1",
            labelVi: "Kể lần đầu gặp mùa nồm nên nền ướt và quần áo khó khô",
            textVi: "Chào cô Hạnh ạ! Đây là lần đầu cháu trải qua mùa nồm nên hơi bất ngờ, sáng nay nền gạch ướt nhẹp mà quần áo phơi ba ngày vẫn còn ẩm.",
            textEn: "Good morning, Aunt Hanh! This is my first time experiencing the humid season so I'm surprised — this morning the tile floor was soaked and laundry is still damp after three days.",
            keywords: ["mùa nồm", "bất ngờ", "nền gạch", "ướt nhẹp", "quần áo"],
            npcReactionVi: "Ai mới ra Bắc sống lần đầu gặp trời nồm cũng sốc y như cháu vậy đấy!",
            nextTurnId: "weather3-t2",
            scoreBonus: 15,
          },
          {
            id: "weather3-t1-r2",
            labelVi: "Thắc mắc vì mở toang cửa sổ mà sàn nhà lại ướt hơn",
            textVi: "Chào cô ạ, trong phòng cháu ẩm lắm, lúc nãy cháu mở toang cửa sổ cho thoáng nhưng thấy sàn nhà còn ướt hơn nữa cô ạ.",
            textEn: "Good morning! My room is so damp — earlier I opened the windows wide to air it out, yet the floor got even wetter.",
            keywords: ["ẩm lắm", "mở toang cửa sổ", "sàn nhà", "ướt hơn"],
            npcReactionVi: "Ối giời ơi, thế thì cháu làm ngược mất rồi, để cô chỉ mẹo của người Hà Nội cho nhé!",
            nextTurnId: "weather3-t2",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "weather3-t2",
        npcTextVi:
          "Ôi trời nồm miền Bắc là kỵ nhất chuyện mở toang cửa đấy cháu ạ, gió ẩm bên ngoài tràn vào càng ướt thêm. Cháu đã thử bật điều hòa chế độ hút ẩm chưa?",
        npcEn:
          "Oh, in Northern humid weather the worst thing is opening windows wide, because damp outside air rushes in and makes it wetter. Have you tried running the AC on dry mode?",
        mood: "helpful",
        hintsVi: [
          "Dùng «Thảo nào...» hoặc «Ra là vậy ạ...» để đáp lại lời giải thích thật tự nhiên.",
          "Hỏi lại chi tiết cách bật «chế độ hút ẩm» và lau nhà bằng «khăn khô».",
        ],
        expectedResponses: [
          {
            id: "weather3-t2-r1",
            labelVi: "Nhờ cô chỉ cách dùng chế độ hút ẩm đỡ tốn điện",
            textVi: "Thảo nào cháu mở cửa càng thấy dính rít! Cô chỉ giúp cháu bật chế độ hút ẩm trên điều hòa sao cho khô ráo mà đỡ tốn điện với ạ.",
            textEn: "No wonder opening the window made everything feel stickier! Could you show me how to run the AC dry mode so it stays dry without wasting electricity?",
            keywords: ["dính rít", "chế độ hút ẩm", "điều hòa", "khô ráo", "tốn điện"],
            npcReactionVi: "Chế độ hút ẩm ít tốn điện hơn làm lạnh nhiều cháu ạ, chỉ cần bật từng đợt ngắn là phòng khô ngay.",
            nextTurnId: "weather3-t3",
            scoreBonus: 15,
          },
          {
            id: "weather3-t2-r2",
            labelVi: "Xác nhận lại cách đóng kín cửa, bật hút ẩm và lau khăn khô",
            textVi: "Ra là vậy ạ, cảm ơn cô đã nhắc cháu! Cháu cứ đóng kín cửa rồi bật chế độ hút ẩm hai tiếng và lau nền bằng khăn khô là ổn đúng không cô?",
            textEn: "Ah, I see — thank you for telling me! So I just keep the windows closed, run dry mode for two hours, and wipe the floor with a dry cloth, right?",
            keywords: ["đóng kín cửa", "chế độ hút ẩm", "hai tiếng", "lau nền", "khăn khô"],
            npcReactionVi: "Cháu tiếp thu nhanh quá, làm đúng mấy bước ấy là tối nay đi chân trần trong nhà thấy khô cong ngay!",
            nextTurnId: "weather3-t3",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "weather3-t3",
        npcTextVi:
          "Đúng rồi cháu, cứ đóng kín cửa, bật hút ẩm hình giọt nước khoảng một hai tiếng rồi lau giẻ khô thôi. Tủ quần áo cháu nhớ đặt thêm túi hút ẩm nhé.",
        npcEn:
          "That's right — keep doors shut, run the droplet dry mode for an hour or two, and wipe with a dry rag. Remember to put moisture-absorber packs in your closet too.",
        mood: "practical",
        hintsVi: [
          "Hỏi thêm về tiệm giặt sấy gần nhà cho quần áo dày.",
          "Hoặc hỏi kinh nghiệm xem đợt nồm ẩm thường kéo dài bao lâu.",
        ],
        expectedResponses: [
          {
            id: "weather3-t3-r1",
            labelVi: "Hỏi tiệm giặt sấy gần khu nhà cho áo khoác dày",
            textVi: "Dạ cháu nhớ rồi ạ! Quanh khu mình có tiệm giặt sấy nào gần không cô, chứ mấy chiếc áo khoác dày phơi ngoài ban công chắc khó khô lắm.",
            textEn: "Got it, thank you! Is there a laundromat with dryers nearby, since thick jackets hanging on the balcony probably won't dry at all?",
            keywords: ["tiệm giặt sấy", "áo khoác dày", "ban công", "khó khô"],
            npcReactionVi: "Ngay đầu ngõ rẽ phải có tiệm giặt sấy tự động mở đến mười giờ tối, sấy một mẻ thơm phức luôn cháu ạ.",
            nextTurnId: "weather3-t4",
            scoreBonus: 15,
          },
          {
            id: "weather3-t3-r2",
            labelVi: "Hỏi đợt nồm ẩm ở Hà Nội thường kéo dài mấy ngày",
            textVi: "Cảm ơn kinh nghiệm quý quá cô ơi! Không biết đợt nồm ẩm kiểu này ở Hà Nội thường kéo dài mấy ngày hay hết cả tháng Ba hả cô?",
            textEn: "Thank you for such valuable advice! Does a humid spell like this in Hanoi usually last just a few days or all of March?",
            keywords: ["kinh nghiệm", "nồm ẩm", "kéo dài", "mấy ngày", "tháng Ba"],
            npcReactionVi: "Không kéo dài suốt cả tháng đâu cháu đừng lo, nó cứ từng đợt ngắn xen kẽ ngày nắng ráo thôi.",
            nextTurnId: "weather3-t4",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "weather3-t4",
        npcTextVi:
          "Mỗi đợt nồm chỉ chừng năm bảy hôm là có gió mùa khô ráo trở lại ngay ấy mà. Nếu cháu cần mượn máy hút ẩm nhỏ của cô dùng tạm thì cứ bảo nhé!",
        npcEn:
          "Each humid spell only lasts about five to seven days before dry monsoon winds return. If you ever want to borrow my compact dehumidifier for a few days, just ask!",
        mood: "cheerful",
        hintsVi: [
          "Cảm ơn sự chu đáo của cô chủ nhà và nói kế hoạch áp dụng tối nay.",
          "Chào tạm biệt lễ phép trước khi đi làm.",
        ],
        expectedResponses: [
          {
            id: "weather3-t4-r1",
            labelVi: "Cảm ơn cô và hẹn tối thử bật hút ẩm trước",
            textVi: "Cháu cảm ơn cô Hạnh nhiều lắm ạ! Tối về cháu đóng kín cửa thử chế độ hút ẩm trước, nếu phòng vẫn ẩm quá thì cháu xin mượn cô vài hôm nhé.",
            textEn: "Thank you so much, Aunt Hanh! Tonight I'll close the windows and try dry mode first, and if it's still too damp I'll ask to borrow yours for a few days.",
            keywords: ["cảm ơn cô", "đóng kín cửa", "chế độ hút ẩm", "xin mượn", "vài hôm"],
            npcReactionVi: "Ừ cứ thoải mái nhé cháu, cần gì cứ gõ cửa tầng một gọi cô. Cháu đi làm cẩn thận kẻo đường trơn nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
          {
            id: "weather3-t4-r2",
            labelVi: "Bày tỏ sự biết ơn vì tránh hỏng sách vở và chào đi làm",
            textVi: "May quá có cô chỉ tận tình chứ cháu cứ lo hỏng hết sách vở và máy tính. Cháu cảm ơn cô nhiều, cháu đi làm kẻo muộn giờ ạ!",
            textEn: "I'm so lucky you guided me so kindly — I was worried my books and laptop would get ruined. Thank you so much, I'd better head to work before I'm late!",
            keywords: ["tận tình", "sách vở", "máy tính", "cảm ơn cô", "muộn giờ"],
            npcReactionVi: "Không có gì đâu cháu, chúc cháu ngày mới làm việc vui vẻ nhé!",
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

  {
    id: "dlg-emotions-2",
    topicId: "emotions",
    titleVi: "Hỏi thăm và động viên đồng nghiệp trước hạn dự án",
    settingVi: "Khu vực pha trà của văn phòng vào chiều thứ Tư khi đồng nghiệp đang căng thẳng trước buổi thuyết trình dự án quan trọng.",
    partnerName: "Khánh Vy",
    partnerRole: "Đồng nghiệp cùng nhóm sản phẩm",
    goalVi: "Hỏi thăm tinh tế, giúp đồng nghiệp giảm căng thẳng, đề nghị hỗ trợ thiết thực và tiếp thêm sự tự tin.",
    openingLineVi:
      "Chào bạn, trông mình hôm nay chắc bơ phờ lắm nhỉ? Sáng mai phải thuyết trình dự án trước ban giám đốc rồi mà mình vẫn hồi hộp và chưa yên tâm chút nào.",
    turns: [
      {
        id: "emotions2-t1",
        npcTextVi:
          "Chào bạn, trông mình hôm nay chắc bơ phờ lắm nhỉ? Sáng mai phải thuyết trình dự án trước ban giám đốc rồi mà mình vẫn hồi hộp và chưa yên tâm chút nào.",
        npcEn:
          "Hey, I must look completely exhausted today, huh? I have to present our project to the leadership board tomorrow morning, and I'm still nervous and not feeling confident at all.",
        mood: "anxious",
        hintsVi: [
          "Ghi nhận sự căng thẳng của đồng nghiệp và mời bạn nghỉ nhịp ngắn để chia sẻ.",
          "Hoặc nhắc lại quá trình chuẩn bị kỹ lưỡng để bạn bớt tự tạo áp lực.",
        ],
        expectedResponses: [
          {
            id: "emotions2-t1-r1",
            labelVi: "Hỏi thăm nhẹ nhàng xem phần nào khiến bạn lo nhất",
            textVi: "Chào Vy, nhìn cậu hơi căng thẳng thật đấy! Ngồi uống ngụm trà ấm cho dịu lại đã, phần nào trong bài thuyết trình đang làm cậu lo nhất thế?",
            textEn: "Hi Vy, you do look a bit stressed! Sit down and sip some warm tea to unwind first — which part of the presentation is worrying you most?",
            keywords: ["căng thẳng", "trà ấm", "dịu lại", "bài thuyết trình", "lo nhất"],
            npcReactionVi: "Cảm ơn cậu, uống ngụm trà ấm thấy dễ thở hơn chút rồi.",
            nextTurnId: "emotions2-t2",
            scoreBonus: 15,
          },
          {
            id: "emotions2-t1-r2",
            labelVi: "Khẳng định sự chuẩn bị kỹ lưỡng suốt cả tuần của bạn",
            textVi: "Trước buổi báo cáo lớn ai cũng hồi hộp cả mà, cậu đừng tự ép mình quá. Cả tuần nay cậu đã chuẩn bị số liệu kỹ lắm rồi còn gì.",
            textEn: "Everyone gets nervous before a big presentation — don't be too hard on yourself. You've prepared the numbers so thoroughly all week.",
            keywords: ["báo cáo lớn", "hồi hộp", "đừng tự ép mình", "chuẩn bị", "số liệu"],
            npcReactionVi: "Nghe cậu nhắc vậy mình cũng đỡ tự trách bản thân hơn, chỉ là vẫn hơi lo phút chót thôi.",
            nextTurnId: "emotions2-t2",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "emotions2-t2",
        npcTextVi:
          "Mình sợ nhất phần hỏi đáp cuối buổi. Nhỡ các sếp hỏi sâu về chi phí mà mình lúng túng không trôi chảy thì ảnh hưởng công sức cả tháng mất.",
        npcEn:
          "What scares me most is the Q&A at the end. What if the executives dig into costs and I stumble — it could undermine a whole month of work.",
        mood: "down",
        hintsVi: [
          "Công nhận nỗi lo là bình thường rồi đưa ra một giải pháp thực tế.",
          "Gợi ý «đóng vai hỏi thử» hoặc cách xử lý bình tĩnh khi gặp câu hỏi khó.",
        ],
        expectedResponses: [
          {
            id: "emotions2-t2-r1",
            labelVi: "Đề nghị đóng vai ban giám đốc hỏi thử để luyện phản xạ",
            textVi: "Lo lắng thế là bình thường thôi, vì cậu rất có trách nhiệm với dự án. Hay chiều nay mình đóng vai ban giám đốc hỏi thử để cậu luyện phản xạ trước nhé?",
            textEn: "Worrying like that is totally normal because you care deeply about the project. How about I roleplay as leadership this afternoon so you can practice answering?",
            keywords: ["bình thường", "trách nhiệm", "đóng vai", "hỏi thử", "luyện phản xạ"],
            npcReactionVi: "Ôi thật không cậu? Nếu có người đặt câu hỏi thử trước thì sáng mai mình đỡ bị bất ngờ hẳn!",
            nextTurnId: "emotions2-t3",
            scoreBonus: 15,
          },
          {
            id: "emotions2-t2-r2",
            labelVi: "Khuyên bình tĩnh ghi nhận và hẹn gửi bảng phân tích sau",
            textVi: "Không ai nhớ hết mọi chi tiết ngay lập tức đâu Vy ạ. Nếu gặp câu hỏi khó, cậu cứ bình tĩnh ghi nhận rồi hẹn gửi bảng phân tích chi tiết sau buổi họp.",
            textEn: "Nobody remembers every detail on the spot, Vy. If a tough question comes up, calmly note it down and promise a detailed breakdown right after the meeting.",
            keywords: ["chi tiết", "câu hỏi khó", "bình tĩnh", "ghi nhận", "phân tích"],
            npcReactionVi: "Đúng nhỉ, mình cứ tự mặc định phải trả lời ngay lập tức nên mới càng hoảng!",
            nextTurnId: "emotions2-t3",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "emotions2-t3",
        npcTextVi:
          "Có bạn tập dượt cùng thì tốt quá, mình cũng đỡ run hơn nhiều. Mình chỉ hơi ngại làm mất thời gian vì thấy chiều nay bạn cũng còn nhiều đầu việc.",
        npcEn:
          "Rehearsing with you would help so much and calm my nerves. I just feel bad taking up your time since it looks like you have plenty on your plate this afternoon too.",
        mood: "thoughtful",
        hintsVi: [
          "Giúp đồng nghiệp bớt ngại bằng câu «Cậu đừng ngại nhé...» kèm khung giờ rõ ràng.",
          "Hoặc đề nghị hỗ trợ soát lại trang trình chiếu và số liệu.",
        ],
        expectedResponses: [
          {
            id: "emotions2-t3-r1",
            labelVi: "Chủ động dành ba mươi phút lúc bốn giờ chiều tập cùng bạn",
            textVi: "Cậu đừng ngại nhé, mình sắp xong phần việc chính rồi nên hoàn toàn có thể dành ba mươi phút lúc bốn giờ chiều để chạy thử cùng cậu.",
            textEn: "Don't worry at all — I'm almost done with my main tasks, so I can easily set aside thirty minutes at 4 p.m. to do a dry run with you.",
            keywords: ["đừng ngại", "việc chính", "ba mươi phút", "bốn giờ chiều", "chạy thử"],
            npcReactionVi: "Quý cậu quá đi mất, có khung giờ rõ ràng vậy mình thấy yên tâm hẳn!",
            nextTurnId: "emotions2-t4",
            scoreBonus: 15,
          },
          {
            id: "emotions2-t3-r2",
            labelVi: "Nhận giúp soát lỗi chữ và số liệu bản trình chiếu trước",
            textVi: "Cùng một nhóm thì hỗ trợ nhau là chuyện đương nhiên mà! Trước lúc tập nói, cậu gửi bản trình chiếu qua đây mình phụ soát lỗi chữ và số liệu giúp cho.",
            textEn: "We're on the same team, so helping each other is only natural! Before rehearsing, send me the slide deck and I'll help proofread typos and figures.",
            keywords: ["hỗ trợ nhau", "tập nói", "bản trình chiếu", "soát lỗi", "số liệu"],
            npcReactionVi: "Được cậu soát thêm một lượt bằng con mắt khách quan thì chắc chắn bài báo cáo sẽ chỉn chu hơn nhiều!",
            nextTurnId: "emotions2-t4",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "emotions2-t4",
        npcTextVi:
          "Cảm ơn bạn nhiều lắm, tự nhiên mình thấy vững tâm hơn hẳn rồi! Tối nay mình sẽ ôn nhẹ một lượt rồi ngủ sớm để mai giữ tinh thần thật tỉnh táo.",
        npcEn:
          "Thank you so much — I genuinely feel a lot steadier now! Tonight I'll review lightly once and go to bed early so I stay sharp tomorrow.",
        mood: "relieved",
        hintsVi: [
          "Ủng hộ quyết định ngủ sớm và gửi lời khích lệ chân thành.",
          "Tạo không khí vui vẻ bằng lời hẹn ăn mừng nhẹ sau buổi thuyết trình.",
        ],
        expectedResponses: [
          {
            id: "emotions2-t4-r1",
            labelVi: "Khích lệ giữ tinh thần và hẹn uống trà sữa ăn mừng",
            textVi: "Đúng rồi đấy, ngủ đủ giấc sáng mai giọng nói sẽ tự tin và rõ ràng hơn nhiều. Cố lên nhé, báo cáo xong cả nhóm đi uống trà sữa ăn mừng!",
            textEn: "Exactly — with a full night's sleep your voice will sound much more confident and clear tomorrow. You've got this, and afterward the whole team will celebrate with milk tea!",
            keywords: ["ngủ đủ giấc", "tự tin", "rõ ràng", "cố lên", "ăn mừng"],
            npcReactionVi: "Nhớ giữ lời vụ trà sữa nhé! Cảm ơn cậu nhiều lắm, bốn giờ chiều mình gọi cậu nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
          {
            id: "emotions2-t4-r2",
            labelVi: "Chốt giờ gặp phòng họp nhỏ và tin bạn sẽ làm xuất sắc",
            textVi: "Nghe cậu thoải mái hơn là mình yên tâm rồi! Vậy bốn giờ mình gặp ở phòng họp nhỏ nhé, mình tin sáng mai cậu sẽ làm thật xuất sắc.",
            textEn: "Hearing you feel more at ease puts my mind at rest! Let's meet at four in the small conference room — I'm sure you'll do wonderfully tomorrow morning.",
            keywords: ["thoải mái", "yên tâm", "bốn giờ", "phòng họp nhỏ", "xuất sắc"],
            npcReactionVi: "Cảm ơn nguồn năng lượng tích cực của cậu! Hẹn cậu bốn giờ ở phòng họp nhỏ nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
        ],
      },
    ],
  },

  {
    id: "dlg-emotions-3",
    topicId: "emotions",
    titleVi: "Tâm sự cảm xúc khi chuẩn bị chuyển sang thành phố mới",
    settingVi: "Buổi cà phê chia tay thân mật vào chiều Chủ nhật với người bạn thân trước khi bạn chuyển vào Đà Nẵng làm việc.",
    partnerName: "Hải Yến",
    partnerRole: "Bạn thân từ thời mới đi làm",
    goalVi: "Diễn đạt cảm xúc đan xen tinh tế, chia sẻ kỳ vọng ở chặng đường mới, an ủi bạn thân và hẹn giữ gắn kết lâu dài.",
    openingLineVi:
      "Chỉ còn vài ngày nữa là cậu bay vào thành phố mới rồi đấy. Đóng gói hành lý gần xong hết chưa, lúc này trong lòng cậu đang thấy hào hứng hay bâng khuâng hơn?",
    turns: [
      {
        id: "emotions3-t1",
        npcTextVi:
          "Chỉ còn vài ngày nữa là cậu bay vào thành phố mới rồi đấy. Đóng gói hành lý gần xong hết chưa, lúc này trong lòng cậu đang thấy hào hứng hay bâng khuâng hơn?",
        npcEn:
          "Only a few days left until you fly to the new city! Are you almost done packing, and right now are you feeling more excited or nostalgic?",
        mood: "reflective",
        hintsVi: [
          "Dùng cụm diễn đạt cảm xúc tinh tế như «cảm xúc đan xen», «vừa háo hức vừa bùi ngùi».",
          "Chia sẻ thật cả kỳ vọng lẫn chút hồi hộp trước bước ngoặt mới.",
        ],
        expectedResponses: [
          {
            id: "emotions3-t1-r1",
            labelVi: "Chia sẻ cảm xúc đan xen giữa háo hức và bùi ngùi",
            textVi: "Mình thu xếp gần xong rồi cậu ạ. Cảm xúc đan xen lắm, vừa háo hức trước cơ hội mới nhưng nghĩ sắp xa gia đình và bạn bè lại thấy bùi ngùi.",
            textEn: "I've nearly wrapped up packing. My feelings are really mixed — excited about the new opportunity, yet wistful thinking about leaving family and friends.",
            keywords: ["cảm xúc", "đan xen", "háo hức", "cơ hội mới", "bùi ngùi"],
            npcReactionVi: "Chuyển đi xa lập nghiệp thì ai cũng vừa háo hức vừa bịn rịn thế thôi cậu ạ.",
            nextTurnId: "emotions3-t2",
            scoreBonus: 15,
          },
          {
            id: "emotions3-t1-r2",
            labelVi: "Thú nhận hơi hồi hộp nhưng thấy rất đáng thử",
            textVi: "Mình vẫn đang gói nốt mấy thùng sách. Cũng hơi hồi hộp vì phải làm quen lại từ môi trường sống đến đồng nghiệp, nhưng mình thấy rất đáng thử.",
            textEn: "I'm still packing the last few boxes of books. I'm a little nervous about starting over with a new neighborhood and colleagues, yet I feel it's truly worth trying.",
            keywords: ["hồi hộp", "làm quen lại", "môi trường sống", "đồng nghiệp", "đáng thử"],
            npcReactionVi: "Mình nể sự dũng cảm của cậu lắm, dám bước ra khỏi vùng an toàn để thử trải nghiệm mới!",
            nextTurnId: "emotions3-t2",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "emotions3-t2",
        npcTextVi:
          "Mình hiểu cảm giác đó lắm, rời khỏi nơi quen thuộc bao nhiêu năm đâu phải chuyện dễ. Điều gì ở thành phố mới khiến cậu mong chờ nhất trong vài tháng tới?",
        npcEn:
          "I totally understand — leaving a place that's been familiar for years isn't easy at all. What are you looking forward to most in the new city over the next few months?",
        mood: "warm",
        hintsVi: [
          "Nêu điều bạn mong chờ bằng «Mình mong nhất là...» hoặc «Mình háo hức với...».",
          "So sánh nhẹ với nhịp sống hiện tại để câu chia sẻ có chiều sâu.",
        ],
        expectedResponses: [
          {
            id: "emotions3-t2-r1",
            labelVi: "Mong nhịp sống dễ thở và chạy bộ ngắm hoàng hôn bên biển",
            textVi: "Mình mong nhất là nhịp sống dễ thở hơn, tan làm có thể chạy bộ dọc bờ biển ngắm hoàng hôn thay vì ngày nào cũng kẹt xe hàng tiếng đồng hồ.",
            textEn: "What I look forward to most is a gentler pace of life — jogging along the beach at sunset after work instead of sitting in traffic for hours every day.",
            keywords: ["nhịp sống", "dễ thở", "bờ biển", "hoàng hôn", "kẹt xe"],
            npcReactionVi: "Nghe cậu tả cảnh tan làm đi ngắm hoàng hôn trên biển mà mình cũng muốn chuyển vào theo luôn đấy!",
            nextTurnId: "emotions3-t3",
            scoreBonus: 15,
          },
          {
            id: "emotions3-t2-r2",
            labelVi: "Háo hức với công việc mới và hành trình trưởng thành",
            textVi: "Mình háo hức với vị trí công việc mới và muốn tự xây dựng một vòng tròn bạn bè mới, xem bản thân trưởng thành thêm được bao nhiêu.",
            textEn: "I'm excited about my new role and want to build a new circle of friends from scratch to see how much further I can grow.",
            keywords: ["háo hức", "công việc mới", "vòng tròn bạn bè", "trưởng thành"],
            npcReactionVi: "Với tính cách cởi mở của cậu, chắc chắn chỉ vài tuần là cậu quen thân được bao nhiêu bạn tốt rồi.",
            nextTurnId: "emotions3-t3",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "emotions3-t3",
        npcTextVi:
          "Nghe cậu có mục tiêu rõ ràng vậy mình mừng thay cho cậu lắm. Chỉ hơi chạnh lòng chút là từ tuần sau không còn ai rủ đi ăn tối đột xuất nữa rồi.",
        npcEn:
          "Hearing you have such clear goals makes me really happy for you. I just feel a bit bittersweet knowing that starting next week nobody will spontaneously ask me out for dinner.",
        mood: "down",
        hintsVi: [
          "Đáp lại tình cảm chân thành của bạn bằng lời trấn an ấm áp.",
          "Hẹn giữ liên lạc đều đặn hoặc mời bạn bay vào chơi khi đã ổn định.",
        ],
        expectedResponses: [
          {
            id: "emotions3-t3-r1",
            labelVi: "Khẳng định sẽ gọi điện đều đặn, không xa mặt cách lòng",
            textVi: "Cậu nói thế làm mình xúc động quá! Tuy không gặp mỗi tuần nhưng tụi mình vẫn gọi điện kể chuyện cuối tuần đều đặn, không để xa mặt cách lòng đâu.",
            textEn: "Hearing you say that really moves me! Even if we can't meet weekly, we'll still call regularly every weekend to catch up — we won't let distance drift us apart.",
            keywords: ["xúc động", "gọi điện", "kể chuyện", "đều đặn", "xa mặt cách lòng"],
            npcReactionVi: "Nhớ giữ lịch gọi điện cuối tuần nhé, có chuyện gì vui buồn trong đó đều phải kể ngay cho mình đấy!",
            nextTurnId: "emotions3-t4",
            scoreBonus: 15,
          },
          {
            id: "emotions3-t3-r2",
            labelVi: "Mời bạn sớm đặt vé bay vào chơi khi ổn định chỗ ở",
            textVi: "Đừng buồn nhé, đợi mình ổn định chỗ ở xong là cậu đặt vé bay vào chơi ngay, mình lo phần ăn ở và dẫn cậu đi khám phá mọi ngóc ngách luôn.",
            textEn: "Don't be sad — as soon as I settle into my place, book a ticket to visit! I'll host you and take you to explore every hidden corner.",
            keywords: ["đừng buồn", "ổn định chỗ ở", "đặt vé", "khám phá", "ngóc ngách"],
            npcReactionVi: "Có chỗ ở miễn phí kèm hướng dẫn viên bản địa thế này thì mình phải săn vé sớm mới được!",
            nextTurnId: "emotions3-t4",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "emotions3-t4",
        npcTextVi:
          "Nhất định rồi, tháng sau được nghỉ phép mình sẽ bay vào thăm cậu ngay! Trước lúc đi cậu còn muốn tụi mình ghé thêm nơi kỷ niệm nào ở đây không?",
        npcEn:
          "Definitely — once I get leave next month I'll fly down to visit you right away! Before you leave, is there any meaningful spot here you'd like us to visit together?",
        mood: "upbeat",
        hintsVi: [
          "Gợi ý một hoạt động kỷ niệm nhẹ nhàng trước ngày bay hoặc cảm ơn tình bạn chân thành.",
          "Kết thúc cuộc trò chuyện với cảm giác ấm áp và lạc quan.",
        ],
        expectedResponses: [
          {
            id: "emotions3-t4-r1",
            labelVi: "Rủ đi bộ quanh hồ và ghé quán ăn quen hồi mới đi làm",
            textVi: "Hay chiều nay tụi mình đi bộ quanh hồ rồi ghé quán ăn quen hồi mới đi làm đi cậu, coi như lưu lại một kỷ niệm thật đẹp trước ngày bay.",
            textEn: "How about we walk around the lake this afternoon and visit our old favorite diner from our first job, to make one more lovely memory before I fly?",
            keywords: ["đi bộ quanh hồ", "quán ăn quen", "lưu lại", "kỷ niệm", "ngày bay"],
            npcReactionVi: "Ý tưởng quá tuyệt vời luôn! Mình đi ngay kẻo chiều muộn quán đông hết chỗ đẹp nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
          {
            id: "emotions3-t4-r2",
            labelVi: "Bày tỏ sự ấm lòng và cảm ơn bạn luôn ủng hộ",
            textVi: "Ngồi uống cà phê nói chuyện thế này đã thấy ấm lòng lắm rồi cậu ạ! Cảm ơn cậu vì luôn lắng nghe và ủng hộ mọi quyết định của mình nhé.",
            textEn: "Just sitting here over coffee and talking already warms my heart! Thank you for always listening and supporting every decision I make.",
            keywords: ["cà phê", "ấm lòng", "cảm ơn", "lắng nghe", "ủng hộ"],
            npcReactionVi: "Bạn thân với nhau mà, chúc cậu khởi đầu mới thật suôn sẻ và rực rỡ nhé!",
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

  {
    id: "dlg-opinions-2",
    topicId: "opinions",
    titleVi: "Thảo luận chuyện thuê nhà trung tâm hay ngoại ô",
    settingVi: "Trò chuyện cùng anh đồng nghiệp có kinh nghiệm sống lâu năm ở thành phố khi bạn sắp hết hạn hợp đồng thuê căn hộ.",
    partnerName: "Anh Quang Huy",
    partnerRole: "Đồng nghiệp lâu năm am hiểu khu vực",
    goalVi: "So sánh ưu nhược điểm giữa thuê nhà trung tâm và ngoại ô, cân nhắc chi phí, di chuyển, tiện ích và chốt hướng chọn nhà.",
    openingLineVi:
      "Nghe bảo tháng sau bạn hết hạn hợp đồng thuê nhà rồi đúng không? Đợt này bạn định ở tiếp khu trung tâm cho tiện hay chuyển ra ngoại ô thuê căn rộng hơn?",
    turns: [
      {
        id: "opinions2-t1",
        npcTextVi:
          "Nghe bảo tháng sau bạn hết hạn hợp đồng thuê nhà rồi đúng không? Đợt này bạn định ở tiếp khu trung tâm cho tiện hay chuyển ra ngoại ô thuê căn rộng hơn?",
        npcEn:
          "I heard your apartment lease ends next month, right? Are you planning to stay downtown for convenience or move to the suburbs for a larger place?",
        mood: "thoughtful",
        hintsVi: [
          "So sánh hai lựa chọn bằng cấu trúc «Ở trung tâm thì... còn ra ngoại ô lại...».",
          "Nêu rõ tiêu chí bạn quan tâm nhất như «giá thuê», «ánh sáng», «tiện đi làm».",
        ],
        expectedResponses: [
          {
            id: "opinions2-t1-r1",
            labelVi: "Phân vân giữa giá thuê trung tâm cao và không gian rộng ở ngoại ô",
            textVi: "Đúng rồi anh ạ, mình đang phân vân lắm. Ở trung tâm đi làm rất tiện nhưng giá thuê tăng cao quá, còn ra ngoại ô lại rộng rãi và tiết kiệm hơn.",
            textEn: "Yes, I'm really torn right now. Living downtown is super convenient for commuting, but rents have surged, whereas the suburbs are more spacious and affordable.",
            keywords: ["phân vân", "trung tâm", "giá thuê", "ngoại ô", "tiết kiệm"],
            npcReactionVi: "Đúng bài toán kinh điển của dân văn phòng luôn, mỗi lựa chọn đều có cái giá riêng.",
            nextTurnId: "opinions2-t2",
            scoreBonus: 15,
          },
          {
            id: "opinions2-t1-r2",
            labelVi: "Nghiêng về khu ven đô để có căn hộ thoáng sáng và yên tĩnh",
            textVi: "Mình đang nghiêng về phương án chuyển ra khu ven đô anh ạ, vì cùng mức tiền mà thuê được căn hộ nhiều ánh sáng và yên tĩnh hơn hẳn.",
            textEn: "I'm leaning toward moving out to the outskirts — for the same budget you get an apartment with much more natural light and peace.",
            keywords: ["nghiêng về", "ven đô", "căn hộ", "ánh sáng", "yên tĩnh"],
            npcReactionVi: "Có không gian sáng sủa để tối về nghỉ ngơi đúng là nâng cao chất lượng sống rõ rệt đấy.",
            nextTurnId: "opinions2-t2",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "opinions2-t2",
        npcTextVi:
          "Ở ngoại ô đúng là dễ chịu và đỡ tốn tiền nhà, nhưng đổi lại sáng nào đi làm cũng tắc đường gần một tiếng. Bạn có ngại khoản đi lại đó không?",
        npcEn:
          "Living in the suburbs is definitely pleasant and cheaper on rent, yet in return you face almost an hour of traffic every morning. Does that commute bother you?",
        mood: "analytical",
        hintsVi: [
          "Cân nhắc giá trị sức khỏe và thời gian với tiền thuê nhà.",
          "Hoặc dùng «Một mặt ..., mặt khác ...» để nêu giải pháp di chuyển như tàu điện, làm từ xa.",
        ],
        expectedResponses: [
          {
            id: "opinions2-t2-r1",
            labelVi: "Lo mất hai tiếng mỗi ngày sẽ ảnh hưởng sức khỏe và nghỉ ngơi",
            textVi: "Khoản đó là điều mình cân nhắc nhất đấy anh. Nếu mỗi ngày mất hai tiếng trên đường thì giá thuê rẻ cũng khó bù lại sức khỏe và thời gian nghỉ ngơi.",
            textEn: "That's honestly my biggest concern. If I lose two hours on the road every day, cheaper rent barely makes up for lost energy and rest.",
            keywords: ["cân nhắc", "hai tiếng", "giá thuê rẻ", "sức khỏe", "nghỉ ngơi"],
            npcReactionVi: "Chuẩn luôn, nhiều người chuyển ra xa được nửa năm rồi lại mệt vì đi lại quá tốn sức.",
            nextTurnId: "opinions2-t3",
            scoreBonus: 15,
          },
          {
            id: "opinions2-t2-r2",
            labelVi: "Tận dụng lịch làm tại nhà hai buổi và tuyến tàu điện gần đó",
            textVi: "Một mặt mình hơi ngại tắc đường, mặt khác công ty cho làm tại nhà hai buổi mỗi tuần và gần tuyến tàu điện nên mình nghĩ vẫn xoay xở tốt.",
            textEn: "On one hand I'm wary of traffic; on the other hand our company allows two remote days a week and there's a metro line nearby, so I think I can manage well.",
            keywords: ["một mặt", "tắc đường", "mặt khác", "tàu điện", "xoay xở"],
            npcReactionVi: "Nếu chọn được khu sát ga tàu điện và chỉ lên văn phòng ba buổi thì bài toán di chuyển nhẹ hẳn!",
            nextTurnId: "opinions2-t3",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "opinions2-t3",
        npcTextVi:
          "Cũng có lý đấy! Ngoài chuyện đi lại, theo quan điểm của bạn thì tiện ích xung quanh như quán ăn, phòng tập hay bệnh viện quan trọng đến mức nào khi chọn chỗ ở?",
        npcEn:
          "Fair point! Beyond commuting, in your view how important are nearby amenities like eateries, gyms, or hospitals when picking a place to live?",
        mood: "curious",
        hintsVi: [
          "Mở đầu bằng «Theo mình thì...» hoặc «Quan điểm của mình là...».",
          "Sắp xếp thứ tự ưu tiên rõ ràng như an ninh, siêu thị, công viên hay môi trường trong lành.",
        ],
        expectedResponses: [
          {
            id: "opinions2-t3-r1",
            labelVi: "Ưu tiên khu an ninh, có siêu thị thực phẩm và công viên gần nhà",
            textVi: "Theo mình thì không cần quá sầm uất, nhưng khu nhà phải an ninh, có siêu thị thực phẩm tươi và công viên đi bộ gần đó để sinh hoạt đỡ vất vả.",
            textEn: "In my view it doesn't need to be bustling, yet the neighborhood must be safe with a fresh grocery market and a walking park nearby for easy daily living.",
            keywords: ["theo mình", "an ninh", "siêu thị", "công viên", "sinh hoạt"],
            npcReactionVi: "Tiêu chí quá thiết thực! Mấy tiện ích thiết yếu quanh bán kính đi bộ tiết kiệm được bao nhiêu công sức.",
            nextTurnId: "opinions2-t4",
            scoreBonus: 15,
          },
          {
            id: "opinions2-t3-r2",
            labelVi: "Ưu tiên môi trường yên tĩnh ít khói bụi vì mua sắm trực tuyến đã tiện",
            textVi: "Quan điểm của mình là giờ đặt đồ ăn hay mua sắm trực tuyến đều tiện, nên mình ưu tiên môi trường yên tĩnh, ít khói bụi hơn là ở ngay phố đông.",
            textEn: "My perspective is that food delivery and online shopping are so convenient now, so I prioritize a quiet, low-pollution environment over being on a busy street.",
            keywords: ["quan điểm", "trực tuyến", "ưu tiên", "yên tĩnh", "ít khói bụi"],
            npcReactionVi: "Đúng là dịch vụ giao hàng bây giờ khiến khoảng cách giữa ngoại ô và trung tâm bớt bất tiện hơn xưa nhiều.",
            nextTurnId: "opinions2-t4",
            scoreBonus: 10,
          },
        ],
      },
      {
        id: "opinions2-t4",
        npcTextVi:
          "Nghe bạn phân tích rất thực tế đấy! Vậy cuối tuần này bạn đã khoanh vùng được khu vực nào để đi xem nhà trực tiếp chưa?",
        npcEn:
          "Your analysis sounds very grounded! So have you narrowed down any neighborhoods to tour apartments in person this weekend?",
        mood: "engaged",
        hintsVi: [
          "Tóm gọn hướng quyết định bằng «Nói chung mình sẽ chọn...» hoặc kế hoạch đi khảo sát thực tế.",
          "Nhắc tới việc kiểm tra thời gian di chuyển thực tế trước khi ký hợp đồng.",
        ],
        expectedResponses: [
          {
            id: "opinions2-t4-r1",
            labelVi: "Chọn giải pháp trung hòa ở khu giáp ranh trung tâm",
            textVi: "Nói chung mình sẽ chọn giải pháp trung hòa: đi xem vài căn ở khu giáp trung tâm, cách công ty tầm hai mươi phút đi xe cho cân bằng giá và thời gian.",
            textEn: "Overall I'll take a middle ground: view a few apartments on the edge of downtown about twenty minutes from the office to balance price and commute.",
            keywords: ["nói chung", "trung hòa", "giáp trung tâm", "hai mươi phút", "cân bằng"],
            npcReactionVi: "Phương án quá thông minh! Chúc bạn cuối tuần tìm được căn hộ thật ưng ý nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
          {
            id: "opinions2-t4-r2",
            labelVi: "Xem khu gần xe buýt nhanh rồi chạy thử giờ cao điểm trước khi chốt",
            textVi: "Cuối tuần này mình đi xem hai khu ngoại ô gần tuyến xe buýt nhanh, rồi đầu tuần sau thử chạy xe giờ cao điểm xem mất bao lâu mới chốt hợp đồng ạ.",
            textEn: "This weekend I'll visit two suburban areas near the rapid bus line, then test the rush-hour commute early next week before signing a lease.",
            keywords: ["ngoại ô", "xe buýt nhanh", "giờ cao điểm", "chốt hợp đồng"],
            npcReactionVi: "Chạy thử đúng giờ cao điểm trước khi đặt cọc là kinh nghiệm cực kỳ khôn ngoan đấy. Cần mình gợi ý thêm khu nào cứ nhắn nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
        ],
      },
    ],
  },

  {
    id: "dlg-opinions-3",
    topicId: "opinions",
    titleVi: "Trao đổi quan điểm về việc dùng công cụ AI trong công việc",
    settingVi: "Trò chuyện sôi nổi giờ nghỉ trưa tại không gian làm việc chung về xu hướng ứng dụng công cụ AI trong công việc hàng ngày.",
    partnerName: "Thảo Nhi",
    partnerRole: "Chuyên viên phân tích nội dung",
    goalVi: "Đánh giá lợi ích và rủi ro của công cụ AI bằng lập luận hai chiều, xác định thế mạnh con người và đề xuất nguyên tắc sử dụng an toàn.",
    openingLineVi:
      "Dạo này phòng nào cũng bàn chuyện đưa trí tuệ nhân tạo vào công việc. Theo bạn công nghệ này thực sự giúp tăng năng suất hay chỉ là trào lưu nhất thời?",
    turns: [
      {
        id: "opinions3-t1",
        npcTextVi:
          "Dạo này phòng nào cũng bàn chuyện đưa trí tuệ nhân tạo vào công việc. Theo bạn công nghệ này thực sự giúp tăng năng suất hay chỉ là trào lưu nhất thời?",
        npcEn:
          "Lately every department is talking about bringing AI into their workflow. Do you think this technology genuinely boosts productivity or is it just a passing hype?",
        mood: "curious",
        hintsVi: [
          "Đưa ra lập trường rõ ràng bằng «Theo quan điểm của mình...» kèm ví dụ việc thực tế.",
          "Nhấn mạnh vai trò người dùng trong việc đặt yêu cầu và kiểm chứng kết quả.",
        ],
        expectedResponses: [
          {
            id: "opinions3-t1-r1",
            labelVi: "Khẳng định giá trị thực tế trong việc tóm tắt và tiết kiệm thời gian",
            textVi: "Theo quan điểm của mình, trí tuệ nhân tạo không chỉ là trào lưu. Nó giúp tóm tắt tài liệu và gợi ý dàn ý rất nhanh, tiết kiệm nhiều thời gian.",
            textEn: "From my perspective, AI isn't just a fad. It summarizes documents and drafts outlines super quickly, saving a lot of time.",
            keywords: ["quan điểm", "trí tuệ nhân tạo", "trào lưu", "tóm tắt tài liệu", "tiết kiệm"],
            npcReactionVi: "Đúng thật, khâu tổng hợp ghi chú họp hành mà có công cụ hỗ trợ thì đỡ tốn bao nhiêu công sức.",
            nextTurnId: "opinions3-t2",
            scoreBonus: 15,
          },
          {
            id: "opinions3-t1-r2",
            labelVi: "Cho rằng hiệu quả tùy vào cách đặt yêu cầu và kiểm chứng",
            textVi: "Mình nghĩ công nghệ này hữu ích, nhưng hiệu quả đến đâu còn tùy cách người dùng đặt yêu cầu và kiểm chứng kết quả chứ không thể giao khoán hoàn toàn.",
            textEn: "I think it's useful, though how effective it is depends on how users prompt it and verify results rather than delegating everything blindly.",
            keywords: ["hữu ích", "hiệu quả", "đặt yêu cầu", "kiểm chứng", "giao khoán"],
            npcReactionVi: "Chuẩn luôn, cùng một công cụ nhưng người hiểu nghiệp vụ dùng ra kết quả khác hẳn.",
            nextTurnId: "opinions3-t2",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "opinions3-t2",
        npcTextVi:
          "Đúng là nó hỗ trợ nhanh, nhưng nhiều người lo lạm dụng quá sẽ làm giảm tư duy phản biện và dễ lộ thông tin nội bộ. Bạn nhìn nhận rủi ro này thế nào?",
        npcEn:
          "It definitely speeds things up, yet many worry overusing it will erode critical thinking and risk leaking internal data. How do you view those risks?",
        mood: "analytical",
        hintsVi: [
          "Dùng «Mình đồng tình rằng...» hoặc «Một mặt ..., mặt khác ...» để phân tích rủi ro.",
          "Nhắc đến bảo mật dữ liệu khách hàng hoặc khâu kiểm duyệt của con người.",
        ],
        expectedResponses: [
          {
            id: "opinions3-t2-r1",
            labelVi: "Đồng tình về rủi ro sao chép máy móc và bảo mật dữ liệu",
            textVi: "Mình đồng tình rằng đó là hai rủi ro rất đáng ngại. Sao chép máy móc dễ làm yếu tư duy, và tuyệt đối không được đưa dữ liệu khách hàng lên hệ thống mở.",
            textEn: "I agree those are two serious risks. Copying blindly weakens thinking skills, and we must never upload client data to open systems.",
            keywords: ["đồng tình", "rủi ro", "sao chép", "dữ liệu khách hàng", "hệ thống mở"],
            npcReactionVi: "Nhất là chuyện bảo mật dữ liệu khách hàng, sơ sẩy một chút là hậu quả nghiêm trọng ngay.",
            nextTurnId: "opinions3-t3",
            scoreBonus: 15,
          },
          {
            id: "opinions3-t2-r2",
            labelVi: "Phân tích hai mặt giữa mở rộng ý tưởng và kiểm duyệt độ chính xác",
            textVi: "Một mặt công cụ thông minh giúp mở rộng ý tưởng tốt, mặt khác nó vẫn hay tạo thông tin thiếu chính xác nên con người phải là người kiểm duyệt cuối cùng.",
            textEn: "On one hand smart tools are great for brainstorming; on the other hand they still generate inaccurate information, so humans must remain the final reviewers.",
            keywords: ["một mặt", "ý tưởng", "mặt khác", "thiếu chính xác", "kiểm duyệt"],
            npcReactionVi: "Hoàn toàn đồng ý, dùng nó để gợi ý hướng đi rồi tự kiểm chứng lại từng chi tiết mới là cách làm bền vững.",
            nextTurnId: "opinions3-t3",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "opinions3-t3",
        npcTextVi:
          "Vậy theo bạn, trong vài năm tới kỹ năng nào của con người sẽ càng trở nên quan trọng hơn và khó bị máy móc thay thế nhất?",
        npcEn:
          "So in your opinion, over the next few years which human skills will become even more valuable and hardest for machines to replace?",
        mood: "thoughtful",
        hintsVi: [
          "Dùng «Theo tôi thì...» hoặc «Mình tin rằng...» để nhấn mạnh thế mạnh cốt lõi của con người.",
          "Kể tên hai đến ba kỹ năng như «thấu cảm», «đặt câu hỏi đúng trọng tâm», «chịu trách nhiệm».",
        ],
        expectedResponses: [
          {
            id: "opinions3-t3-r1",
            labelVi: "Nhấn mạnh thấu cảm, giao tiếp linh hoạt và đặt câu hỏi đúng trọng tâm",
            textVi: "Theo tôi thì khả năng thấu cảm, giao tiếp linh hoạt và tư duy đặt câu hỏi đúng trọng tâm sẽ ngày càng quý vì máy móc khó thay thế trải nghiệm thật.",
            textEn: "In my view empathy, flexible communication, and asking the right questions will become even more prized because machines cannot replace real lived experience.",
            keywords: ["theo tôi thì", "thấu cảm", "giao tiếp", "trọng tâm", "trải nghiệm thật"],
            npcReactionVi: "Đúng thế, hiểu cảm xúc thật của khách hàng và bối cảnh văn hóa vẫn là điều chỉ con người làm tốt nhất.",
            nextTurnId: "opinions3-t4",
            scoreBonus: 15,
          },
          {
            id: "opinions3-t3-r2",
            labelVi: "Nhấn mạnh đánh giá bối cảnh, phối hợp nhóm và chịu trách nhiệm",
            textVi: "Mình tin rằng năng lực đánh giá bối cảnh thực tế, phối hợp nhóm và chịu trách nhiệm cho quyết định cuối cùng vẫn luôn là thế mạnh cốt lõi của con người.",
            textEn: "I believe assessing real-world context, collaborating across teams, and owning the final decision will always remain humanity's core strengths.",
            keywords: ["đánh giá", "bối cảnh thực tế", "phối hợp nhóm", "chịu trách nhiệm", "cốt lõi"],
            npcReactionVi: "Rất thuyết phục! Máy móc có thể đề xuất mười phương án nhưng người chốt và chịu trách nhiệm vẫn là chúng ta.",
            nextTurnId: "opinions3-t4",
            scoreBonus: 15,
          },
        ],
      },
      {
        id: "opinions3-t4",
        npcTextVi:
          "Góc nhìn của bạn sắc sảo thật đấy! Nếu nhóm mình xây dựng bộ quy tắc dùng công nghệ này cho an toàn và hiệu quả, bạn đề xuất nguyên tắc đầu tiên là gì?",
        npcEn:
          "Your perspective is really sharp! If our team drafts guidelines to use this technology safely and effectively, what would be your number-one rule?",
        mood: "engaged",
        hintsVi: [
          "Tóm lược một nguyên tắc rõ ràng bằng «Mình đề xuất...» hoặc «Nói chung là...».",
          "Kết hợp tính minh bạch, bảo mật dữ liệu và kiểm chứng trước khi gửi đi.",
        ],
        expectedResponses: [
          {
            id: "opinions3-t4-r1",
            labelVi: "Coi AI là trợ lý, luôn bảo mật dữ liệu và kiểm chứng số liệu",
            textVi: "Mình đề xuất coi trí tuệ nhân tạo là trợ lý hỗ trợ chứ không thay thế người phụ trách, luôn bảo mật dữ liệu và kiểm chứng số liệu trước khi gửi đi.",
            textEn: "I propose treating AI as an assistant rather than a replacement for the owner, always safeguarding data and fact-checking numbers before sending anything out.",
            keywords: ["đề xuất", "trợ lý hỗ trợ", "bảo mật dữ liệu", "kiểm chứng", "số liệu"],
            npcReactionVi: "Nguyên tắc ngắn gọn mà bao quát hết các điểm cốt lõi luôn! Hôm nào họp nhóm mình cùng đưa ý này vào thảo luận nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
          {
            id: "opinions3-t4-r2",
            labelVi: "Tổ chức chia sẻ định kỳ cách dùng hiệu quả kèm danh mục bảo mật",
            textVi: "Nói chung là nên minh bạch và học hỏi cùng nhau, mình đề xuất nhóm mở buổi chia sẻ định kỳ cách dùng hiệu quả kèm danh sách thông tin cần bảo mật.",
            textEn: "Overall we should stay transparent and learn together — I suggest regular team sessions sharing effective workflows alongside a list of confidential data to protect.",
            keywords: ["nói chung là", "minh bạch", "chia sẻ định kỳ", "hiệu quả", "bảo mật"],
            npcReactionVi: "Ý tưởng vừa cởi mở vừa an toàn quá! Cảm ơn cuộc trao đổi rất thú vị trưa nay nhé!",
            nextTurnId: null,
            scoreBonus: 15,
          },
        ],
      },
    ],
  },
];
