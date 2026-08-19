// 1. Define your COPY object normally with 'as const'
export const COPY = {
  ar: {
    dir: "rtl",
    brand: "كبسولة تحول",
    tagline: "منصتك نحو مستقبل تقني أفضل، دورة واحدة في كل مرة.",
    social: ["Google", "LinkedIn"],
    nav: {
      home: "الرئيسية",
      courses: "الدورات",
      bootcamps: "المعسكرات",
      companies: "الشركات",
      portal: "بوابة الأعضاء",
      about: "من نحن",
      contact: "تواصل معنا"
    },
    tabs: {
      login: "تسجيل الدخول",
      signup: "إنشاء حساب",
    },
    footer: {
      desc: "منصة سعودية تربط الطلاب بفرص التدريب العملي، وتبني جيلاً جاهزاً لسوق العمل المالي والتقني.",
      quickLinks: "روابط سريعة",
      home: "الرئيسية",
      courses: "الدورات والمسارات",
      howItWorks: "كيف تعمل المنصة",
      social: "التواصل الاجتماعي",
      newsletter: "النشرة البريدية",
      emailPh: "بريدك الإلكتروني",
      subscribe: "اشترك",
      copyright1: "© ٢٠٢٦ كبسولة تحول. جميع الحقوق محفوظة.",
      copyright2: "Copyright © 2026 by CS – GC. جميع الحقوق الفكرية محفوظة.",
      contact: "تواصل معنا",
    },
    ui: {
      defaultLoading: "جاري جلب البيانات والتأكد من الاتصال...0",
    },
    admin: {
      loading: "جاري تحميل لوحة تحكم الأدمن...",
      hero: {
        title: "لوحة تحكم المسؤول",
        subtitle: "إدارة المستخدمين والدورات ومراجعة الطلبات."
      },
      stats: {
        activeUsers: "المستخدمون النشطون",
        totalCourses: "إجمالي الدورات",
        pendingReports: "الطلبات المعلقة",
        serverStatus: "حالة الخادم"
      },
      table: {
        title: "طلبات الدورات",
        colCourse: "الدورة",
        colTrainer: "المدرب",
        colDuration: "المدة",
        colStatus: "الحالة",
        colAction: "الإجراء"
      },
      actions: {
        pending: "قيد المراجعة",
        approved: "تمت الموافقة",
        approveBtn: "موافقة",
        approvedLabel: "تمت الموافقة"
      },
      mockData: {
        course1: "React Fundamentals",
        trainer1: "أحمد محمد",
        duration1: "22 أسبوع",
        course2: "UI/UX Design",
        trainer2: "سارة خالد",
        duration2: "15 أسبوع"
      }
    },
    studentProfile: {
      loading: "جاري تحميل الملف الشخصي...",
      backBtn: "← رجوع",
      editBtn: "تعديل الملف",
      successSave: "تم حفظ التعديلات بنجاح.",
      joinedPrefix: "انضم في",
      editSectionTitle: "تعديل البيانات",
      roles: {
        student: "طالب"
      },
      inputs: {
        fullName: "الاسم الكامل",
        avatar: "رابط الصورة الشخصية"
      },
      actions: {
        save: "حفظ",
        saving: "جاري الحفظ...",
        cancel: "إلغاء"
      },
      stats: {
        active: "الدورات الحالية",
        completed: "الدورات المكتملة",
        total: "إجمالي الدورات"
      }
    },
    platformOverview: {
      loading: "جاري تهيئة منصة كبسولة تحول...",
      catalogLoading: "جاري تحديث النتائج حسب الفئة المختارة...",
      errorPlatform: "غير قادر على تحميل بيانات نظرة عامة على المنصة في الوقت الحالي.",
      errorNetwork: "حدث خطأ غير متوقع أثناء الاتصال بالخادم الرئيسي.",
      hero: {
        badge: "منصة سعودية للتدريب والتطوير المهني المتقدم",
        title: "حيث يلتقي الطلاب والخبراء والشركات لبناء مستقبلاً مهنياً حقيقياً",
        subtitle: "دورات، معسكرات، وهواكاثونات مصممة خصيصاً لإعدادك لسوق العمل — سواء كنت متعلماً، مدرباً خبيراً، أو شركة توظف فرقاً بأكملها.",
        btnStart: "ابدأ التعلم مجاناً",
        btnBrowse: "تصفح الدورات التدريبية",
      },
      tracks: {
        btnStudent: "التسجيل كطالب في المنصة ←",
        btnTrainer: "تقديم طلب انضمام كمدرب خبير ←",
        btnCompany: "الاتصال كشريك أعمال ومؤسسات ←",
      },
      catalog: {
        label: "مكتبة الدورات التدريبية",
        title: "اكتشف مساراً تقنياً يناسب تطلعاتك وأهدافك",
        filterAll: "الكل",
        empty: "لا يوجد دورات تدريبية حالياً في هذه الفئة المحددة.",
        free: "مجاني",
        students: "طالب",
      },
      cta: {
        title: "هل تدير فريقاً أو تمتلك خبرة تقنية تستحق المشاركة؟",
        subtitle: "انضم كمدرب لمشاركة معرفتك وجني العوائد، أو كشريك أعمال لتصميم برامج تدريبية مخصصة لفريقك وترقية مهاراتهم.",
        btnTrainer: "انضم الآن كمدرب خبير",
        btnCompany: "حلول الشركات والمؤسسات",
      },
    },
    trainerDetails: {
      loading: "جاري تحميل بيانات ملف المدرب الخبير...",
      error: "فشل في تحميل تفاصيل المدرب، يرجى المحاولة لاحقاً.",
      heroTitle: "ملف المدرب الشخصي",
      heroSub: "مراجعة شاملة للسيرة الذاتية للمدرب، الدورات التقنية المسندة إليه، والمقاييس العالمية.",
      coursesTitle: "الدورات التدريبية القائمة",
      thName: "اسم الدورة التدريبية",
      thStudents: "عدد الطلاب المسجلين",
      thStatus: "الحالة الحالية",
      statusPub: "منشورة حياً",
      statusRev: "تحت المراجعة",
      reviewsTitle: "آراء وتقييمات الطلاب المتدربين",
      rateTitle: "قيم تجربتك الحالية مع المدرب الخبير",
      rateDesc: "انقر على النجوم لتحديث مقاييس التقييم الإجمالية فوراً وضمان الجودة الكلية للمنصة.",
      thankYou: "نشكرك على تقييمك الفعّال والدائم!",
      notRated: "لم يتم اختيار أي تقييم بعد. مرر وانقر للتجربة المباشرة!",
      textSelection: "اختيارك الحالي هو: ",
      contactTitle: "الاستشارة المباشرة وإرسال رسالة",
      contactSub: "هل لديك استفسار حول تدريب مخصص للشركات? أرسل رسالة مباشرة إلى صندوق المدرب.",
      msgSuccess: "تم إرسال استفسارك بنجاح إلى المدرب!",
      labelName: "الاسم الكامل",
      labelEmail: "البريد الإلكتروني للاستجابة",
      labelMsg: "تفاصيل رسالتك أو استشارتك",
      btnSend: "إرسال الرسالة الآن"
    },
    trainerProfile: {
      loading: "جاري تحميل الملف الشخصي...",
      hero: {
        title: "الملف الشخصي للمدرب",
        subtitle: "تعرّف على خبرات المدرب والدورات التي يقدمها."
      },
      data: {
        fullName: "أحمد محمد",
        specialization: "مدرب تطوير ويب",
        experienceVal: "5 سنوات خبرة",
        bio: "مدرب متخصص في تطوير تطبيقات الويب باستخدام React وJavaScript، وأسعى لمساعدة الطلاب على اكتساب المهارات العملية المطلوبة لسوق العمل."
      },
      profile: {
        experience: "الخبرة: "
      },
      stats: {
        coursesCount: "عدد الدورات",
        studentsCount: "عدد الطلاب",
        rating: "التقييم"
      },
      table: {
        cardTitle: "الدورات المنشورة",
        colTitle: "اسم الدورة",
        colStudents: "عدد الطلاب"
      }
    },
    coursesApproval: {
      hero: {
        title: "اعتماد وتعديلات دورات المدربين",
        subtitle: "مراجعة واعتماد الدورات الجديدة أو طلبات الحذف المقدمة من المدربين"
      },
      stats: {
        total: "إجمالي الكورسات",
        approved: "المعتمدة",
        pending: "جديد (قيد الانتظار)",
        deletionRequests: "طلبات الحذف"
      },
      table: {
        cardTitle: "جدول طلبات واعتمادات الدورات",
        colTitle: "اسم الدورة",
        colTrainer: "المدرب",
        colCategory: "التصنيف",
        colDuration: "المدة",
        colStatus: "الحالة",
        colActions: "الإجراءات",
        unitHours: " أسبوع",
        actionApprove: "اعتماد",
        actionReject: "رفض",
        actionConfirmDelete: "تأكيد الحذف",
        actionRejectDelete: "رفض الحذف",
        statusApproved: "معتمد",
        statusRejected: "مرفوض",
        statusPendingDeletion: "طلب حذف",
        approvedText: "معتمد",
        rejectedText: "مرفوض",
        pendingText: "قيد الانتظار"
      }
    },
    courseDetails: {
      loading: "جاري تحميل تفاصيل المعسكر والمناهج التقنية...",
      error: "فشل في تحميل بيانات الدورة المعروضة.",
      hero: {
        category: "التقنيات المتقدمة والذكاء الاصطناعي",
        title: "معسكر مطور الذكاء الاصطناعي التوليدي المتكامل والتحول الرقمي",
        subtitle: "أتقن بناء تطبيقات الذكاء الاصطناعي القابلة للتوسع، وضبط النماذج اللغوية الكبيرة (LLMs)، وقيادة التحول الرقمي للشركات باستخدام أحدث الإطارات التقنية.",
        rating: "4.9 (1,240 تقييم عالمي)",
        updated: "آخر تحديث 06/2026",
        level: "متوسط إلى متقدم",
        language: "العربية / الإنجليزية"
      },
      curriculum: {
        title: "المنهج وخطة المعسكر المتقدمة",
        subtitle: "استكشف خارطة الطريق الهيكلية والعملية المصممة لنقلك من الأساسيات البرمجية إلى هندسة الأنظمة الضخمة للشركات.",
        expandAll: "توسيع الكل",
        collapseAll: "إغلاق الكل",
        lessons: "دروس"
      },
      instructor: {
        sectionTitle: "تعرّف على موجّه المعسكر",
        name: "د. ريان القحطاني",
        role: "كبير مهندسي الذكاء الاصطناعي ومستشار التحول الرقمي",
        bio: "على مدى أكثر من 15 عاماً من الخبرة العملية، قاد الدكتور ريان مشاريع كبرى لنشر أنظمة الذكاء الاصطناعي في نخبة من مراكز الحوسبة السحابية في وادي السيليكون والمملكة العربية السعودية.",
        rating: "4.9 تقييم المدرب",
        students: "+18,500 طالب وطالبة",
        courses: "7 معسكرات تقنية عميقة"
      },
      overview: {
        title: "ما الذي ستتقنه في هذا المعسكر",
        description: "يجمع هذا المعسكر النخبي بين هندسة البرمجيات المتقدمة والذكاء الاصطناعي التوليدي، مما يوفر لك خطوط إنتاج وتطبيق برمجية حية لترقية قدراتك التقنية والهندسية بالكامل."
      },
      requirements: {
        title: "المتطلبات المسبقة للانضمام",
        subtitle: "يرجى مراجعة الخلفية التقنية والمواصفات اللازمة لضمان تحقيق أقصى استفادة ممكنة من غرف المعمل والتطبيق المتقدم."
      },
      enrollment: {
        price: "1,899 ر.س",
        originalPrice: "3,499 ر.س",
        discount: "خصم 45%",
        title: "جاهز لبدء رحلة التحول؟",
        btnText: "احجز مقعدك الآن",
        timer: "ينتهي التسجيل خلال: 04:12:45"
      }
    },
    coursesOverview: {
      hero: {
        eyebrow: "الدورات",
        title: "استكشف جميع الدورات",
        desc: "اختر الدورة المناسبة وابدأ رحلتك التعليمية.",
        cta: "ابدأ الآن",
        ctaGhost: "عرض الكل"
      },
      searchPlaceholder: "ابحث عن دورة...",
      filters: {
        category: "التصنيف",
        price: "السعر",
        duration: "المدة",
        clear: "إزالة الفلاتر"
      },
      filterData: {
        categories: [
          { label: "الكل", count: 8 },
          { label: "برمجة", count: 3 },
          { label: "تصميم", count: 1 },
          { label: "أمن سيبراني", count: 1 }
        ],
        prices: [
          { label: "الكل", count: 8 },
          { label: "مجاني", count: 4 },
          { label: "مدفوع", count: 4 }
        ],
        durations: [
          { label: "الكل", count: 8 },
          { label: "أقل من 10 ساعات", count: 0 },
          { label: "10 - 20 ساعة", count: 1 },
          { label: "20 - 30 ساعة", count: 1 },
          { label: "30 - 40 ساعة", count: 1 },
          { label: "40 ساعة فأكثر", count: 1 }
        ],
      },
      mockCourses: [
        { title: "React Bootcamp", desc: "تعلم React من الصفر.", instructor: "أحمد محمد" },
        { title: "UI/UX Design", desc: "أساسيات تصميم واجهات المستخدم.", instructor: "سارة علي" },
        { title: "Python", desc: "برمجة Python للمبتدئين.", instructor: "محمد خالد" },
        { title: "Cyber Security", desc: "مقدمة في الأمن السيبراني.", instructor: "عبدالله" },
        { title: "JavaScript", desc: "احتراف JavaScript.", instructor: "خالد" },
        { title: "Data Analysis", desc: "تحليل البيانات باستخدام Excel.", instructor: "نورة" },
        { title: "Digital Marketing", desc: "التسويق الرقمي.", instructor: "ريم" },
        { title: "Business", desc: "مبادئ إدارة الأعمال.", instructor: "فيصل" }
      ],
      results: {
        label: "8 دورات",
        sortLabel: "ترتيب حسب",
        sortOptions: ["الأحدث", "الأعلى تقييماً", "السعر"],
        badges: {
          new: "جديد",
          popular: "الأكثر طلباً"
        },
        hoursLabel: "ساعة",
        studentsLabel: "طالب",
        free: "مجاني",
        sar: "ر.س",
        viewDetails: "عرض التفاصيل",
        prev: "السابق",
        next: "التالي"
      }
    },
    coursesApproval: {
      hero: {
        title: "اعتماد الدورات",
        subtitle: "مراجعة الدورات المقدمة من المدربين واعتمادها أو رفضها."
      },
      stats: {
        total: "إجمالي الدورات",
        approved: "الدورات المعتمدة",
        pending: "بانتظار المراجعة"
      },
      table: {
        cardTitle: "قائمة الدورات",
        colTitle: "اسم الدورة",
        colTrainer: "المدرب",
        colCategory: "التصنيف",
        colDuration: "المدة",
        colStatus: "الحالة",
        colActions: "الإجراءات",
        unitHours: " أسبوع",
        actionApprove: "اعتماد",
        actionReject: "رفض",
        statusApproved: "تم الاعتماد",
        statusRejected: "تم الرفض"
      },
      data: {
        course1Title: "أساسيات الأمن السيبراني",
        course2Title: "تطوير تطبيقات React",
        trainer1: "أحمد محمد",
        trainer2: "سارة علي",
        catCyber: "الأمن السيبراني",
        catWeb: "تطوير الويب",
        approvedText: "معتمد",
        pendingText: "بانتظار المراجعة",
        rejectedText: "مرفوض"
      }
    },
    contractsApproval: {
      loading: "جاري تحميل طلبات الشركات...",
      hero: {
        title: "اعتماد طلبات الشركات",
        subtitle: "مراجعة طلبات الشراكة والتدريب المؤسسي المقدمة من الشركات واعتمادها أو رفضها."
      },
      stats: {
        total: "إجمالي الطلبات",
        approved: "الطلبات المعتمدة",
        pending: "بانتظار المراجعة"
      },
      table: {
        cardTitle: "قائمة طلبات الشركات",
        colCompany: "اسم الشركة",
        colContact: "جهة الاتصال",
        colTrainingType: "نوع التدريب",
        colTrainees: "عدد المتدربين",
        colStatus: "الحالة",
        colActions: "الإجراءات",
        actionApprove: "اعتماد",
        actionReject: "رفض",
        statusApproved: "تم الاعتماد",
        statusRejected: "تم الرفض"
      },
      data: {
        approvedText: "معتمد",
        pendingText: "بانتظار المراجعة",
        rejectedText: "مرفوض"
      }
    },
    contactPage: {
      title: "تواصل معنا الآن",
      subtitle: "نحن هنا لمساعدتك في قيادة تحولك الرقمي وبناء مسيرتك التقنية الفعالة والناجحة.",
      formName: "الاسم الكامل للاعتماد",
      formEmail: "البريد الإلكتروني الشخصي",
      formPhone: "رقم الجوال (ابدأ بـ 05 ويتكون من 10 أرقام)",
      formMessage: "تفاصيل استفسارك أو الرسالة",
      submitBtn: "إرسال الرسالة للمراجعة المباشرة"
    },
    contact: {
      hero: {
        badge: "تواصل معنا",
        title: "يسعدنا التواصل معك",
        subtitle: "إذا كان لديك أي سؤال أو اقتراح أو استفسار، لا تتردد في مراسلتنا."
      },
      info: {
        emailTitle: "البريد الإلكتروني",
        emailDesc: "راسلنا في أي وقت",
        emailValue: "support@capsule.sa",
        locationTitle: "الموقع",
        locationDesc: "مقر المنصة",
        locationValue: "المملكة العربية السعودية",
        hoursTitle: "ساعات العمل",
        hoursDesc: "الأحد - الخميس",
        hoursValue: "8:00 ص - 5:00 م"
      },
      form: {
        title: "أرسل رسالة",
        fullName: "الاسم الكامل",
        fullNamePlaceholder: "اكتب اسمك",
        email: "البريد الإلكتروني",
        emailPlaceholder: "example@email.com",
        phone: "رقم الجوال",
        phonePlaceholder: "05XXXXXXXX",
        errPhone: "يجب أن يبدأ رقم الجوال بـ 05 ويتكون من 10 أرقام",
        subject: "الموضوع",
        subjectPlaceholder: "عنوان الرسالة",
        category: "التصنيف",
        categorySelect: "اختر التصنيف",
        cat1: "المعسكرات",
        cat2: "الدعم الفني",
        cat3: "الشراكات",
        cat4: "أخرى",
        message: "الرسالة",
        messagePlaceholder: "اكتب رسالتك هنا...",
        submitBtn: "إرسال",
        loadingBtn: "جارٍ الإرسال...",
        alertTitle: "تم الإرسال",
        alertDesc: "تم استلام رسالتك وسنتواصل معك قريبًا.",
        errRequired: "هذا الحقل مطلوب.",
        errEmail: "البريد الإلكتروني غير صحيح.",
        errMinMsg: "يجب أن تحتوي الرسالة على 20 حرفًا على الأقل",
        errMinName: "Name must be at least 3 characters."
      }
    },
    login: {
      title: "تسجيل الدخول",
      subtitle: "سجّل الدخول للمتابعة إلى حسابك.",
      email: "البريد الإلكتروني",
      emailPh: "أدخل بريدك الإلكتروني",
      password: "كلمة المرور",
      passwordPh: "أدخل كلمة المرور",
      remember: "تذكرني",
      forgot: "نسيت كلمة المرور؟",
      submit: "تسجيل الدخول",
      or: "أو",
      noAccount: "ليس لديك حساب؟",
      switchLink: "أنشئ حسابًا"
    },
    signup: {
      title: "إنشاء حساب",
      subtitle: "أنشئ حسابًا جديدًا للبدء.",
      name: "الاسم الكامل",
      namePh: "أدخل اسمك الكامل",
      email: "البريد الإلكتروني",
      emailPh: "أدخل بريدك الإلكتروني",
      password: "كلمة المرور",
      passwordPh: "أدخل كلمة المرور",
      role: "نوع الحساب",
      roleOptions: ["طالب", "مدرب", "شركة"],
      terms: "أوافق على الشروط والأحكام",
      submit: "إنشاء حساب",
      or: "أو",
      haveAccount: "لديك حساب بالفعل؟",
      switchLink: "تسجيل الدخول"
    },
    strengthLabel: "قوة كلمة المرور",
    strength: ["ضعيفة", "متوسطة", "قوية"],
    passwordHint: "استخدم 8 أحرف على الأقل مع أرقام ورمز.",
    studentDashboard: {
      loading: "جاري تحميل لوحة تحكم الطالب...",
      errorProfile: "تعذر تحميل بيانات الطالب.",
      errorNetwork: "حدث خطأ أثناء الاتصال بالخادم.",
      hero: {
        badge: "لوحة الطالب",
        fallbackName: "طالب",
        welcomePrefix: "مرحباً",
        welcomeSuffix: "",
        subtitle: "تابع دوراتك وتقدمك وإشعاراتك من مكان واحد.",
        viewProfile: "عرض الملف الشخصي"
      },
      stats: {
        activeCourses: "الدورات الحالية",
        completedCourses: "الدورات المكتملة",
        unreadNotifs: "الإشعارات الجديدة",
        affiliation: "الجهة",
        independent: "مستقل"
      },
      resume: {
        title: "استكمال التعلم",
        empty: "لا توجد دورات حالياً.",
        browseBtn: "استعرض الدورات",
        completedProgress: "مكتمل",
        continueBtn: "متابعة",
        certBtn: "عرض الشهادة"
      },
      notifications: {
        title: "الإشعارات",
        empty: "لا توجد إشعارات."
      },
      mockData: {
        course1Title: "أساسيات React",
        course1Cat: "تطوير الويب",
        course1Dur: "6 ساعات",
        course2Title: "مقدمة في UI/UX",
        course2Cat: "التصميم",
        course2Dur: "4 ساعات",
        notif1Title: "تم قبول تسجيلك",
        notif1Msg: "تم قبولك في الدورة بنجاح.",
        notif2Title: "تهانينا",
        notif2Msg: "لقد أكملت الدورة الأولى."
      }
    },
    trainerDashboard: {
      loading: "جاري تحميل لوحة تحكم المدرب...",
      hero: {
        badge: "لوحة المدرب",
        title: "مرحبًا بك في لوحة المدرب",
        subtitle: "إدارة دوراتك، ومتابعة الطلاب، وإنشاء برامج تدريبية جديدة."
      },
      stats: {
        payout: "إجمالي الأرباح",
        currency: "ر.س",
        activeStudents: "الطلاب النشطون",
        studentLabel: "طالب",
        accountStatus: "حالة الحساب",
        verified: "موثق"
      },
      form: {
        title: "إنشاء دورة تدريبية جديدة",
        labels: {
          title: "عنوان الدورة",
          price: "السعر",
          duration: "مدة الدورة (بالأسابيع)",
          maxStudents: "الحد الأقصى للطلاب",
          videoDuration: "مدة الفيديو (بالدقائق)",
          requirements: "المتطلبات"
        },
        placeholders: {
          title: "أدخل عنوان الدورة",
          requirements: "اكتب متطلبات الدورة..."
        },
        submitBtn: "إنشاء الدورة"
      },
      messages: {
        valErrorLength: "يجب أن تكون المتطلبات 20 حرفًا على الأقل.",
        successPrefix: "تم إنشاء الطلب بنجاح. رقم التذكرة: ",
        genericError: "حدث خطأ، حاول مرة أخرى."
      }
    },
    businessForm: {
      hero: {
        title: "طلب شراكة مع شركة",
        subtitle: "ملأ النموذج التالي وسيتواصل معك فريق كبسولة تحول."
      },
      form: {
        title: "بيانات الشركة",
        successMsg: "تم إرسال الطلب بنجاح، سيتم التواصل معكم قريبًا."
      },
      inputs: {
        companyName: "اسم الشركة",
        contactPerson: "اسم مسؤول التواصل",
        email: "البريد الإلكتروني",
        phone: "رقم الجوال",
        trainingType: "نوع التدريب",
        selectType: "اختر نوع التدريب",
        type1: "دورة تدريبية",
        type2: "معسكر تدريبي",
        type3: "ورشة عمل",
        trainees: "عدد المتدربين",
        startDate: "تاريخ البدء",
        notes: "ملاحظات إضافية",
        placeholderNotes: "اكتب أي تفاصيل إضافية...",
        submitBtn: "إرسال الطلب"
      }
    }
  },

  en: {
    dir: "ltr",
    brand: "Capsule Tahawul",
    tagline: "Your platform towards a better tech future, one course at a time.",
    social: ["Google", "LinkedIn"],
    nav: {
      home: "Home",
      courses: "Courses",
      bootcamps: "Bootcamps",
      companies: "Companies",
      portal: "Members Portal",
      about: "About Us",
      contact: "Contact"
    },
    tabs: {
      login: "Sign In",
      signup: "Sign Up",
    },
    footer: {
      desc: "A Saudi platform connecting students with practical training opportunities, building a generation ready for the financial and technical labor market.",
      quickLinks: "Quick Links",
      home: "Home",
      courses: "Courses & Tracks",
      howItWorks: "How It Works",
      social: "Social Media",
      newsletter: "Newsletter",
      emailPh: "Your Email Address",
      subscribe: "Subscribe",
      copyright1: "© 2026 Capsule Tahawul. All rights reserved.",
      copyright2: "Copyright © 2026 by CS – GC. All intellectual property rights reserved.",
      contact: "Contact Us",
    },
    ui: {
      defaultLoading: "Fetching database elements and checking connection pipeline...",
    },
    admin: {
      loading: "Loading admin dashboard...",
      hero: {
        title: "Admin Dashboard",
        subtitle: "Manage users, courses and review requests."
      },
      stats: {
        activeUsers: "Active Users",
        totalCourses: "Total Courses",
        pendingReports: "Pending Reports",
        serverStatus: "Server Status"
      },
      table: {
        title: "Course Requests",
        colCourse: "Course",
        colTrainer: "Trainer",
        colDuration: "Duration",
        colStatus: "Status",
        colAction: "Action"
      },
      actions: {
        pending: "Pending",
        approved: "Approved",
        approveBtn: "Approve",
        approvedLabel: "Approved"
      },
      mockData: {
        course1: "React Fundamentals",
        trainer1: "Ahmed Mohammed",
        duration1: "22 Weeks",
        course2: "UI/UX Design",
        trainer2: "Sarah Khalid",
        duration2: "15 Weeks"
      }
    },
    studentProfile: {
      loading: "Loading profile...",
      backBtn: "← Back",
      editBtn: "Edit Profile",
      successSave: "Changes saved successfully.",
      joinedPrefix: "Joined",
      editSectionTitle: "Edit Information",
      roles: {
        student: "Student"
      },
      inputs: {
        fullName: "Full Name",
        avatar: "Avatar URL"
      },
      actions: {
        save: "Save",
        saving: "Saving...",
        cancel: "Cancel"
      },
      stats: {
        active: "Active Courses",
        completed: "Completed Courses",
        total: "Total Courses"
      }
    },
    platformOverview: {
      loading: "Preparing the Capsule Tahawul portal...",
      catalogLoading: "Updating results for the selected category...",
      errorPlatform: "Unable to load platform overview data at this time.",
      errorNetwork: "An unexpected error occurred while connecting to the server.",
      hero: {
        badge: "Saudi platform for training and professional development",
        title: "Where students, experts, and companies meet to build a real professional future",
        subtitle: "Courses, bootcamps, and hackathons designed to prepare you for the labor market — whether you are a learner, an expert trainer, or a company hiring entire teams.",
        btnStart: "Start learning for free",
        btnBrowse: "Browse courses",
      },
      tracks: {
        btnStudent: "Register as a student ←",
        btnTrainer: "Apply as a trainer ←",
        btnCompany: "Connect as a business partner ←",
      },
      catalog: {
        label: "Course Library",
        title: "Discover a path that fits your goals",
        filterAll: "All",
        empty: "There are currently no courses in this category.",
        free: "Free",
        students: "students",
      },
      cta: {
        title: "Do you manage a team or have expertise worth sharing?",
        subtitle: "Join as a trainer to share your knowledge, or as a business partner to design custom training programs for your team.",
        btnTrainer: "Join as a trainer",
        btnCompany: "Corporate solutions",
      },
    },
    trainerDetails: {
      loading: "Loading trainer profile data...",
      error: "Failed to load trainer details.",
      heroTitle: "Trainer Profile",
      heroSub: "Comprehensive review of trainer biographies, assigned technical courses, and global metrics.",
      coursesTitle: "Training Courses",
      thName: "Course Name",
      thStudents: "Number of Students",
      thStatus: "Status",
      statusPub: "Published",
      statusRev: "Under Review",
      reviewsTitle: "Students Feedbacks & Reviews",
      rateTitle: "Rate Your Experience with the Trainer",
      rateDesc: "Click on the stars to instantly update the overall evaluation metrics.",
      thankYou: "Thank you for your active feedback!",
      notRated: "No rating selected yet. Hover and click to test!",
      textSelection: "Your current selection: ",
      contactTitle: "Direct Consultation & Message",
      contactSub: "Have a corporate training inquiry? Drop a message directly to the trainer.",
      msgSuccess: "Your inquiry has been dispatched successfully!",
      labelName: "Full Name",
      labelEmail: "Email Address",
      labelMsg: "Your Message",
      btnSend: "Send Message Now"
    },
    trainerProfile: {
      loading: "Loading trainer profile...",
      hero: {
        title: "Trainer Profile",
        subtitle: "Learn more about the trainer and their published courses."
      },
      data: {
        fullName: "Ahmed Mohammed",
        specialization: "Web Development Trainer",
        experienceVal: "5 Years Experience",
        bio: "A web development trainer specializing in React and JavaScript, helping students gain practical skills for the job market."
      },
      profile: {
        experience: "Experience: "
      },
      stats: {
        coursesCount: "Courses",
        studentsCount: "Students",
        rating: "Rating"
      },
      table: {
        cardTitle: "Published Courses",
        colTitle: "Course Title",
        colStudents: "Students"
      }
    },
    coursesApproval: {
      hero: {
        title: "Courses & Bootcamp Approvals",
        subtitle: "Review, approve new courses or process deletion requests submitted by trainers"
      },
      stats: {
        total: "Total Courses",
        approved: "Approved",
        pending: "New Pending",
        deletionRequests: "Deletion Requests"
      },
      table: {
        cardTitle: "Course Submissions & Deletion Requests",
        colTitle: "Course Title",
        colTrainer: "Trainer",
        colCategory: "Category",
        colDuration: "Duration",
        colStatus: "Status",
        colActions: "Actions",
        unitHours: " Wks",
        actionApprove: "Approve",
        actionReject: "Reject",
        actionConfirmDelete: "Approve Deletion",
        actionRejectDelete: "Reject Deletion",
        statusApproved: "Approved",
        statusRejected: "Rejected",
        statusPendingDeletion: "Deletion Requested",
        approvedText: "Approved",
        rejectedText: "Rejected",
        pendingText: "Pending"
      }
    },
    courseDetails: {
      loading: "Loading bootcamp details and technical syllabus...",
      error: "Failed to load course details.",
      hero: {
        category: "Advanced Tech & Artificial Intelligence",
        title: "Full-Stack Generative AI & Digital Transformation Bootcamp",
        subtitle: "Master building scalable AI applications, fine-tuning LLMs, and leading enterprise-level digital transformations using cutting-edge modern frameworks.",
        rating: "4.9 (1,240 global reviews)",
        updated: "Last updated 06/2026",
        level: "Intermediate to Advanced",
        language: "Arabic / English"
      },
      curriculum: {
        title: "Bootcamp Curriculum",
        subtitle: "Explore the structured operational roadmap designed to take you from foundational engineering to high-tier enterprise architecture.",
        expandAll: "Expand All",
        collapseAll: "Collapse All",
        lessons: "Lessons"
      },
      instructor: {
        sectionTitle: "Meet Your Instructor",
        name: "Dr. Rayan Al-Qahtani",
        role: "Chief AI Architect & Digital Transformation Advisor",
        bio: "With over 15 years of industry experience, Dr. Rayan has directed core enterprise AI system deployments across elite cloud technology hubs in Silicon Valley and Saudi Arabia.",
        rating: "4.9 Instructor Rating",
        students: "18,500+ Students",
        courses: "7 Deep-Tech Bootcamps"
      },
      overview: {
        title: "What You Will Master",
        description: "This elite bootcamp bridges advanced software architecture with generative artificial intelligence, providing hands-on pipelines to upgrade your technical engineering capabilities completely."
      },
      requirements: {
        title: "Bootcamp Prerequisites",
        subtitle: "Please review the technical background and hardware requirements needed to ensure an optimal learning experience."
      },
      enrollment: {
        price: "$499",
        originalPrice: "$899",
        discount: "45% OFF",
        title: "Ready to Transform?",
        btnText: "Secure Your Spot",
        timer: "Enrollment closes in: 04:12:45"
      }
    },
    coursesOverview: {
      hero: {
        eyebrow: "Courses",
        title: "Explore Courses",
        desc: "Choose the right course and start learning.",
        cta: "Start Now",
        ctaGhost: "View All"
      },
      searchPlaceholder: "Search courses...",
      filters: {
        category: "Category",
        price: "Price",
        duration: "Duration",
        clear: "Clear Filters"
      },
      filterData: {
        categories: [
          { label: "All", count: 8 },
          { label: "Programming", count: 3 },
          { label: "Design", count: 1 },
          { label: "Cybersecurity", count: 1 }
        ],
        prices: [
          { label: "All", count: 8 },
          { label: "Free", count: 4 },
          { label: "Paid", count: 4 }
        ],
        durations: [
          { label: "All", count: 8 },
          { label: "Less than 10 Hours", count: 0 },
          { label: "10 - 20 Hours", count: 1 },
          { label: "20 - 30 Hours", count: 1 },
          { label: "30 - 40 Hours", count: 1 },
          { label: "40 Hours & Above", count: 1 }
        ],
      },
      mockCourses: [
        { title: "React Bootcamp", desc: "Learn React from scratch.", instructor: "Ahmed Mohammed" },
        { title: "UI/UX Design", desc: "User Interface Design.", instructor: "Sarah Ali" },
        { title: "Python", desc: "Python for beginners.", instructor: "Mohammed Khalid" },
        { title: "Cyber Security", desc: "Cyber Security Basics.", instructor: "Abdullah" },
        { title: "JavaScript", desc: "Master JavaScript.", instructor: "Khalid" },
        { title: "Data Analysis", desc: "Excel Data Analysis.", instructor: "Noura" },
        { title: "Digital Marketing", desc: "Digital Marketing.", instructor: "Reem" },
        { title: "Business", desc: "Business Fundamentals.", instructor: "Faisal" }
      ],
      results: {
        label: "8 Courses",
        sortLabel: "Sort By",
        sortOptions: ["Newest", "Highest Rated", "Price"],
        badges: {
          new: "New",
          popular: "Popular"
        },
        hoursLabel: "hrs",
        studentsLabel: "Students",
        free: "Free",
        sar: "SAR",
        viewDetails: "View Details",
        prev: "Previous",
        next: "Next"
      }
    },
    coursesApproval: {
      hero: {
        title: "Course Approval",
        subtitle: "Review trainer courses and approve or reject them."
      },
      stats: {
        total: "Total Courses",
        approved: "Approved",
        pending: "Pending"
      },
      table: {
        cardTitle: "Courses List",
        colTitle: "Course",
        colTrainer: "Trainer",
        colCategory: "Category",
        colDuration: "Duration",
        colStatus: "Status",
        colActions: "Actions",
        unitHours: " wks",
        actionApprove: "Approve",
        actionReject: "Reject",
        statusApproved: "Approved",
        statusRejected: "Rejected"
      },
      data: {
        course1Title: "Cyber Security Basics",
        course2Title: "React Development",
        trainer1: "Ahmed Mohammed",
        trainer2: "Sarah Ali",
        catCyber: "Cyber Security",
        catWeb: "Web Development",
        approvedText: "Approved",
        pendingText: "Pending",
        rejectedText: "Rejected"
      }
    },
    contractsApproval: {
      loading: "Loading contract requests...",
      hero: {
        title: "Contract Requests Approval",
        subtitle: "Review B2B partnership and corporate training requests submitted by companies and approve or reject them."
      },
      stats: {
        total: "Total Requests",
        approved: "Approved",
        pending: "Pending"
      },
      table: {
        cardTitle: "Company Requests List",
        colCompany: "Company Name",
        colContact: "Contact",
        colTrainingType: "Training Type",
        colTrainees: "Trainees",
        colStatus: "Status",
        colActions: "Actions",
        actionApprove: "Approve",
        actionReject: "Reject",
        statusApproved: "Approved",
        statusRejected: "Rejected"
      },
      data: {
        approvedText: "Approved",
        pendingText: "Pending",
        rejectedText: "Rejected"
      }
    },
    contactPage: {
      title: "Get in Touch",
      subtitle: "We are here to help you deploy your digital shift. Reach out anytime.",
      formName: "Your Full Name",
      formEmail: "Email Address",
      formPhone: "Phone Number (Must start with 05 and contain 10 digits)",
      formMessage: "Message Description",
      submitBtn: "Send Message Now"
    },
    contact: {
      hero: {
        badge: "Contact Us",
        title: "We'd Love to Hear From You",
        subtitle: "Have a question, suggestion, or inquiry? Send us a message."
      },
      info: {
        emailTitle: "Email",
        emailDesc: "Reach us anytime",
        emailValue: "support@capsule.sa",
        locationTitle: "Location",
        locationDesc: "Platform Headquarters",
        locationValue: "Saudi Arabia",
        hoursTitle: "Working Hours",
        hoursDesc: "Sunday - Thursday",
        hoursValue: "8:00 AM - 5:00 PM"
      },
      form: {
        title: "Send a Message",
        fullName: "Full Name",
        fullNamePlaceholder: "Enter your name",
        email: "Email",
        emailPlaceholder: "example@email.com",
        phone: "Phone Number",
        phonePlaceholder: "05XXXXXXXX",
        errPhone: "Phone number must start with 05 and contain exactly 10 digits.",
        subject: "Subject",
        subjectPlaceholder: "Message subject",
        category: "Category",
        categorySelect: "Select Category",
        cat1: "Bootcamps",
        cat2: "Support",
        cat3: "Partnerships",
        cat4: "Other",
        message: "Message",
        messagePlaceholder: "Write your message...",
        submitBtn: "Send",
        loadingBtn: "Sending...",
        alertTitle: "Message Sent",
        alertDesc: "Your message has been received successfully.",
        errRequired: "This field is required.",
        errEmail: "Please enter a valid email.",
        errMinMsg: "Message must be at least 20 characters.",
        errMinName: "Name must be at least 3 characters."
      }
    },
    login: {
      title: "Sign In",
      subtitle: "Sign in to continue to your account.",
      email: "Email",
      emailPh: "Enter your email",
      password: "Password",
      passwordPh: "Enter your password",
      remember: "Remember me",
      forgot: "Forgot password?",
      submit: "Sign In",
      or: "Or",
      noAccount: "Don't have an account?",
      switchLink: "Create one"
    },
    signup: {
      title: "Sign Up",
      subtitle: "Create a new account to get started.",
      name: "Full Name",
      namePh: "Enter your full name",
      email: "Email",
      emailPh: "Enter your email",
      password: "Password",
      passwordPh: "Enter your password",
      role: "Account Type",
      roleOptions: ["Student", "Trainer", "Company"],
      terms: "I agree to the Terms and Conditions",
      submit: "Create Account",
      or: "Or",
      haveAccount: "Already have an account?",
      switchLink: "Sign In"
    },
    strengthLabel: "Password Strength",
    strength: ["Weak", "Medium", "Strong"],
    passwordHint: "Use at least 8 characters with numbers and a symbol.",
    studentDashboard: {
      loading: "Loading student dashboard...",
      errorProfile: "Failed to load student profile.",
      errorNetwork: "Network error occurred.",
      hero: {
        badge: "Student Dashboard",
        fallbackName: "Student",
        welcomePrefix: "Welcome",
        welcomeSuffix: "",
        subtitle: "Track your courses, progress and notifications in one place.",
        viewProfile: "View Profile"
      },
      stats: {
        activeCourses: "Active Courses",
        completedCourses: "Completed Courses",
        unreadNotifs: "Unread Notifications",
        affiliation: "Affiliation",
        independent: "Independent"
      },
      resume: {
        title: "Continue Learning",
        empty: "No courses found.",
        browseBtn: "Browse Courses",
        completedProgress: "Completed",
        continueBtn: "Continue",
        certBtn: "View Certificate"
      },
      notifications: {
        title: "Notifications",
        empty: "No notifications."
      },
      mockData: {
        course1Title: "React Fundamentals",
        course1Cat: "Web Development",
        course1Dur: "6 Hours",
        course2Title: "UI/UX Basics",
        course2Cat: "Design",
        course2Dur: "4 Hours",
        notif1Title: "Registration Accepted",
        notif1Msg: "You have successfully enrolled.",
        notif2Title: "Congratulations",
        notif2Msg: "You completed your first course."
      }
    },
    trainerDashboard: {
      loading: "Loading trainer dashboard...",
      hero: {
        badge: "Trainer Dashboard",
        title: "Welcome to your Trainer Dashboard",
        subtitle: "Manage your courses, students and create new training programs."
      },
      stats: {
        payout: "Total Payout",
        currency: "SAR",
        activeStudents: "Active Students",
        studentLabel: "Students",
        accountStatus: "Account Status",
        verified: "Verified"
      },
      form: {
        title: "Create New Course",
        labels: {
          title: "Course Title",
          price: "Price",
          duration: "Duration (Weeks)",
          maxStudents: "Maximum Students",
          videoDuration: "Video Duration (Minutes)",
          requirements: "Requirements"
        },
        placeholders: {
          title: "Enter course title",
          requirements: "Enter course requirements..."
        },
        submitBtn: "Create Course"
      },
      messages: {
        valErrorLength: "Requirements must contain at least 20 characters.",
        successPrefix: "Request created successfully. Ticket ID: ",
        genericError: "Something went wrong."
      }
    },
    businessForm: {
      hero: {
        title: "Company Partnership Request",
        subtitle: "Fill out the form below and our team will contact you shortly."
      },
      form: {
        title: "Company Information",
        successMsg: "Your request has been submitted successfully."
      },
      inputs: {
        companyName: "Company Name",
        contactPerson: "Contact Person",
        email: "Email",
        phone: "Phone Number",
        trainingType: "Training Type",
        selectType: "Select Training Type",
        type1: "Course",
        type2: "Bootcamp",
        type3: "Workshop",
        trainees: "Number of Trainees",
        startDate: "Preferred Start Date",
        notes: "Additional Notes",
        placeholderNotes: "Write any additional details...",
        submitBtn: "Submit Request"
      }
    }
  }
} as const satisfies Record<"ar" | "en", any>; 
// Using `any` on the Record values here acts as a structure check 
// while letting the individual values (like dir: "rtl" or "ltr") keep their strict types!