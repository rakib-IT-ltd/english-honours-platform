import { Body, Controller, Get, Patch, Put, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../authentication/auth.guard.js';
import { CurrentAuth } from '../authentication/current-auth.decorator.js';
import type { VerifiedIdToken } from '../authentication/id-token-verifier.js';
import { MeDto, SaveProfileBody, UpdateMeBody } from './dto/me.dto.js';
import { parseSaveProfile, parseUpdateMe } from './dto/parse.js';
import { toMe, UsersService } from './users.service.js';

@ApiTags('me')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing, invalid or expired token' })
@ApiServiceUnavailableResponse({ description: 'Authentication is not configured on the server' })
@UseGuards(AuthGuard)
@Controller('me')
export class MeController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'The signed-in student (created on first sign-in)' })
  @ApiOkResponse({ type: MeDto })
  async getMe(@CurrentAuth() auth: VerifiedIdToken) {
    return toMe(await this.users.findOrCreate(auth));
  }

  @Patch()
  @ApiOperation({ summary: 'Update display name and/or interface language' })
  @ApiBody({ type: UpdateMeBody })
  @ApiOkResponse({ type: MeDto })
  @ApiBadRequestResponse({ description: 'Invalid body' })
  async updateMe(@CurrentAuth() auth: VerifiedIdToken, @Body() body: unknown) {
    const input = parseUpdateMe(body);
    const user = await this.users.findOrCreate(auth);
    return toMe(await this.users.updateAccount(user.id, input));
  }

  @Put('profile')
  @ApiOperation({
    summary: 'Save the academic identity: university, program, level and (optionally) session',
  })
  @ApiBody({ type: SaveProfileBody })
  @ApiOkResponse({ type: MeDto })
  @ApiBadRequestResponse({ description: 'Invalid body' })
  @ApiUnprocessableEntityResponse({
    description: 'Program/level/session do not belong together at this university',
  })
  async saveProfile(@CurrentAuth() auth: VerifiedIdToken, @Body() body: unknown) {
    const input = parseSaveProfile(body);
    const user = await this.users.findOrCreate(auth);
    return toMe(await this.users.saveProfile(user.id, input));
  }
}
