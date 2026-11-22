'use client';

import { useState } from 'react';
import type { SupportedLanguage } from '@ehp/shared-types';
import { useApiList } from '../../hooks/useApiList';
import { buildApiUrl, getApiBaseUrl } from '../../lib/api';
import { displayName, STRINGS } from '../../lib/i18n';
import type {
  AcademicLevel,
  AcademicProgram,
  SyllabusSummary,
  University,
} from '../../types/academic';

interface SelectProps<T extends { id: string; nameEn: string; nameBn: string | null }> {
  id: string;
  label: string;
  placeholder: string;
  items: T[];
  value: string;
  disabled: boolean;
  language: SupportedLanguage;
  onChange: (value: string) => void;
}

function Select<T extends { id: string; nameEn: string; nameBn: string | null }>(
  props: SelectProps<T>,
) {
  return (
    <div className="field">
      <label htmlFor={props.id}>{props.label}</label>
      <select
        id={props.id}
        value={props.value}
        disabled={props.disabled}
        onChange={(event) => props.onChange(event.target.value)}
      >
        <option value="">{props.placeholder}</option>
        {props.items.map((item) => (
          <option key={item.id} value={item.id}>
            {displayName(item, props.language)}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * University -> program -> level picker. Everything comes from the API; no university, program or
 * syllabus is hardcoded here.
 */
export function AcademicSelector({ language }: { language: SupportedLanguage }) {
  const t = STRINGS[language];
  const base = getApiBaseUrl();

  const [universityId, setUniversityId] = useState('');
  const [programId, setProgramId] = useState('');
  const [levelId, setLevelId] = useState('');

  const universities = useApiList<University>(base ? buildApiUrl(base, 'universities') : null);
  const programs = useApiList<AcademicProgram>(
    base && universityId ? buildApiUrl(base, 'academic-programs', { universityId }) : null,
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

  let message: string | null = null;
  if (!base) message = t.notConnected;
  else if (universities.status === 'error') message = t.loadError;
  else if (universities.status === 'ok' && universityItems.length === 0) message = t.noUniversities;
  else if (programs.status === 'ok' && programItems.length === 0) message = t.noPrograms;
  else if (programs.status === 'error' || levels.status === 'error') message = t.loadError;

  return (
    <section aria-labelledby="choose-title" className="card">
      <h2 id="choose-title">{t.chooseTitle}</h2>

      {message ? (
        <p role="status" className="notice">
          {message}
        </p>
      ) : null}

      <div className="fields">
        <Select
          id="university"
          label={t.university}
          placeholder={universities.status === 'loading' ? t.loading : t.selectPlaceholder}
          items={universityItems}
          value={universityId}
          disabled={universityItems.length === 0}
          language={language}
          onChange={(value) => {
            setUniversityId(value);
            setProgramId('');
            setLevelId('');
          }}
        />
        <Select
          id="program"
          label={t.program}
          placeholder={programs.status === 'loading' ? t.loading : t.selectPlaceholder}
          items={programItems}
          value={programId}
          disabled={!universityId || programItems.length === 0}
          language={language}
          onChange={(value) => {
            setProgramId(value);
            setLevelId('');
          }}
        />
        <Select
          id="level"
          label={t.level}
          placeholder={levels.status === 'loading' ? t.loading : t.selectPlaceholder}
          items={levelItems}
          value={levelId}
          disabled={!programId || levelItems.length === 0}
          language={language}
          onChange={setLevelId}
        />
      </div>

      <div className="result" aria-live="polite">
        <h3>{t.resultTitle}</h3>
        {syllabuses.status === 'idle' ? <p>{t.resultPrompt}</p> : null}
        {syllabuses.status === 'loading' ? <p>{t.loading}</p> : null}
        {syllabuses.status === 'ok' && syllabuses.data.length === 0 ? <p>{t.noSyllabus}</p> : null}
        {syllabuses.status === 'ok'
          ? syllabuses.data.map((syllabus) => (
              <p key={syllabus.id}>
                {t.version}: {syllabus.versionLabel}{' '}
                <span className={syllabus.verificationStatus === 'VERIFIED' ? 'badge ok' : 'badge'}>
                  {syllabus.verificationStatus === 'VERIFIED' ? t.verified : t.unverified}
                </span>
              </p>
            ))
          : null}
      </div>
    </section>
  );
}
