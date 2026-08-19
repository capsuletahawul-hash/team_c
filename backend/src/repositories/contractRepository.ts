// src/repositories/contractRepository.ts
//
// CONTRACT for B2B "business contract" form data access. Same pattern as
// contactRepository.ts: types + interface only, no storage logic. This is
// the public onboarding form a prospective company fills out before they
// have an account (my-app/src/pages/BusinessContractForm.tsx) — separate
// from the authenticated company ticket system (companyRepository.ts),
// which only exists once a Company account is already signed up.

export type ContractStatus = "pending" | "approved" | "rejected";

/**
 * A stored B2B contract / onboarding request submission.
 */
export interface ContractRequest {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  trainingType: string;
  trainees: number;
  startDate: string;
  notes: string;
  status: ContractStatus;
  createdAt: string;
}

/**
 * The fields a caller must supply to record a new submission.
 * `id`, `status`, and `createdAt` are generated/defaulted by the repository.
 */
export type NewContractRequest = Omit<ContractRequest, "id" | "status" | "createdAt">;

/**
 * The contract every contract-request repository implementation must satisfy.
 * Storage and retrieval only — validating the incoming form data belongs to
 * Zod at the controller boundary, not here.
 */
export interface ContractRepository {
  /** Persist a new submission (status defaults to "pending") and return the full stored record. */
  create(request: NewContractRequest): Promise<ContractRequest>;

  /** Retrieve all submissions, newest first. */
  findAll(): Promise<ContractRequest[]>;

  /** Find a single submission by id, or null if it doesn't exist. */
  findById(id: string): Promise<ContractRequest | null>;

  /** Mark a pending request as approved. Returns null if not found. */
  approve(id: string): Promise<ContractRequest | null>;

  /** Mark a pending request as rejected. Returns null if not found. */
  reject(id: string): Promise<ContractRequest | null>;
}

// تعديل: تصدير التطبيق الفعلي (In-memory) تحت نفس الاسم — نفس نمط userRepository.ts
export { memoryContractRepository as contractRepository } from "./memoryContractRepository.js";
