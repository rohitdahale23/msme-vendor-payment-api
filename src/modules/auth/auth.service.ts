import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  // Hardcoded user for demo purposes
  private readonly hardcodedUser = {
    email: 'admin@qistonpe.com',
    password: 'password123',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Admin User',
  };

  constructor(private readonly jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    if (
      loginDto.email !== this.hardcodedUser.email ||
      loginDto.password !== this.hardcodedUser.password
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: this.hardcodedUser.userId,
      email: this.hardcodedUser.email,
      name: this.hardcodedUser.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: this.hardcodedUser.userId,
        email: this.hardcodedUser.email,
        name: this.hardcodedUser.name,
      },
    };
  }

  async validateUser(userId: string): Promise<any> {
    if (userId === this.hardcodedUser.userId) {
      return {
        id: this.hardcodedUser.userId,
        email: this.hardcodedUser.email,
        name: this.hardcodedUser.name,
      };
    }
    return null;
  }
}
