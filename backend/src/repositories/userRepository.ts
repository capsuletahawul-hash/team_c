export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'Student' | 'Trainer' | 'Company' | 'Admin';
  avatar: string;
  createdAt: string;
}

export type CreateUserInput = Omit<User, 'id' | 'avatar' | 'createdAt'>;

export interface IUserRepository {
  findByEmail(email: string): Promise<User | undefined>;
  findById(id: string): Promise<User | undefined>;
  create(data: CreateUserInput): Promise<User>;
  updateName(id: string, name: string): Promise<User | undefined>;
  updateProfile(id: string, updates: { name?: string; avatar?: string }): Promise<User | undefined>;
}

// تعديل: إضافة حساب الأدمن الثابت ضمن مستودع الذاكرة أو السماح بالتعامل معه إن وُجد في الذاكرة
export { userRepository } from './prismaUserRepository.js';