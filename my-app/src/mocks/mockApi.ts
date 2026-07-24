/**
 * Capsule Tahawul Mock API Layer
 * 
 * This file simulates a backend database and server processing environment.
 */

import { login, register, submitContact } from '../services/api';

// ============================================================================
// TYPES & INTERFACES DEFINITIONS
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: Record<string, string>;
}

export interface Topic {
  type: 'video' | 'code' | 'doc' | string;
  name: string;
  duration: string;
}

export interface CurriculumModule {
  id: number;
  week: string;
  title: string;
  duration: string;
  topics: Topic[];
}

export interface Requirement {
  id: 'tech' | 'hardware' | 'mindset' | string;
  title: string;
  desc: string;
  type: 'code' | 'cpu' | 'shield' | string;
}

export interface InstructorProfile {
  role: string;
  roleAr?: string;
  bio: string;
  bioAr?: string;
  avatarLabel: string;
  ratingText: string;
  studentsText: string;
  coursesText: string;
  skills: string[];
}

export interface Enrollment {
  features: string[];
  timer: string;
}

export interface CurriculumTranslation {
  title: string;
  subtitle: string;
  expandAll: string;
  collapseAll: string;
  lessons: string;
  modules: CurriculumModule[];
}

export interface RequirementsTranslation {
  title: string;
  subtitle: string;
  items: Requirement[];
}

export interface EnrollmentTranslation {
  price: string;
  originalPrice: string;
  discount: string | null;
  title: string;
  features: string[];
  btnText: string;
  timer: string;
}

export interface InstructorTranslation {
  sectionTitle: string;
  name: string;
  role: string;
  bio: string;
  stats: {
    rating: string;
    students: string;
    courses: string;
  };
  skills: string[];
}

export interface Course {
  id: number;
  title: string;
  titleAr?: string;
  category: string;
  description: string;
  subtitle: string;
  instructor: string;
  trainerId: string;
  price: number;
  originalPrice: number;
  discount: string | null;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  language: string;
  updated: string;
  rating: number;
  status: 'available' | 'coming_soon' | 'completed' | string;
  students: number;
  thumbnail: string;
  prerequisites: string[];
  outcomes: string[];
  instructorProfile: InstructorProfile;
  requirements: Requirement[];
  curriculum: CurriculumModule[];
  enrollment: Enrollment;
  
  translatedCurriculum?: CurriculumTranslation;
  translatedRequirements?: RequirementsTranslation;
  translatedEnrollment?: EnrollmentTranslation;
  translatedInstructor?: InstructorTranslation;
  currentLocale?: 'ar' | 'en';
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'Student' | 'Trainer' | 'Company' | 'Admin' | string;
  avatar: string;
  joinedAt: string;
  completedCourses: number;
  activeCourses: number;
  companyAffiliation?: string;
}

export interface CourseEnrollment {
  courseId: number; 
  progress: number;
  status: 'In Progress' | 'Completed' | string;
}

export interface Notification {
  notificationId: number;
  title: string;
  message: string;
  type: 'Account' | 'System' | 'Course' | string;
  isRead: boolean;
  createdAt: string;
}

export interface CourseModuleDetail {
  moduleId: number;
  title: string;
  status: 'Completed' | 'Unlocked' | 'Locked';
  videoUrl?: string;
  attachments?: Array<{ fileName: string; downloadUrl: string }>;
}

export interface TrainerProfile {
  trainerId: string;
  name: string;
  specialty: string;
  specialtyAr?: string;
  bio: string;
  bioAr?: string;
  email: string;
  phone: string;
  experience: number;
  avatarLetter: string;
  stats: {
    coursesCount: number;
    studentsCount: number;
    rating: number;
  };
  courses: Array<{
    id: number;
    name: string;
    nameAr?: string;
    students: number;
    status: 'published' | 'review' | string;
  }>;
  reviews: Array<{
    id: number;
    name: string;
    rating: number;
    date: string;
    comment: string;
  }>;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Trainer' | 'Company' | string;
  status: 'active' | 'suspended';
}

// ============================================================================
// HELPER UTILITIES
// ============================================================================

const delay = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

// ============================================================================
// SIMULATED IN-MEMORY DATABASE
// ============================================================================

let mockCourses: Course[] = [
  {
    id: 15,
    title: "React Bootcamp Deep Dive",
    titleAr: "معسكر React المتقدم",
    category: "Web Development",
    description: "Learn React from beginner to advanced with hands-on projects.",
    subtitle: "Master building production-ready React applications with hooks, state management, and real-world project architecture.",
    instructor: "Ahmed Mohammed",
    trainerId: "ahmed-mohammed",
    price: 250,
    originalPrice: 450,
    discount: "45% OFF",
    duration: "32 Hours",
    level: "Intermediate",
    language: "Arabic / English",
    updated: "06/2026",
    rating: 4.8,
    status: "available",
    students: 1240,
    thumbnail: "react-bootcamp.jpg",
    prerequisites: ["HTML", "CSS", "JavaScript"],
    outcomes: [
      "Build modern React applications",
      "Use React Hooks",
      "Manage application state",
      "Structure scalable component architecture",
      "Integrate REST APIs into React apps",
      "Deploy production-ready front-end projects"
    ],
    instructorProfile: {
      role: "Senior Front-End Engineer",
      roleAr: "مهندس أول واجهات أمامية",
      bio: "Ahmed has spent over 8 years building production React applications for startups and enterprises across the region.",
      bioAr: "يمتلك أحمد خبرة تتجاوز 8 سنوات في بناء تطبيقات React الإنتاجية للشركات الناشئة والمؤسسات الكبرى في المنطقة.",
      avatarLabel: "AM",
      ratingText: "4.8 Instructor Rating",
      studentsText: "1,240+ Students",
      coursesText: "3 Bootcamps",
      skills: ["React", "Hooks", "State Management", "REST APIs"]
    },
    requirements: [
      { id: "tech", title: "Technical Background", desc: "Basic knowledge of HTML, CSS, and JavaScript fundamentals.", type: "code" },
      { id: "hardware", title: "Hardware Setup", desc: "A laptop with at least 8GB RAM and a stable internet connection.", type: "cpu" },
      { id: "mindset", title: "Commitment & Mindset", desc: "Readiness to invest 8-10 hours per week on coding exercises and projects.", type: "shield" }
    ],
    curriculum: [
      { id: 1, week: "Week 1 - 2", title: "React Fundamentals & JSX", duration: "10 Hours",
        topics: [
          { type: "video", name: "Introduction to Components & JSX", duration: "40 mins" },
          { type: "code", name: "Hands-on: Building Your First Components", duration: "2 hours" },
          { type: "doc", name: "Reading: Component Lifecycle Overview", duration: "15 mins" }
        ] },
      { id: 2, week: "Week 3 - 4", title: "State, Props & Hooks", duration: "12 Hours",
        topics: [
          { type: "video", name: "useState & useEffect in Depth", duration: "50 mins" },
          { type: "code", name: "Lab: Building a Todo Application", duration: "3 hours" },
          { type: "code", name: "Project: Custom Hooks for Data Fetching", duration: "3 hours" }
        ] },
      { id: 3, week: "Week 5 - 6", title: "Routing & Production Deployment", duration: "10 Hours",
        topics: [
          { type: "video", name: "React Router & Protected Routes", duration: "45 mins" },
          { type: "code", name: "Capstone: Full Application Deployment", duration: "5 hours" }
        ] }
    ],
    enrollment: {
      features: ["4 Weeks Intensive", "Live Mentorship", "Job Guarantee Support", "Lifetime Access"],
      timer: "Enrollment closes in: 04:12:45"
    }
  },
  {
    id: 16,
    title: "AI & Machine Learning Fundamentals",
    titleAr: "أساسيات الذكاء الاصطناعي والتعلم الآلي",
    category: "Artificial Intelligence",
    description: "A hands-on introduction to AI and Machine Learning concepts using real datasets and Python.",
    subtitle: "Learn the core building blocks of AI and Machine Learning through practical, project-based lessons.",
    instructor: "Sara Ali",
    trainerId: "sara-ali",
    price: 0,
    originalPrice: 0,
    discount: "Free",
    duration: "12 Hours",
    level: "Beginner",
    language: "Arabic / English",
    updated: "06/2026",
    rating: 4.9,
    status: "available",
    students: 850,
    thumbnail: "ai-funds.jpg",
    prerequisites: ["Basic Python"],
    outcomes: [
      "Understand core Machine Learning concepts",
      "Work with real-world datasets in Python",
      "Train and evaluate simple ML models",
      "Understand the fundamentals of neural networks"
    ],
    instructorProfile: {
      role: "AI & Data Science Instructor",
      roleAr: "مدربة الذكاء الاصطناعي وعلوم البيانات",
      bio: "Sara has taught Machine Learning fundamentals to thousands of students, focusing on practical, project-first learning.",
      bioAr: "درّست سارة أساسيات التعلم الآلي لآلاف الطلاب، مع التركيز على التعلم العملي القائم على المشاريع.",
      avatarLabel: "SA",
      ratingText: "4.9 Instructor Rating",
      studentsText: "850+ Students",
      coursesText: "2 Bootcamps",
      skills: ["Python", "Machine Learning", "Data Analysis", "Neural Networks"]
    },
    requirements: [
      { id: "tech", title: "Technical Background", desc: "Basic familiarity with Python syntax and programming logic.", type: "code" },
      { id: "hardware", title: "Hardware Setup", desc: "A laptop with at least 8GB RAM to run Python notebooks smoothly.", type: "cpu" },
      { id: "mindset", title: "Commitment & Mindset", desc: "Readiness to invest 4-6 hours per week on exercises and mini projects.", type: "shield" }
    ],
    curriculum: [
      { id: 1, week: "Week 1", title: "Introduction to AI & ML", duration: "4 Hours",
        topics: [
          { type: "video", name: "What is Machine Learning?", duration: "30 mins" },
          { type: "doc", name: "Reading: Types of ML Problems", duration: "15 mins" }
        ] },
      { id: 2, week: "Week 2", title: "Working with Data", duration: "4 Hours",
        topics: [
          { type: "code", name: "Lab: Data Cleaning with Pandas", duration: "2 hours" }
        ] },
      { id: 3, week: "Week 3", title: "Building Your First Model", duration: "4 Hours",
        topics: [
          { type: "code", name: "Project: Training a Classification Model", duration: "3 hours" }
        ] }
    ],
    enrollment: {
      features: ["Self-Paced", "Community Support", "Certificate of Completion"],
      timer: "Open enrollment"
    }
  },
  {
    id: 17,
    title: "Cybersecurity Next-Gen Defense",
    titleAr: "الدفاع السيبراني للجيل القادم",
    category: "Cybersecurity",
    description: "Learn modern cybersecurity defense strategies to protect networks and systems from evolving threats.",
    subtitle: "Build practical skills in network defense, threat detection, and incident response.",
    instructor: "Abdullah Nasser",
    trainerId: "abdullah-nasser",
    price: 499,
    originalPrice: 699,
    discount: "28% OFF",
    duration: "40 Hours",
    level: "Advanced",
    language: "Arabic / English",
    updated: "07/2026",
    rating: 0,
    status: "coming_soon",
    students: 0,
    thumbnail: "cyber.jpg",
    prerequisites: ["Basic Networking"],
    outcomes: [
      "Understand modern attack vectors and threat models",
      "Configure firewalls and intrusion detection systems",
      "Perform basic incident response procedures",
      "Harden systems against common vulnerabilities"
    ],
    instructorProfile: {
      role: "Senior Cybersecurity Engineer",
      roleAr: "مهندس أول أمن سيبراني",
      bio: "Abdullah has over 10 years of experience securing enterprise infrastructure and leading incident response teams.",
      bioAr: "يمتلك عبدالله خبرة تفوق 10 سنوات في تأمين البنية التحتية للمؤسسات وقيادة فرق الاستجابة للحوادث الأمنية.",
      avatarLabel: "AN",
      ratingText: "New Instructor",
      studentsText: "0 Students (Coming Soon)",
      coursesText: "1 Bootcamp",
      skills: ["Network Security", "Incident Response", "Threat Detection", "Penetration Testing"]
    },
    requirements: [
      { id: "tech", title: "Technical Background", desc: "Basic understanding of networking concepts (IP, DNS, ports).", type: "code" },
      { id: "hardware", title: "Hardware Setup", desc: "A laptop capable of running a virtual lab environment (16GB RAM recommended).", type: "cpu" },
      { id: "mindset", title: "Commitment & Mindset", desc: "Readiness to invest 10-12 hours per week on labs and simulations.", type: "shield" }
    ],
    curriculum: [
      { id: 1, week: "Week 1 - 3", title: "Network Security Foundations", duration: "14 Hours",
        topics: [
          { type: "video", name: "Threat Landscape Overview", duration: "45 mins" },
          { type: "code", name: "Lab: Configuring Firewalls", duration: "3 hours" }
        ] },
      { id: 2, week: "Week 4 - 6", title: "Threat Detection & Monitoring", duration: "14 Hours",
        topics: [
          { type: "code", name: "Lab: Setting Up an IDS", duration: "4 hours" }
        ] },
      { id: 3, week: "Week 7 - 8", title: "Incident Response", duration: "12 Hours",
        topics: [
          { type: "code", name: "Capstone: Simulated Breach Response", duration: "6 hours" }
        ] }
    ],
    enrollment: {
      features: ["8 Weeks Intensive", "Hands-on Labs", "Industry Certificate"],
      timer: "Coming soon — join the waitlist"
    }
  },
  {
    id: 18,
    title: "Cloud Native Infrastructure",
    titleAr: "البنية التحتية السحابية الحديثة",
    category: "Cloud Computing",
    description: "Master cloud-native architecture, containers, and infrastructure automation on modern cloud platforms.",
    subtitle: "Design, deploy, and scale cloud-native infrastructure using industry-standard tools.",
    instructor: "Noura Al-Faisal",
    trainerId: "noura-alfaisal",
    price: 199,
    originalPrice: 199,
    discount: null,
    duration: "24 Hours",
    level: "Intermediate",
    language: "Arabic / English",
    updated: "05/2026",
    rating: 4.5,
    status: "completed",
    students: 430,
    thumbnail: "cloud.jpg",
    prerequisites: ["Linux Basics"],
    outcomes: [
      "Deploy applications using Docker containers",
      "Orchestrate workloads with Kubernetes basics",
      "Automate infrastructure with Infrastructure-as-Code",
      "Design scalable cloud-native architectures"
    ],
    instructorProfile: {
      role: "Cloud Solutions Architect",
      roleAr: "مهندسة معمارية للحلول السحابية",
      bio: "Noura has led cloud migration and infrastructure automation projects for enterprise clients across the Gulf region.",
      bioAr: "قادت نورة مشاريع ترحيل الأنظمة إلى السحابة وأتمتة البنية التحتية لعملاء المؤسسات في منطقة الخليج.",
      avatarLabel: "NF",
      ratingText: "4.5 Instructor Rating",
      studentsText: "430+ Students",
      coursesText: "2 Bootcamps",
      skills: ["Docker", "Kubernetes", "Cloud Architecture", "Infrastructure as Code"]
    },
    requirements: [
      { id: "tech", title: "Technical Background", desc: "Comfortable working with the Linux command line.", type: "code" },
      { id: "hardware", title: "Hardware Setup", desc: "A laptop with at least 8GB RAM able to run Docker containers.", type: "cpu" },
      { id: "mindset", title: "Commitment & Mindset", desc: "Readiness to invest 6-8 hours per week on labs and deployments.", type: "shield" }
    ],
    curriculum: [
      { id: 1, week: "Week 1 - 2", title: "Containers with Docker", duration: "10 Hours",
        topics: [
          { type: "video", name: "Docker Fundamentals", duration: "40 mins" },
          { type: "code", name: "Lab: Containerizing an Application", duration: "3 hours" }
        ] },
      { id: 2, week: "Week 3", title: "Orchestration with Kubernetes", duration: "8 Hours",
        topics: [
          { type: "code", name: "Lab: Deploying to a Kubernetes Cluster", duration: "4 hours" }
        ] },
      { id: 3, week: "Week 4", title: "Infrastructure as Code", duration: "6 Hours",
        topics: [
          { type: "code", name: "Capstone: Automated Cloud Deployment", duration: "4 hours" }
        ] }
    ],
    enrollment: {
      features: ["4 Weeks Intensive", "Cloud Lab Credits", "Certificate of Completion"],
      timer: "This course has ended"
    }
  }
];

let mockUser: User = {
  id: 18,
  fullName: "Alex Mercer",
  email: "alex.mercer@corporate.com",
  role: "Student",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  joinedAt: "2026-01-12",
  completedCourses: 1,
  activeCourses: 2,
  companyAffiliation: "ABC Technologies"
};

let mockEnrollments: CourseEnrollment[] = [
  { courseId: 15, progress: 45, status: "In Progress" },
  { courseId: 16, progress: 100, status: "Completed" }
];

let mockNotifications: Notification[] = [
  {
    notificationId: 55,
    title: "Workspace Verified",
    message: "Your corporate onboarding validation is active! Explore your dashboard.",
    type: "Account",
    isRead: false,
    createdAt: "2026-07-03T14:00:00Z"
  }
];

let mockSupportTickets: Array<unknown> = [];
let mockB2BRequests: Array<B2BRequestPayload & { ticketId: number; status: string }> = [];
let mockCourseDrafts: unknown[] = [];

// ============================================================================
// NEW STATIC DATA FOR INTEGRATION
// ============================================================================

export const courseHeroData = {
  en: {
    category: 'Advanced Tech & Artificial Intelligence',
    title: 'Full-Stack Generative AI & Digital Transformation Bootcamp',
    subtitle: 'Master building scalable AI applications, fine-tuning LLMs, and leading enterprise-level digital transformations using cutting-edge modern frameworks.',
    rating: '4.9 (1,240 global reviews)',
    meta: { updated: 'Last updated 06/2026', level: 'Intermediate to Advanced', language: 'Arabic / English' }
  },
  ar: {
    category: 'التقنيات المتقدمة والذكاء الاصطناعي',
    title: 'معسكر مطور الذكاء الاصطناعي التوليدي المتكامل والتحول الرقمي',
    subtitle: 'أتقن بناء تطبيقات الذكاء الاصطناعي القابلة للتوسع، وضبط النماذج اللغوية الكبيرة (LLMs)، وقيادة التحول الرقمي للشركات باستخدام أحدث الإطارات التقنية.',
    rating: '4.9 (1,240 تقييم عالمي)',
    meta: { updated: 'آخر تحديث 06/2026', level: 'متوسط إلى متقدم', language: 'العربية / الإنجليزية' }
  }
};

export const curriculumData = {
  en: {
    title: 'Bootcamp Curriculum',
    subtitle: 'Explore the structured operational roadmap designed to take you from foundational engineering to high-tier enterprise architecture.',
    expandAll: 'Expand All', collapseAll: 'Collapse All', lessons: 'Lessons',
    modules: [
      {
        id: 1, week: 'Week 1 - 2', title: 'Deep-Dive Into LLM Architectures & Foundations', duration: '20 Hours',
        topics: [
          { type: 'video', name: 'Introduction to Transformers & Attention Mechanisms', duration: '45 mins' },
          { type: 'code', name: 'Hands-on: Building Tokenizers from Scratch', duration: '2 hours' },
          { type: 'doc', name: 'Reading: Corporate AI Compliance & Open-Source vs Proprietary', duration: '15 mins' }
        ]
      },
      {
        id: 2, week: 'Week 3 - 5', title: 'Advanced Production-Grade RAG Systems', duration: '35 Hours',
        topics: [
          { type: 'video', name: 'Vector Databases, Embeddings, & Chunking Tactical Strategies', duration: '60 mins' },
          { type: 'code', name: 'Lab: Hybrid Search Pipelines (Dense + Sparse Retrieval)', duration: '4 hours' },
          { type: 'code', name: 'Project: Implementing Re-ranking & Query Expansion', duration: '6 hours' }
        ]
      },
      {
        id: 3, week: 'Week 6 - 8', title: 'Multi-Agent Systems & Autonomous Pipelines', duration: '40 Hours',
        topics: [
          { type: 'video', name: 'Orchestration Frameworks: LangGraph, AutoGen, & CrewAI', duration: '90 mins' },
          { type: 'code', name: 'Lab: Memory Management & State Control in Long-Running Agents', duration: '5 hours' },
          { type: 'code', name: 'Capstone: Enterprise Multi-Agent Deployment via Docker', duration: '12 hours' }
        ]
      }
    ]
  },
  ar: {
    title: 'المنهج وخطة المعسكر المتقدمة',
    subtitle: 'استكشف خارطة الطريق الهيكلية والعملية المصممة لنقلك من الأساسيات البرمجية إلى هندسة الأنظمة الضخمة للشركات.',
    expandAll: 'توسيع الكل', collapseAll: 'إغلاق الكل', lessons: 'دروس',
    modules: [
      {
        id: 1, week: 'الأسبوع 1 - 2', title: 'الغوص العميق في بنيات النماذج اللغوية الكبيرة (LLMs)', duration: '20 ساعة',
        topics: [
          { type: 'video', name: 'مقدمة في نماذج الـ Transformers وآليات الانتباه (Attention)', duration: '45 دقيقة' },
          { type: 'code', name: 'تطبيق عملي: بناء الـ Tokenizers البرمجية من الصفر', duration: 'ساعتين' },
          { type: 'doc', name: 'قراءة موجهة: حوكمة الذكاء الاصطناعي والمفتوح مقابل المغلق', duration: '15 دقيقة' }
        ]
      },
      {
        id: 2, week: 'الأسبوع 3 - 5', title: 'أنظمة استرجاع المعلومات المعززة بالتوليد (RAG) للإنتاج الحقيقي', duration: '35 ساعة',
        topics: [
          { type: 'video', name: 'قواعد البيانات المتجهة (Vector DBs) واستراتيجيات تقسيم النصوص', duration: '60 دقيقة' },
          { type: 'code', name: 'معمل عملي: بناء خطوط البحث الهجين (Hybrid Search Pipelines)', duration: '4 ساعات' },
          { type: 'code', name: 'مشروع: تنفيذ أنظمة إعادة الترتيب (Re-ranking) وتوسيع الاستعلام', duration: '6 ساعات' }
        ]
      },
      {
        id: 3, week: 'الأسبوع 6 - 8', title: 'الأنظمة متعددة الوكلاء (Multi-Agent Systems) والتدفقات المستقلة', duration: '40 ساعة',
        topics: [
          { type: 'video', name: 'إطارات الإدارة والربط: LangGraph، AutoGen، و CrewAI', duration: '90 دقيقة' },
          { type: 'code', name: 'معمل: إدارة الذاكرة والتحكم في الحالات (State Control) للوكلاء البرمجيين', duration: '5 ساعات' },
          { type: 'code', name: 'مشروع التخرج: نشر وكلاء الذكاء الاصطناعي للشركات عبر Docker', duration: '12 ساعة' }
        ]
      }
    ]
  }
};

export const instructorData = {
  en: {
    sectionTitle: 'Meet Your Instructor', name: 'Dr. Rayan Al-Qahtani', role: 'Chief AI Architect & Digital Transformation Advisor',
    bio: 'With over 15 years of industry experience, Dr. Rayan has directed core enterprise AI system deployments across elite cloud technology hubs in Silicon Valley and Saudi Arabia.',
    stats: { rating: '4.9 Instructor Rating', students: '18,500+ Students', courses: '7 Deep-Tech Bootcamps' },
    skills: ['LLMOps Architecture', 'Fine-Tuning Expert', 'Cloud Security', 'Corporate Strategy']
  },
  ar: {
    sectionTitle: 'تعرّف على موجّه المعسكر', name: 'د. ريان القحطاني', role: 'كبير مهندسي الذكاء الاصطناعي ومستشار التحول الرقمي',
    bio: 'على مدى أكثر من 15 عاماً من الخبرة العملية، قاد الدكتور ريان مشاريع كبرى لنشر أنظمة الذكاء الاصطناعي في نخبة من مراكز الحوسبة السحابية في وادي السيليكون والمملكة العربية السعودية.',
    stats: { rating: '4.9 تقييم المدرب', students: '+18,500 طالب وطالبة', courses: '7 معسكرات تقنية عميقة' },
    skills: ['هندسة الـ LLMOps', 'ضبط النماذج الرقمية', 'أمن الحوسبة السحابية', 'الاستراتيجية الرقمية']
  }
};

export const overviewData = {
  en: {
    title: 'What You Will Master',
    description: 'This elite bootcamp bridges advanced software architecture with generative artificial intelligence, providing hands-on pipelines to upgrade your technical engineering capabilities completely.',
    outcomes: [
      'Architect and deploy end-to-end cloud-native Generative AI applications.',
      'Fine-tune open-source Large Language Models (LLMs) on private enterprise datasets.',
      'Build advanced Retrieval-Augmented Generation (RAG) knowledge intelligence architectures.',
      'Implement multi-agent autonomous workflows using modern AI orchestration tools.',
      'Optimize AI training pipelines for maximum performance and cost efficiency.',
      'Lead tactical enterprise digital transformations with safe corporate AI compliance.'
    ]
  },
  ar: {
    title: 'ما الذي ستتقنه في هذا المعسكر',
    description: 'يجمع هذا المعسكر النخبي بين هندسة البرمجيات المتقدمة والذكاء الاصطناعي التوليدي، مما يوفر لك خطوط إنتاج وتطبيق برمجية حية لترقية قدراتك التقنية والهندسية بالكامل.',
    outcomes: [
      'بناء وتطوير تطبيقات الذكاء الاصطناعي التوليدي السحابية من الصفر وحتى الإنتاج.',
      'ضبط وتعديل النماذج اللغوية الكبيرة (LLMs) مفتوحة المصدر على بيانات الشركات الخاصة.',
      'تأسيس بنية متقدمة لأنظمة استرجاع المعلومات المعززة بالتوليد (RAG) الذكية.',
      'تنفيذ تدفقات عمل برمجية ذاتية القيادة ومتعددة الوكلاء (Multi-Agent Systems).',
      'تحسين خطوط معالجة وتدريب نماذج الذكاء الاصطناعي لأعلى كفاءة وأقل تكلفة حوسبية.',
      'قيادة استراتيجيات التحول الرقمي بامتثال أمني وحوكمة تقنية صارمة للشركات.'
    ]
  }
};

export const requirementsData = {
  en: {
    title: 'Bootcamp Prerequisites',
    subtitle: 'Please review the technical background and hardware requirements needed to ensure an optimal learning experience.',
    items: [
      { id: 'tech', title: 'Technical Background', desc: 'Intermediate knowledge of JavaScript/Python and basic familiarity with modern web architectures and APIs.', type: 'code' },
      { id: 'hardware', title: 'Hardware Setup', desc: 'A laptop (Mac/Windows/Linux) with at least 8GB RAM (16GB recommended) and stable internet connection.', type: 'cpu' },
      { id: 'mindset', title: 'Commitment & Mindset', desc: 'Readiness to invest 10-15 hours per week for building engineering tasks, coding challenges, and interactive team review sessions.', type: 'shield' }
    ]
  },
  ar: {
    title: 'المتطلبات المسبقة للانضمام',
    subtitle: 'يرجى مراجعة الخلفية التقنية والمواصفات اللازمة لضمان تحقيق أقصى استفادة ممكنة من غرف المعمل والتطبيق المتقدم.',
    items: [
      { id: 'tech', title: 'الخلفية التقنية المطلوبة', desc: 'معرفة متوسطة بلغة JavaScript أو Python، وفهم أساسي لكيفية التعامل مع واجهات برمجة التطبيقات (APIs).', type: 'code' },
      { id: 'hardware', title: 'مواصفات جهاز الكمبيوتر', desc: 'جهاز كمبيوتر بذاكرة عشوائية لا تقل عن 8 جيجابايت (يفضل 16 جيجابايت)، مع اتصال إنترنت مستقر للمختبرات عن بعد.', type: 'cpu' },
      { id: 'mindset', title: 'الالتزام الذهني والوقتي', desc: 'الاستعداد المكامل لتخصيص 10 إلى 15 ساعة أسبوعياً لحل التحديات البرمجية وبناء المشاريع وجلسات التوجيه الجماعية.', type: 'shield' }
    ]
  }
};

export const enrollmentData = {
  en: {
    price: '$499', originalPrice: '$899', discount: '45% OFF', title: 'Ready to Transform?',
    features: ['8 Weeks Intensive', 'Live Mentorship', 'Job Guarantee Support', 'Lifetime Access'],
    btnText: 'Secure Your Spot', timer: 'Enrollment closes in: 04:12:45'
  },
  ar: {
    price: '1,899 ر.س', originalPrice: '3,499 ر.س', discount: 'خصم 45%', title: 'جاهز لبدء رحلة التحول？',
    features: ['8 أسابيع تدريب مكثف', 'جلسات توجيه مباشرة', 'دعم التوظيف الاحترافي', 'وصول دائم للمحتوى'],
    btnText: 'احجز مقعدك الآن', timer: 'ينتهي التسجيل خلال: 04:12:45'
  }
};

export const navTranslations = {
  en: { nav: { home: 'Home', courses: 'Courses', bootcamps: 'Bootcamps', companies: 'Companies', about: 'About Us', contact: 'Contact' }, langBtn: 'AR' },
  ar: { nav: { home: 'الرئيسية', courses: 'الدورات', bootcamps: 'المعسكرات', companies: 'الشركات', about: 'من نحن', contact: 'تواصل معنا' }, langBtn: 'EN' }
};

export const contactPageData = {
  en: { title: 'Get in Touch', subtitle: 'We are here to help you deploy your digital shift. Reach out anytime.', formName: 'Your Name', formEmail: 'Email Address', formPhone: 'Phone Number', formMessage: 'Message Description', submitBtn: 'Send Message' },
  ar: { title: 'تواصل معنا الآن', subtitle: 'نحن هنا لمساعدتك في قيادة تحولك الرقمي وبناء مسيرتك التقنية.', formName: 'الاسم الكامل', formEmail: 'البريد الإلكتروني', formPhone: 'رقم الجوال', formMessage: 'تفاصيل الرسالة', submitBtn: 'إرسال الرسالة' }
};

// ============================================================================
// MODULE 1: AUTHENTICATION APIs (Feature 3) - LIVE BACKEND INTEGRATION
// ============================================================================

export interface RegisterPayload {
  name?: string;
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

export async function registerUser(payload: RegisterPayload): Promise<ApiResponse<unknown>> {
  await delay(500);
  
  const finalName = payload.name || payload.fullName;

  if (!finalName || !payload.email || !payload.password) {
    return {
      success: false,
      error: "validation_error",
      details: { global: "جميع الحقول مطلوبة لإتمام عملية التسجيل." }
    };
  }

  if (finalName.length < 3) {
    return {
      success: false,
      error: "validation_error",
      details: { global: "يجب أن يكون الاسم 3 حروف أو أكثر." }
    };
  }

  try {
    const response = await register({
      fullName: finalName,
      email: payload.email,
      password: payload.password,
      role: payload.role || "Student"
    });

    return {
      success: true,
      message: "تم إنشاء الحساب بنجاح.",
      data: response
    };
  } catch (err: any) {
    return {
      success: false,
      error: "registration_error",
      details: { global: err.message || "حدث خطأ أثناء إنشاء الحساب." }
    };
  }
}

export interface LoginPayload {
  email?: string;
  password?: string;
}

export async function loginUser(payload: LoginPayload): Promise<ApiResponse<{ token: string; userId: number; role: string; name: string }>> {
  await delay(500);

  if (!payload.email || !payload.password) {
    return {
      success: false,
      error: "validation_error",
      details: { auth: "البريد الإلكتروني وكلمة المرور حقول مطلوبة." }
    };
  }

  try {
    const response = await login(payload.email, payload.password);
    
    if (response.token) {
      localStorage.setItem('token', response.token);
    }

    return {
      success: true,
      message: "تم تسجيل الدخول بنجاح.",
      data: {
        token: response.token,
        userId: response.user?.id || mockUser.id,
        role: response.user?.role || mockUser.role,
        name: response.user?.fullName || response.user?.name || mockUser.fullName
      }
    };
  } catch (err: any) {
    return {
      success: false,
      error: "validation_error",
      details: { auth: err.message || "خطأ في البريد الإلكتروني أو كلمة المرور." }
    };
  }
}

// ============================================================================
// MODULE 2: PLATFORM OVERVIEW APIs (Feature 18)
// ============================================================================

export interface PlatformTrack {
  title: string;
  description: string;
  title_en?: string;
  description_en?: string;
}

export interface PlatformOverview {
  platformName: string;
  studentTrack: PlatformTrack;
  trainerTrack: PlatformTrack;
  companyTrack: PlatformTrack;
}

export async function getPlatformOverview(): Promise<ApiResponse<PlatformOverview>> {
  await delay(400);
  return {
    success: true,
    data: {
      platformName: "Capsule Tahawul",
      studentTrack: { 
        title: "التسجيل كطالب", 
        title_en: "Learn & Accelerate", 
        description: "الوصول إلى مسارات هندسية مجانية ومدفوعة مع خرائط طريق مرنة ومجزأة.",
        description_en: "Access free and premium engineering tracks with modular roadmaps." 
      },
      trainerTrack: { 
        title: "تقديم كمدرب", 
        title_en: "Monetize Expertise", 
        description: "قم بإعداد المناهج التدريبية، وتتبع تحليلات تسجيل الطلاب، واحصل على عوائد ممتازة.",
        description_en: "Author curriculum pipelines, check enrollment trajectory analytics, and earn structural payouts." 
      },
      companyTrack: { 
        title: "حلول الشركات والمؤسسات", 
        title_en: "Upskill Your Workforce", 
        description: "تنظيم مسارات تدريبية مستمرة لشركتك عبر معسكرات قابلة للتتبع وهاكاثونات مخصصة.",
        description_en: "Orchestrate continuous corporate ecosystems via trackable bootcamps and custom hackathons." 
      }
    }
  };
}

// ============================================================================
// MODULE 3: COURSE CATALOG APIs (Feature 1, Feature 2)
// ============================================================================

export interface CourseFilters {
  category?: string;
  search?: string;
}

export interface PaginatedCourses {
  page: number;
  totalPages: number;
  courses: Course[];
}

export async function getCourses(filters: CourseFilters = {}): Promise<ApiResponse<PaginatedCourses>> {
  await delay(500);
  let filtered = [...mockCourses];

  const { category, search } = filters;

  if (category) {
    filtered = filtered.filter(c => c.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    filtered = filtered.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
  }

  return {
    success: true,
    data: { page: 1, totalPages: 1, courses: filtered }
  };
}

export async function getCourseDetails(courseId: string | number, locale: 'ar' | 'en' = 'en'): Promise<ApiResponse<Course>> {
  await delay(400);
  const course = mockCourses.find(c => c.id === parseInt(courseId.toString()));
  
  if (!course) {
    return {
      success: false,
      error: "course_not_found",
      details: { courseId: "The requested course key does not exist on the index." }
    };
  }

  const lang = locale === 'ar' ? 'ar' : 'en';
  const localizedHero = courseHeroData[lang];
  const localizedCurriculum = curriculumData[lang];
  const localizedOverview = overviewData[lang];
  const localizedRequirements = requirementsData[lang];
  const localizedEnrollment = enrollmentData[lang];
  const localizedInstructor = instructorData[lang];

  return { 
    success: true, 
    data: {
      ...course,
      title: localizedHero.title || course.title,
      subtitle: localizedHero.subtitle || course.subtitle,
      category: localizedHero.category || course.category,
      outcomes: localizedOverview.outcomes || course.outcomes,
      translatedCurriculum: localizedCurriculum,
      translatedRequirements: localizedRequirements,
      translatedEnrollment: localizedEnrollment,
      translatedInstructor: localizedInstructor,
      currentLocale: lang
    }
  };
}

// ============================================================================
// MODULE 4: STUDENT DASHBOARD & PROFILE (Feature 4, Feature 6)
// ============================================================================

export async function getStudentProfile(): Promise<ApiResponse<User>> {
  await delay(300);
  return { success: true, data: mockUser };
}

export interface ProfileUpdatePayload {
  fullName?: string;
  avatar?: string;
}

export async function updateStudentProfile(payload: ProfileUpdatePayload): Promise<ApiResponse<User>> {
  await delay(700);
  if (!payload.fullName || payload.fullName.length < 3) {
    return {
      success: false,
      error: "validation_error",
      details: { fullName: "Profile name update must contain at least 3 characters." }
    };
  }

  mockUser.fullName = payload.fullName;
  if (payload.avatar) mockUser.avatar = payload.avatar;

  return {
    success: true,
    message: "Profile updated successfully.",
    data: mockUser
  };
}

export async function getPurchasedCourses(): Promise<ApiResponse<Array<Course & CourseEnrollment>>> {
  await delay(400);
  const trackingData = mockEnrollments.map(enrollment => {
    const original = mockCourses.find(c => c.id === enrollment.courseId) || {} as Course;
    return { ...original, ...enrollment } as Course & CourseEnrollment;
  });
  return { success: true, data: trackingData };
}

export async function enrollInCourse(courseId: string | number): Promise<ApiResponse<unknown>> {
  await delay(600);
  const id = parseInt(courseId.toString());
  
  if (mockEnrollments.some(e => e.courseId === id)) {
    return {
      success: false,
      error: "duplicate_enrollment",
      details: { courseId: "You are already actively enrolled inside this curriculum sequence." }
    };
  }

  mockEnrollments.push({ courseId: id, progress: 0, status: "In Progress" });
  return { success: true, message: "Enrollment tracking initialized on dashboard view successfully." };
}

// ============================================================================
// MODULE 5: LEARNING CONTENT & RESOURCES (Feature 7, Feature 8, Feature 9)
// ============================================================================

export async function getCourseModules(courseId: string | number): Promise<ApiResponse<CourseModuleDetail[]>> {
  await delay(400);
  return {
    success: true,
    data: [
      { moduleId: 301, title: "Module 1: Foundational Paradigm Layouts", status: "Completed", videoUrl: "https://stream.mock.io/v/301.mp4" },
      { moduleId: 302, title: "Module 2: Structural State Hooks Architecture", status: "Unlocked", videoUrl: "https://stream.mock.io/v/302.mp4", attachments: [{ fileName: "architecture-cheatsheet.pdf", downloadUrl: "#" }] },
      { moduleId: 303, title: "Module 3: Asynchronous Network Integrations", status: "Locked" }
    ]
  };
}

export interface QuizPayload {
  answers: unknown[];
}

export interface QuizTally {
  scoreTally: number;
  passed: boolean;
  totalQuestions: number;
}

export async function submitQuiz(quizId: string | number, payload: QuizPayload): Promise<ApiResponse<QuizTally>> {
  await delay(500);
  if (!payload.answers || payload.answers.length === 0) {
    return {
      success: false,
      error: "incomplete_answers",
      details: { quiz: "All interactive parameters must be populated before metric confirmation calculation." }
    };
  }

  return {
    success: true,
    data: { scoreTally: 100, passed: true, totalQuestions: payload.answers.length }
  };
}

// ============================================================================
// MODULE 6: COMMUNICATIONS & SUPPORT - LIVE BACKEND INTEGRATION
// ============================================================================

export interface ContactFormPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export async function submitContactForm(data: ContactFormPayload): Promise<ApiResponse<unknown>> {
  await delay(500);
  
  if (!data.fullName || data.fullName.length < 3) {
    return { success: false, error: "validation_error", details: { name: "يجب أن يكون الاسم 3 حروف أو أكثر." } };
  }
  if (!data.email || !data.email.includes("@")) {
    return { success: false, error: "validation_error", details: { email: "يرجى إدخال بريد إلكتروني صحيح." } };
  }
  if (!data.phone || !data.phone.startsWith("05") || data.phone.length !== 10) {
    return {
      success: false,
      error: "validation_error",
      details: { phone: "يجب أن يبدأ رقم الجوال بـ 05 ويتكون من 10 أرقام." }
    };
  }
  if (!data.message || data.message.length < 20 || data.message.length > 500) {
    return { success: false, error: "validation_error", details: { message: "يجب أن تكون الرسالة بين 20 و 500 حرف." } };
  }

  try {
    const response = await submitContact(data);
    return { 
      success: true, 
      message: "تم استلام رسالتك بنجاح وسنتواصل معك قريباً.",
      data: response 
    };
  } catch (err: any) {
    return {
      success: false,
      error: "contact_error",
      details: { message: err.message || "فشل إرسال الرسالة، يرجى المحاولة لاحقاً." }
    };
  }
}

export async function sendChatbotMessage(msgInput: string): Promise<ApiResponse<{ replyBubble: string }>> {
  await delay(400);
  if (!msgInput) return { success: false, error: "empty_query", details: { chat: "Inquiry text cannot be empty." } };
  
  return {
    success: true,
    data: { replyBubble: "To review upcoming course guidelines or track parameters, navigate directly to your Course Catalogue module viewport." }
  };
}

// ============================================================================
// MODULE 7: WORKSPACE CREATORS & PARTNERS (Feature 11, 12, 13, 14, 15)
// ============================================================================

export interface TrainerApplicationPayload {
  linkedin?: string;
  bio?: string;
  skills?: string[];
}

export async function submitTrainerApplication(payload: TrainerApplicationPayload): Promise<ApiResponse<unknown>> {
  await delay(700);
  if (!payload.linkedin || !payload.linkedin.startsWith("http")) {
    return { success: false, error: "validation_failed", details: { linkedin: "A valid working external link path is required." } };
  }
  return { success: true, message: "Application successfully submitted. Current state flagged as Pending Verification." };
}

export interface TrainerAnalytics {
  totalPayoutCollected: number;
  activeEnrolledStudentsCount: number;
  trajectoryGraphData: Array<{ month: string; enrollments: number; earnings: number }>;
}

export async function getTrainerAnalytics(): Promise<ApiResponse<TrainerAnalytics>> {
  await delay(500);
  return {
    success: true,
    data: {
      totalPayoutCollected: 14250,
      activeEnrolledStudentsCount: 340,
      trajectoryGraphData: [
        { month: "May", enrollments: 110, earnings: 4500 },
        { month: "June", enrollments: 230, earnings: 9750 }
      ]
    }
  };
}

export interface B2BRequestPayload {
  companyName?: string;
  contactName?: string;
  requirementsNotes?: string;
}

export async function submitB2BRequest(payload: B2BRequestPayload): Promise<ApiResponse<{ ticketId: number; status: string }>> {
  await delay(800);
  if (!payload.requirementsNotes || payload.requirementsNotes.length < 20) {
    return {
      success: false,
      error: "submission_error",
      details: { requirementsNotes: "Custom specification records must be at least 20 parameters long." }
    };
  }

  const ticketId = Math.floor(Math.random() * 9000) + 1000;
  mockB2BRequests.push({ ticketId, ...payload, status: "Pending Review" });
  
  return {
    success: true,
    message: "Organization-bound service ticket generated successfully.",
    data: { ticketId, status: "Pending Review" }
  };
}

// ============================================================================
// MODULE 8: SYSTEM NOTIFICATIONS & GLOBAL OPERATION CONTROL (Feature 16, 17)
// ============================================================================

export async function getNotifications(): Promise<ApiResponse<Notification[]>> {
  await delay(300);
  return { success: true, data: mockNotifications };
}

export interface AdminDashboardMetrics {
  activeUserLoginsToday: number;
  pendingReportFlagsCount: number;
  serverResourceDistribution: 'optimal' | 'degraded' | string;
  publishedCoursesCount: number;
}

export async function getAdminDashboardMetrics(): Promise<ApiResponse<AdminDashboardMetrics>> {
  await delay(500);
  return {
    success: true,
    data: {
      activeUserLoginsToday: 1420,
      pendingReportFlagsCount: 3,
      serverResourceDistribution: "optimal",
      publishedCoursesCount: mockCourses.length
    }
  };
}
export interface ComplaintItem {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
}
export interface GrowthMetric {
  monthAr: string;
  monthEn: string;
  count: number;
}

export const getAdminGrowthStats = async (): Promise<{ success: boolean; data: GrowthMetric[] }> => {
  return {
    success: true,
    data: [
      { monthAr: 'مايو', monthEn: 'May', count: 420 },
      { monthAr: 'يونيو', monthEn: 'June', count: 890 },
      { monthAr: 'يوليو (الحالي)', monthEn: 'July (Current)', count: 1420 }
    ]
  };
};

export const getAdminComplaints = async (): Promise<{ success: boolean; data: ComplaintItem[] }> => {
  return {
    success: true,
    data: [
      { id: 'TKT-991', name: 'خالد عبدالله', email: 'khaled@mail.com', message: 'تواجهني مشكلة أثناء تحميل ملفات موديول خطافات ريأكت المتقدمة.', date: '2026-07-10' },
      { id: 'TKT-302', name: 'سارة الأحمد', email: 'sara.a@corporate.com', message: 'طلب تفعيل واجهة الشركة B2B لم يتم الرد عليه بعرض السعر حتى الآن.', date: '2026-07-12' }
    ]
  };
};

// ============================================================================
// MODULE 9: TRAINER PROFILE
// ============================================================================

interface TrainerContact {
  email: string;
  phone: string;
  experience: number;
}

const trainerContactInfo: Record<string, TrainerContact> = {
  "ahmed-mohammed": { email: "ahmed.mohammed@capsule.com", phone: "+966500000011", experience: 8 },
  "sara-ali": { email: "sara.ali@capsule.com", phone: "+966500000012", experience: 6 },
  "abdullah-nasser": { email: "abdullah.nasser@capsule.com", phone: "+966500000013", experience: 10 },
  "noura-alfaisal": { email: "noura.alfaisal@capsule.com", phone: "+966500000014", experience: 7 },
};

const genericTrainerReviews = [
  { id: 1, name: "Khalid", rating: 5, date: "2026-07-01", comment: "Excellent trainer, very clear explanations." },
  { id: 2, name: "Lama", rating: 4, date: "2026-07-03", comment: "Very informative and well-structured sessions." },
];

function buildTrainerProfile(trainerId: string): TrainerProfile | null {
  const trainerCourses = mockCourses.filter(c => c.trainerId === trainerId);
  if (trainerCourses.length === 0) return null;

  const base = trainerCourses[0].instructorProfile || {} as InstructorProfile;
  const contact = trainerContactInfo[trainerId] || {} as Partial<TrainerContact>;
  const totalStudents = trainerCourses.reduce((sum, c) => sum + (c.students || 0), 0);
  const ratedCourses = trainerCourses.filter(c => c.rating);
  const avgRating = ratedCourses.length
    ? +(ratedCourses.reduce((sum, c) => sum + c.rating, 0) / ratedCourses.length).toFixed(1)
    : 0;

  return {
    trainerId,
    name: trainerCourses[0].instructor,
    specialty: base.role || "Trainer",
    specialtyAr: base.roleAr,
    bio: base.bio || "",
    bioAr: base.bioAr,
    email: contact.email || `${trainerId}@capsule.com`,
    phone: contact.phone || "+966500000000",
    experience: contact.experience || 5,
    avatarLetter: base.avatarLabel || trainerCourses[0].instructor.charAt(0),
    stats: {
      coursesCount: trainerCourses.length,
      studentsCount: totalStudents,
      rating: avgRating,
    },
    courses: trainerCourses.map(c => ({
      id: c.id,
      name: c.title,
      nameAr: c.titleAr,
      students: c.students,
      status: (c.status === "available" || c.status === "completed") ? "published" : "review",
    })),
    reviews: genericTrainerReviews,
  };
}

export async function getTrainerProfile(trainerId?: string): Promise<ApiResponse<TrainerProfile>> {
  await delay(300);

  const fallbackId = trainerId || mockCourses.find(c => c.trainerId)?.trainerId;
  
  if (!fallbackId) {
    return {
      success: false,
      error: "trainer_not_found",
      details: { trainerId: "No trainers registered inside the catalogue." }
    };
  }

  const profile = buildTrainerProfile(fallbackId);

  if (!profile) {
    return {
      success: false,
      error: "trainer_not_found",
      details: { trainerId: "The requested trainer does not exist on the index." }
    };
  }

  return { success: true, data: profile };
}

// ============================================================================
// MODULE 10: ADMIN IAM & USER MANAGEMENT DATA
// ============================================================================

let mockUsersPermissions: AdminUserRecord[] = [
  { id: 'USR-882', name: 'أحمد Mohammed', email: 'ahmed@capsule.com', role: 'Trainer', status: 'active' },
  { id: 'USR-412', name: 'Alex Mercer', email: 'alex.mercer@corporate.com', role: 'Student', status: 'active' },
  { id: 'USR-109', name: 'شركة التقنية المحدودة', email: 'b2b@tech.com', role: 'Company', status: 'active' },
  { id: 'USR-554', name: 'سارة Ali', email: 'sara@capsule.com', role: 'Trainer', status: 'suspended' }
];

export async function getAllUsersForAdmin(): Promise<ApiResponse<AdminUserRecord[]>> {
  await delay(300);
  return { success: true, data: mockUsersPermissions };
}

export async function updateUserRoleInMock(userId: string, newRole: string): Promise<ApiResponse<void>> {
  await delay(200);
  mockUsersPermissions = mockUsersPermissions.map(user => 
    user.id === userId ? { ...user, role: newRole as AdminUserRecord['role'] } : user
  );
  return { success: true };
}

export async function toggleUserStatusInMock(userId: string): Promise<ApiResponse<void>> {
  await delay(200);
  mockUsersPermissions = mockUsersPermissions.map(user => {
    if (user.id === userId) {
      const nextStatus: 'active' | 'suspended' = user.status === 'active' ? 'suspended' : 'active';
      return { ...user, status: nextStatus };
    }
    return user;
  });
  return { success: true };
}

export interface ReviewItem {
  id: number;
  name: string;
  rating: number;
  date: string;
  commentAr: string;
  commentEn: string;
}

export const getTrainerReviewsMock = async (): Promise<{ success: boolean; data: ReviewItem[] }> => {
  return {
    success: true,
    data: [
      { id: 1, name: 'أحمد علي', rating: 5, date: '2026-07-01', commentAr: 'شرح ممتاز للمفاهيم المتقدمة!', commentEn: 'Excellent explanation of advanced concepts!' },
      { id: 2, name: 'سارة محمد', rating: 4, date: '2026-06-28', commentAr: 'الدورة عملية جداً ومفيدة.', commentEn: 'The course is very practical and useful.' }
    ]
  };
};

export interface StudentProgressItem {
  id: number;
  name: string;
  courseAr: string;
  courseEn: string;
  progress: number;
}

export const getTrainerStudentProgressMock = async (): Promise<{ success: boolean; data: StudentProgressItem[] }> => {
  return {
    success: true,
    data: [
      { id: 984, name: 'سلمان العتيبي', courseAr: 'معسكر مراجعة ريأكت العميقة', courseEn: 'React Bootcamp Deep Dive', progress: 45 },
      { id: 221, name: 'نورة العلي', courseAr: 'أساسيات الذكاء الاصطناعي والـ ML', courseEn: 'AI & ML Fundamentals', progress: 100 }
    ]
  };
};

export const calculateCourseEarnings = (students: number, price: number): number => {
  return Math.round((students || 0) * (price || 0) * 0.8);
};

export const getTrainerMockReviews = (lang: string) => [
  { id: 1, name: lang === 'ar' ? 'سارة العتيبي' : 'Sarah Al-Otaibi', rating: 5, comment: lang === 'ar' ? 'محتوى ممتاز وشرح واضح جداً' : 'Excellent content and clear explanation' },
  { id: 2, name: lang === 'ar' ? 'خالد الدوسري' : 'Khaled Al-Dawsari', rating: 4, comment: lang === 'ar' ? 'دورة تطبيقية ممتازة وأنصح بها' : 'Great practical course, highly recommended' }
];

export const getTrainerMockProgress = (lang: string) => [
  { id: 101, name: lang === 'ar' ? 'علي المحسن' : 'Ali Al-Mohsen', courseAr: 'معسكر الأمن السيبراني', courseEn: 'Cybersecurity Bootcamp', progress: 85 },
  { id: 102, name: lang === 'ar' ? 'فاطمة أحمد' : 'Fatima Ahmed', courseAr: 'هندسة البرمجيات', courseEn: 'Software Engineering', progress: 60 }
];