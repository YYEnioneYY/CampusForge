import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PROFILE_PATTERNS } from '../common/kafka/profile-patterns';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { ProfilesService } from './profiles.service';

@Controller()
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @EventPattern(PROFILE_PATTERNS.USER_REGISTERED)
  async createProfileAfterUserRegistered(
    @Payload() dto: CreateUserProfileDto,
  ): Promise<void> {
    await this.profilesService.createForUser(dto);
  }
}