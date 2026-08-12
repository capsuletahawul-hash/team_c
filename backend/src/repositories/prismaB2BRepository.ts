import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import type {
  B2BRequest,
  NewB2BRequest,
  B2BRepository,
} from "./b2bRepository.js";

type PrismaB2BRequest = Prisma.B2BRequestGetPayload<{}>;

function toB2BRequest(record: PrismaB2BRequest): B2BRequest {
  return {
    id: record.id,
    companyName: record.companyName,
    contact: record.contact,
    message: record.message,
    createdAt: record.createdAt.toISOString(),
  };
}

export const prismaB2BRepository: B2BRepository = {
  async create(request: NewB2BRequest) {
    const record = await prisma.b2BRequest.create({
      data: {
        companyName: request.companyName,
        contact: request.contact,
        message: request.message,
      },
    });

    return toB2BRequest(record);
  },

  async findAll() {
    const records: PrismaB2BRequest[] =
      await prisma.b2BRequest.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return records.map(toB2BRequest);
  },

  async findById(id) {
    const record = await prisma.b2BRequest.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return toB2BRequest(record);
  },
};