export type TicketStatus = "review" | "issued" | "approved";

export interface CompanyTicket {
  id: string;
  companyId: string;
  program: string;
  count: number;
  budget: number;
  domain: string;
  fileName: string;
  date: string;
  status: TicketStatus;
  base: number;
  discount: number;
}

export type CreateTicketInput = {
  program: string;
  count: number;
  budget: number;
  domain: string;
  fileName?: string;
};

export interface CompanyEmployee {
  id: number;
  companyId: string;
  name: string;
  progress: number;
}

// مصفوفة في الذاكرة تلعب دور قاعدة البيانات مؤقتاً
const tickets: CompanyTicket[] = [];
let nextTicketId = 1001;

// السعر الأساسي لكل موظف بالريال السعودي (قيمة تسعير افتراضية)
const BASE_FEE_PER_EMPLOYEE = 500;

// يحسب نسبة الخصم بناءً على حجم المجموعة — كلما زاد عدد الموظفين المستهدفين زاد الخصم
function computeDiscount(count: number): number {
  if (count >= 50) return 20;
  if (count >= 20) return 10;
  return 5;
}

export const companyRepository = {
  async listTicketsByCompany(companyId: string): Promise<CompanyTicket[]> {
    return tickets
      .filter((ticket) => ticket.companyId === companyId)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  },


  /**
   * All tickets across every company, for the Admin's contract/ticket
   * review queue — same pattern as trainerRepository.listAllCourses().
   */
  async listAllTickets(): Promise<CompanyTicket[]> {
    return [...tickets].sort((a, b) => (a.date < b.date ? 1 : -1));
  },

  async findTicketById(id: string): Promise<CompanyTicket | undefined> {
    return tickets.find((ticket) => ticket.id === id);
  },

  async createTicket(companyId: string, data: CreateTicketInput): Promise<CompanyTicket> {
    const ticket: CompanyTicket = {
      id: `B2B-${nextTicketId++}`,
      companyId,
      program: data.program,
      count: data.count,
      budget: data.budget,
      domain: data.domain,
      fileName: data.fileName || "",
      date: new Date().toISOString().slice(0, 10),
      status: "review",
      base: BASE_FEE_PER_EMPLOYEE,
      discount: computeDiscount(data.count),
    };
    tickets.push(ticket);
    return ticket;
  },

  async updateTicketStatus(
    id: string,
    companyId: string,
    status: TicketStatus
  ): Promise<CompanyTicket | undefined> {
    const ticket = tickets.find((t) => t.id === id && t.companyId === companyId);
    if (ticket) ticket.status = status;
    return ticket;
  },

  /**

   * Admin variant of updateTicketStatus — not scoped to a companyId, since
   * the Admin reviewing the queue isn't the ticket's owning company.
   */
  async setTicketStatusByAdmin(id: string, status: TicketStatus): Promise<CompanyTicket | undefined> {
    const ticket = tickets.find((t) => t.id === id);
    if (ticket) ticket.status = status;
    return ticket;
  },

  /**
>>>>>>> fix/week3-company-dashboard
   * Employee roster (no HR/employee-import module yet — returns an empty
   * list, same pattern used by trainerController.getStudentsProgress)
   */
  async listEmployeesByCompany(_companyId: string): Promise<CompanyEmployee[]> {
    return [];
  },
};
