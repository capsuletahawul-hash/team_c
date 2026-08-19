// src/repositories/memoryContractRepository.ts
//
// In-memory implementation of ContractRepository — plain array in RAM, same
// pattern as memoryContactRepository.ts / memoryUserRepository.ts.
// Submissions are lost on server restart; expected for the in-memory stage.

import { randomUUID } from "crypto";
import type {
  ContractRequest,
  NewContractRequest,
  ContractRepository,
} from "./contractRepository.js";

// The in-memory "table". Never exported — only this repository touches it.
const requests: ContractRequest[] = [];

export const memoryContractRepository: ContractRepository = {
  async create(data: NewContractRequest) {
    const record: ContractRequest = {
      id: `CR-${randomUUID().slice(0, 8)}`,
      status: "pending",
      createdAt: new Date().toISOString(),
      ...data,
    };
    requests.push(record);
    return record;
  },

  async findAll() {
    // Newest first, without mutating the underlying array.
    return [...requests].reverse();
  },

  async findById(id) {
    const record = requests.find((r) => r.id === id);
    return record ?? null;
  },

  async approve(id) {
    const record = requests.find((r) => r.id === id);
    if (!record) return null;
    record.status = "approved";
    return record;
  },

  async reject(id) {
    const record = requests.find((r) => r.id === id);
    if (!record) return null;
    record.status = "rejected";
    return record;
  },
};
