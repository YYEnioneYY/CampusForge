import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MeDto } from './dto/me.dto';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('users.me')
  async me(@Payload() payload: MeDto) {
    return this.usersService.me(payload.accessToken);
  }
}