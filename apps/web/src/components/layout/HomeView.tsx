'use client';

import Link from 'next/link';
import { STRINGS } from '../../lib/i18n';
import { AcademicSelector } from '../academic/AcademicSelector';
import { useAuth, useLanguage } from '../providers/AppProviders';
import { HeroIllustration } from './HeroIllustration';
import { PageShell } from './PageShell';

export function HomeView() {
  const { language } = useLanguage();
  const { status, user, me } = useAuth();
  const t = STRINGS[language];
  const profile = me?.profile ?? null;

  return (
    <PageShell>
      <main>
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <span className="hero-badge">{t.heroBadge}</span>
              <h1>{STRINGS.en.heroTitle}</h1>
              <p lang="bn" className="hero-bn">
                {STRINGS.bn.heroTitle}
              </p>
              <p className="hero-text">{t.heroText}</p>
              <ul className="hero-points">
                {t.heroPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <HeroIllustration />
          </div>
        </section>

        {status === 'signedIn' ? (
          <p className="signed-in-note" role="status">
            {t.welcomeBack} <strong>{me?.displayName ?? user?.displayName ?? user?.email}</strong>.{' '}
            {profile ? null : `${t.completeProfile} `}
            <Link href="/profile">{profile ? t.editProfile : t.myProfile}</Link>
          </p>
        ) : null}

        {/* Remount once the saved identity arrives so it becomes the preselection. */}
        <AcademicSelector
          key={
            profile
              ? `${profile.universityId}/${profile.academicProgramId}/${profile.academicLevelId}`
              : 'none'
          }
          language={language}
          {...(profile
            ? {
                initial: {
                  universityId: profile.universityId,
                  programId: profile.academicProgramId,
                  levelId: profile.academicLevelId,
                },
              }
            : {})}
        />

        <section className="next" id="next" aria-labelledby="next-title">
          <div className="next-inner">
            <div>
              <h2 id="next-title">{t.nextTitle}</h2>
              <p>{t.nextText}</p>
            </div>
            <p className="next-note">{t.nextNote}</p>
          </div>
        </section>

        <section className="why" id="why" aria-labelledby="why-title">
          <h2 id="why-title">{t.whyTitle}</h2>
          <ul className="why-grid">
            {t.whyItems.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                {item.soon ? <span className="soon">{t.comingSoon}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </PageShell>
  );
}
