import { randomUUID } from 'crypto';
import type { User, IUserRepository } from './userRepository.ts';

const users: User[] = [];

export const memoryUserRepository: IUserRepository = {
  async findByEmail(email) {
    return users.find((user) => user.email === email);
  },

  async findById(id) {
    return users.find((user) => user.id === id);
  },

  async create(data) {
    const newUser: User = {
      id: randomUUID(),
      avatar: '',
      createdAt: new Date().toISOString(),
      ...data
    };
    users.push(newUser);
    return newUser;
  },

  async updateName(id, name) {
    const user = users.find((u) => u.id === id);
    if (user) user.name = name;
    return user;
  },

  async updateProfile(id, updates) {
    const user = users.find((u) => u.id === id);
    if (!user) return undefined;
    if (updates.name !== undefined) user.name = updates.name;
    if (updates.avatar !== undefined) user.avatar = updates.avatar;
    return user;
  }
};