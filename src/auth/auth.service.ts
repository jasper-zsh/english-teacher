import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { Credential, User } from '@prisma/client';
import { CredentialType } from './auth.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async createUser(
    credentials: { type: string; data: string }[],
  ): Promise<User> {
    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {},
      });
      for (const c of credentials) {
        await tx.credential.create({
          data: {
            userId: user.id,
            ...c,
          },
        });
      }
      return user;
    });
  }

  async addCredential(
    user: User,
    type: string,
    data: string,
  ): Promise<Credential> {
    return await this.prisma.credential.create({
      data: {
        userId: user.id,
        type,
        data,
      },
    });
  }

  async authByPassword(
    type: string,
    data: string,
    password: string,
  ): Promise<User | undefined> {
    const mainCred = await this.prisma.credential.findFirst({
      where: {
        type,
        data,
      },
      include: {
        user: true,
      },
    });
    if (!mainCred) {
      return undefined;
    }
    const pwdCred = await this.prisma.credential.findFirst({
      where: {
        userId: mainCred.userId,
        type: CredentialType.PASSWORD,
      },
    });
    if (!pwdCred) {
      return undefined;
    }
    if (mainCred.user.id !== pwdCred.userId) {
      return undefined;
    }
    if (!(await bcrypt.compare(password, pwdCred.data))) {
      return undefined;
    }
    return mainCred.user;
  }
}
