import { Body, Controller, Delete, Get, HttpCode, Param, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../authentication/auth.guard.js';
import { CurrentAuth } from '../authentication/current-auth.decorator.js';
import type { VerifiedIdToken } from '../authentication/id-token-verifier.js';
import { UsersService } from '../users/users.service.js';
import { MyStudyDto, NoteDto } from './dto/study.dto.js';
import { parseNoteBody, parseProgressBody } from './dto/parse.js';
import { StudyService } from './study.service.js';

/** The signed-in student's own bookmarks, notes and reading progress. */
@ApiTags('my-study')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing, invalid or expired token' })
@UseGuards(AuthGuard)
@Controller('me/study')
export class MyStudyController {
  constructor(
    private readonly study: StudyService,
    private readonly users: UsersService,
  ) {}

  private async userId(auth: VerifiedIdToken) {
    return (await this.users.findOrCreate(auth)).id;
  }

  @Get('books/:bookId')
  @ApiOperation({ summary: 'My progress, bookmarks and notes for one book' })
  @ApiOkResponse({ type: MyStudyDto })
  async mine(@CurrentAuth() auth: VerifiedIdToken, @Param('bookId') bookId: string) {
    return this.study.myStudy(await this.userId(auth), bookId);
  }

  @Put('sections/:id/progress')
  @HttpCode(204)
  @ApiOperation({ summary: 'Record that I opened a section, and whether I finished it' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Section not found or not published' })
  async progress(
    @CurrentAuth() auth: VerifiedIdToken,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    await this.study.setProgress(await this.userId(auth), id, parseProgressBody(body).completed);
  }

  @Put('sections/:id/bookmark')
  @HttpCode(204)
  @ApiOperation({ summary: 'Bookmark a section' })
  @ApiNoContentResponse()
  async bookmark(@CurrentAuth() auth: VerifiedIdToken, @Param('id') id: string) {
    await this.study.addBookmark(await this.userId(auth), id);
  }

  @Delete('sections/:id/bookmark')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove my bookmark from a section' })
  @ApiNoContentResponse()
  async unbookmark(@CurrentAuth() auth: VerifiedIdToken, @Param('id') id: string) {
    await this.study.removeBookmark(await this.userId(auth), id);
  }

  @Put('sections/:id/note')
  @ApiOperation({ summary: 'Save my note on a section (1-5000 characters)' })
  @ApiOkResponse({ type: NoteDto })
  async saveNote(
    @CurrentAuth() auth: VerifiedIdToken,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.study.saveNote(await this.userId(auth), id, parseNoteBody(body));
  }

  @Delete('sections/:id/note')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete my note on a section' })
  @ApiNoContentResponse()
  async deleteNote(@CurrentAuth() auth: VerifiedIdToken, @Param('id') id: string) {
    await this.study.removeNote(await this.userId(auth), id);
  }
}
