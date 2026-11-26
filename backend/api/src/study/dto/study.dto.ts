import { ApiProperty } from '@nestjs/swagger';
import { STUDY_KINDS } from '../study-kinds.js';

export class SectionSummaryDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) bookId!: string;
  @ApiProperty({ type: Number }) sequence!: number;
  @ApiProperty({ type: String }) titleEn!: string;
  @ApiProperty({ type: String, nullable: true }) titleBn!: string | null;
  @ApiProperty({ type: String, nullable: true }) subtitleEn!: string | null;
  @ApiProperty({ type: String, nullable: true }) subtitleBn!: string | null;
  @ApiProperty({ type: Boolean, description: 'Development sample content (labelled in the UI)' })
  isSample!: boolean;
  @ApiProperty({ enum: STUDY_KINDS, isArray: true, description: 'Kinds of material available' })
  availableKinds!: string[];
}

export class StudyItemDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ enum: STUDY_KINDS }) kind!: string;
  @ApiProperty({ type: Number }) sequence!: number;
  @ApiProperty({ type: String, nullable: true }) textEn!: string | null;
  @ApiProperty({ type: String, nullable: true }) textBn!: string | null;
  @ApiProperty({ type: String, nullable: true }) noteEn!: string | null;
  @ApiProperty({ type: String, nullable: true }) noteBn!: string | null;
}

export class SectionDetailDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) bookId!: string;
  @ApiProperty({ type: Number }) sequence!: number;
  @ApiProperty({ type: String }) titleEn!: string;
  @ApiProperty({ type: String, nullable: true }) titleBn!: string | null;
  @ApiProperty({ type: String, nullable: true }) subtitleEn!: string | null;
  @ApiProperty({ type: String, nullable: true }) subtitleBn!: string | null;
  @ApiProperty({ type: Boolean }) isSample!: boolean;
  @ApiProperty({ type: StudyItemDto, isArray: true }) items!: StudyItemDto[];
  @ApiProperty({ type: String, nullable: true }) previousSectionId!: string | null;
  @ApiProperty({ type: String, nullable: true }) nextSectionId!: string | null;
}

export class ResourceSectionDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: Number }) sequence!: number;
  @ApiProperty({ type: String }) titleEn!: string;
  @ApiProperty({ type: String, nullable: true }) titleBn!: string | null;
  @ApiProperty({ type: Boolean }) isSample!: boolean;
  @ApiProperty({ type: StudyItemDto, isArray: true }) items!: StudyItemDto[];
}

export class NoteDto {
  @ApiProperty({ type: String }) sectionId!: string;
  @ApiProperty({ type: String }) body!: string;
  @ApiProperty({ type: String, format: 'date-time' }) updatedAt!: string;
}

export class MyStudyDto {
  @ApiProperty({ type: String, isArray: true }) completedSectionIds!: string[];
  @ApiProperty({ type: String, nullable: true, description: 'Most recently opened section' })
  lastSectionId!: string | null;
  @ApiProperty({ type: String, isArray: true }) bookmarkedSectionIds!: string[];
  @ApiProperty({ type: NoteDto, isArray: true }) notes!: NoteDto[];
}
