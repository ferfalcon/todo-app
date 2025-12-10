import { prisma } from '../db/client';
import type { User, UserId } from '../domain/models';
import type { User as UserRecord } from '../generated/prisma/client';

function mapUser(record: UserRecord): User {
  return {
    id: record.id as UserId,
    email: record.email,
    passwordHash: record.passwordHash,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export const usersRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const record = await prisma.user.findUnique({
      where: { email },
    });

    return record ? mapUser(record) : null;
  },

  async findById(id: UserId): Promise<User | null> {
    const record = await prisma.user.findUnique({
      where: { id },
    });

    return record ? mapUser(record) : null;
  },

  async createUser(
    email: string,
    passwordHash: string,
  ): Promise<User> {
    const record = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    return mapUser(record);
  },
};
