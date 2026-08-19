/// <reference types="vite/client" />

export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// جلب التوكن من Local Storage
export function getToken(): string | null {
  return localStorage.getItem("user_token");
}

// دالة موحدة لجميع طلبات الـ API
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  let data: any;

  try {
    data = await response.json();
  } catch {
    throw new Error("فشل في قراءة البيانات من السيرفر");
  }

  if (!response.ok) {
    throw new Error(
      data.error || data.message || "حدث خطأ أثناء الاتصال بالسيرفر"
    );
  }

  return data as T;
}

// =======================
// Authentication
// =======================

export async function login(email: string, password: string) {
  return apiFetch<{
    token: string;
    user: any;
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function register(userData: any) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function getCurrentUser() {
  return apiFetch("/auth/me", {
    method: "GET",
  });
}

// =======================
// Orders
// =======================

export async function createOrder(courseId: string) {
  return apiFetch<{
    success: boolean;
    data?: {
      id: string;
      userId: string;
      courseId: string;
      amount: number;
      status: string;
      paymentId?: string | null;
      createdAt?: string;
    };
    error?: string;
  }>("/orders", {
    method: "POST",
    body: JSON.stringify({
      courseId,
    }),
  });
}

export async function getOrder(orderId: string) {
  return apiFetch<{
    success: boolean;
    data?: any;
    error?: string;
  }>(`/orders/${orderId}`, {
    method: "GET",
  });
}

export async function startCheckout(orderId: string) {
  return apiFetch<{
    success: boolean;
    data?: {
      orderId: string;
      checkoutUrl: string;
    };
    error?: string;
  }>("/payment/checkout", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
}

// =======================
// Contact
// =======================

export async function submitContact(contactData: any) {
  return apiFetch("/contact", {
    method: "POST",
    body: JSON.stringify(contactData),
  });
}

// =======================
// Admin Courses Approval
// =======================

export async function getAdminCourses() {
  return apiFetch<{ success: boolean; data: { courses: any[] } }>("/admin/courses");
}

export async function approveAdminCourse(id: number) {
  return apiFetch(`/admin/courses/${id}/approve`, {
    method: "PUT",
  });
}

export async function rejectAdminCourse(id: number) {
  return apiFetch(`/admin/courses/${id}/reject`, {
    method: "PUT",
  });
}

// =======================
// B2B Contract Requests (Company onboarding)
// =======================

export async function submitContractRequest(data: {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  trainingType: string;
  trainees: number;
  startDate: string;
  notes?: string;
}) {
  return apiFetch<{ success: boolean; request?: any; error?: any }>("/contracts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAdminContracts() {
  return apiFetch<{ success: boolean; data: { requests: any[] } }>("/admin/contracts");
}

export async function approveAdminContract(id: string) {
  return apiFetch(`/admin/contracts/${id}/approve`, {
    method: "PUT",
  });
}

export async function rejectAdminContract(id: string) {
  return apiFetch(`/admin/contracts/${id}/reject`, {
    method: "PUT",
  });
}

// =======================
// Admin Bootcamp Tickets (from the Company Dashboard's "Request Bootcamp" tab)
// =======================

export async function getAdminTickets() {
  return apiFetch<{ success: boolean; data: { tickets: any[] } }>("/admin/tickets");
}

export async function updateAdminTicketStatus(id: string, status: "review" | "issued" | "approved") {
  return apiFetch(`/admin/tickets/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

// =======================
// AI Course Assistant
// =======================

export async function askAboutCourses(question: string) {
  return apiFetch<{
    success: boolean;
    data?: {
      answer: string;
    };
    error?: string;
  }>("/ai/ask", {
    method: "POST",
    body: JSON.stringify({
      question,
    }),
  });
}