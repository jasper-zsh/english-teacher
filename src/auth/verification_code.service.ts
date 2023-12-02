import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { VerificationCode } from '@prisma/client';
import moment from 'moment';

@Injectable()
export class VerificationCodeService {
  constructor(private prisma: PrismaService) {}

  async generateVerificationCode(
    bizType: string,
    data: string,
    ttlSeconds: number = 300,
  ): Promise<VerificationCode> {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    return await this.prisma.verificationCode.create({
      data: {
        bizType,
        code,
        data,
        expiresAt: moment().add(ttlSeconds, 'seconds').toDate(),
      },
    });
  }

  async consumeVerificationCode(
    bizType: string,
    code: string,
  ): Promise<VerificationCode | undefined> {
    const res = await this.prisma.verificationCode.findFirst({
      where: {
        bizType,
        code,
      },
    });
    if (!res) {
      return undefined;
    }
    await this.prisma.verificationCode.delete({
      where: {
        id: res.id,
      },
    });
    return res;
  }
}
