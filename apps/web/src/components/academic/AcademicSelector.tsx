'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { SupportedLanguage } from '@ehp/shared-types';
import { useApiList } from '../../hooks/useApiList';
import { buildApiUrl, getApiBaseUrl } from '../../lib/api';
import { displayName, STRINGS } from '../../lib/i18n';
import { syllabusHref } from '../../lib/routes';
import type {
  AcademicLevel,
  AcademicProgram,
  Department,
  SyllabusSummary,
  University,
} from '../../types/academic';

interface Choice {
  id: string;
  nameEn: string;
  nameBn: string | null;
}

/** A row of selectable cards. `badge` is shown in the card's round marker. */
function ChoiceCards<T extends Choice>(props: {
  items: T[];
  selectedId: string;
  language: SupportedLanguage;
  badge: (item: T) => string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="choice-grid">
      {props.items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className={`choice tone-${index % 2}`}
          aria-pressed={props.selectedId === item.id}
          onClick={() => props.onSelect(item.id)}
        >
          <span className="choice-badge" aria-hidden="true">
            {props.badge(item)}
          </span>
          <span className="choice-name">{displayName(item, props.language)}</span>
          <span className="choice-arrow" aria-hidden="true">
            →
          </span>
        </button>
      ))}
    </div>
  );
}

function Step(props: {
  number: number;
  title: string;
  text: string;
  caption?: string | undefined;
  children: React.ReactNode;
}) {
  const headingId = `step-${props.number}-title`;
  return (
    <section className="step" aria-labelledby={headingId}>
      <div className="step-head">
        <span className="step-number" aria-hidden="true">
          {props.number}
        </span>
        <div>
          <h2 id={headingId}>{props.title}</h2>
          <p>{props.text}</p>
          {props.caption ? <p className="step-caption">{props.caption}</p> : null}
        </div>
      </div>
      {props.children}
    </section>
  );
}

/**
 * University -> program -> level picker. Everything comes from the API; no university, program or
 * syllabus is hardcoded here.
 */
export interface Selection {
  universityId: string;
  programId: string;
  levelId: string;
}

export function AcademicSelector({
  language,
  initial,
  onSelectionChange,
  onLevelChosen,
  showResult = true,
}: {
  language: SupportedLanguage;
  /** Preselected ids (e.g. the signed-in student's profile). Read once, on first render. */
  initial?: Selection;
  onSelectionChange?: (selection: Selection) => void;
  /** Called when the student clicks a level (the last choice). */
  onLevelChosen?: (selection: Selection) => void;
  showResult?: boolean;
}) {
  const t = STRINGS[language];
  const base = getApiBaseUrl();

  const [universityId, setUniversityIdState] = useState(initial?.universityId ?? '');
  const [programId, setProgramIdState] = useState(initial?.programId ?? '');
  const [levelId, setLevelIdState] = useState(initial?.levelId ?? '');

  const change = (next: Selection) => {
    setUniversityIdState(next.universityId);
    setProgramIdState(next.programId);
    setLevelIdState(next.levelId);
    onSelectionChange?.(next);
  };

  const universities = useApiList<University>(base ? buildApiUrl(base, 'universities') : null);
  const programs = useApiList<AcademicProgram>(
    base && universityId ? buildApiUrl(base, 'academic-programs', { universityId }) : null,
  );
  const departments = useApiList<Department>(
    base && universityId ? buildApiUrl(base, 'departments', { universityId }) : null,
  );
  const levels = useApiList<AcademicLevel>(
    base && programId
      ? buildApiUrl(base, 'academic-levels', { academicProgramId: programId })
      : null,
  );
  const syllabuses = useApiList<SyllabusSummary>(
    base && universityId && programId && levelId
      ? buildApiUrl(base, 'syllabuses', {
          universityId,
          academicProgramId: programId,
          academicLevelId: levelId,
          isCurrent: 'true',
        })
      : null,
  );

  const universityItems = universities.status === 'ok' ? universities.data : [];
  const programItems = programs.status === 'ok' ? programs.data : [];
  const levelItems = levels.status === 'ok' ? levels.data : [];
  const departmentId = programItems.find((program) => program.id === programId)?.departmentId;
  const departmentList = departments.status === 'ok' ? departments.data : [];
  // The department the chosen program belongs to; before a program is chosen, the university's department.
  const department =
    departmentList.find((item) => item.id === departmentId) ??
    (departmentList.length === 1 ? departmentList[0] : undefined);

  let message: string | null = null;
  if (!base) message = t.notConnected;
  else if (universities.status === 'error') message = t.loadError;
  else if (universities.status === 'ok' && universityItems.length === 0) message = t.noUniversities;
  else if (programs.status === 'error' || levels.status === 'error') message = t.loadError;
  else if (programs.status === 'ok' && programItems.length === 0) message = t.noPrograms;

  return (
    <div className="selector">
      <Step number={1} title={t.step1Title} text={t.step1Text}>
        {universities.status === 'loading' ? <p className="muted">{t.loading}</p> : null}
        <ChoiceCards
          items={universityItems}
          selectedId={universityId}
          language={language}
          badge={(university) => university.code.slice(0, 2).toUpperCase()}
          onSelect={(id) => change({ universityId: id, programId: '', levelId: '' })}
        />
        {message ? (
          <p role="status" className="notice">
            {message}
          </p>
        ) : null}
      </Step>

      {universityId ? (
        <Step
          number={2}
          title={t.step2Title}
          text={t.step2Text}
          caption={department ? displayName(department, language) : undefined}
        >
          {programs.status === 'loading' ? <p className="muted">{t.loading}</p> : null}
          <ChoiceCards
            items={programItems}
            selectedId={programId}
            language={language}
            badge={(program) => program.code.slice(0, 2).toUpperCase()}
            onSelect={(id) => change({ universityId, programId: id, levelId: '' })}
          />
        </Step>
      ) : null}

      {programId ? (
        <Step number={3} title={t.step3Title} text={t.step3Text}>
          {levels.status === 'loading' ? <p className="muted">{t.loading}</p> : null}
          <ChoiceCards
            items={levelItems}
            selectedId={levelId}
            language={language}
            badge={(level) => String(level.sequence)}
            onSelect={(id) => {
              const next = { universityId, programId, levelId: id };
              change(next);
              onLevelChosen?.(next);
            }}
          />
        </Step>
      ) : null}

      {showResult ? (
        <section className="result" aria-live="polite" aria-labelledby="result-title">
          <h2 id="result-title">{t.resultTitle}</h2>
          {syllabuses.status === 'idle' ? <p>{t.resultPrompt}</p> : null}
          {syllabuses.status === 'loading' ? <p>{t.loading}</p> : null}
          {syllabuses.status === 'error' ? <p>{t.loadError}</p> : null}
          {syllabuses.status === 'ok' && syllabuses.data.length === 0 ? (
            <p>{t.noSyllabus}</p>
          ) : null}
          {syllabuses.status === 'ok'
            ? syllabuses.data.map((syllabus) => (
                <p key={syllabus.id}>
                  {t.version}: {syllabus.versionLabel}{' '}
                  <span
                    className={syllabus.verificationStatus === 'VERIFIED' ? 'badge ok' : 'badge'}
                  >
                    {syllabus.verificationStatus === 'VERIFIED' ? t.verified : t.unverified}
                  </span>
                </p>
              ))
            : null}
          {universityId && programId && levelId ? (
            <p>
              <Link
                className="primary-button link-button"
                href={syllabusHref({ universityId, programId, levelId })}
              >
                {t.viewSyllabus} →
              </Link>
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
