'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getApiBaseUrl } from '../../lib/api';
import { getIdToken } from '../../lib/auth/authClient';
import { STRINGS } from '../../lib/i18n';
import { saveProfile } from '../../lib/meApi';
import { AcademicSelector, type Selection } from '../academic/AcademicSelector';
import { PageShell } from '../layout/PageShell';
import { useAuth, useLanguage } from '../providers/AppProviders';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function ProfileView() {
  const { language } = useLanguage();
  const { status, me, setMe } = useAuth();
  const t = STRINGS[language];
  const apiConnected = Boolean(getApiBaseUrl());

  const saved = me?.profile ?? null;
  const [selection, setSelection] = useState<Selection | null>(
    saved
      ? {
          universityId: saved.universityId,
          programId: saved.academicProgramId,
          levelId: saved.academicLevelId,
        }
      : null,
  );
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const complete = Boolean(selection?.universityId && selection.programId && selection.levelId);

  async function save() {
    if (!selection || !complete) return;
    setSaveState('saving');
    try {
      const token = await getIdToken();
      if (!token) throw new Error('not signed in');
      setMe(
        await saveProfile(token, {
          universityId: selection.universityId,
          academicProgramId: selection.programId,
          academicLevelId: selection.levelId,
        }),
      );
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }

  let body;
  if (status === 'loading') {
    body = <p>{t.working}</p>;
  } else if (status !== 'signedIn') {
    body = (
      <p role="status" className="notice">
        {t.profileNeedsSignIn} <Link href="/login">{t.signInTitle}</Link>
      </p>
    );
  } else if (!apiConnected) {
    body = (
      <p role="status" className="notice">
        {t.profileNeedsApi}
      </p>
    );
  } else {
    body = (
      <>
        {/* Remount when the saved identity first arrives so it is preselected. */}
        <AcademicSelector
          key={saved ? 'saved' : 'none'}
          language={language}
          showResult={false}
          {...(saved
            ? {
                initial: {
                  universityId: saved.universityId,
                  programId: saved.academicProgramId,
                  levelId: saved.academicLevelId,
                },
              }
            : {})}
          onSelectionChange={(next) => {
            setSelection(next);
            setSaveState('idle');
          }}
        />
        <div className="profile-actions">
          <button
            type="button"
            className="primary-button"
            disabled={!complete || saveState === 'saving'}
            onClick={() => void save()}
          >
            {saveState === 'saving' ? t.working : t.profileSave}
          </button>
          {saveState === 'saved' ? (
            <p role="status" className="form-ok">
              {t.profileSaved} <Link href="/">{t.backToHome}</Link>
            </p>
          ) : null}
          {saveState === 'error' ? (
            <p role="alert" className="form-error">
              {t.profileSaveError}
            </p>
          ) : null}
        </div>
      </>
    );
  }

  return (
    <PageShell>
      <main className="form-page wide">
        <h1>{t.profileTitle}</h1>
        <p className="muted">{t.profileIntro}</p>
        {body}
      </main>
    </PageShell>
  );
}
