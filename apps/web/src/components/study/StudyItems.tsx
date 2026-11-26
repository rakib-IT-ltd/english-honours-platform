import { STUDY_TEXT } from '../../lib/studyText';
import { pickText, type StudyItem, type StudyKind } from '../../types/study';
import type { SupportedLanguage } from '@ehp/shared-types';

function Paragraphs({ text, lang }: { text: string; lang: 'en' | 'bn' }) {
  return (
    <>
      {text
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={index} lang={lang} className={lang === 'bn' ? 'study-bn' : undefined}>
            {paragraph}
          </p>
        ))}
    </>
  );
}

/** Renders the items of one kind. The text of the original and the Bangla layers is never mixed. */
export function StudyItems({
  kind,
  items,
  language,
}: {
  kind: StudyKind;
  items: StudyItem[];
  language: SupportedLanguage;
}) {
  const t = STUDY_TEXT[language];
  if (items.length === 0) return <p className="muted">{t.noMaterial}</p>;

  if (kind === 'ORIGINAL_TEXT') {
    return (
      <div className="study-prose study-original">
        {items.map((item) =>
          item.textEn ? <Paragraphs key={item.id} text={item.textEn} lang="en" /> : null,
        )}
      </div>
    );
  }

  if (kind === 'BANGLA_EXPLANATION') {
    return (
      <div className="study-prose">
        {items.map((item) =>
          item.textBn ? <Paragraphs key={item.id} text={item.textBn} lang="bn" /> : null,
        )}
      </div>
    );
  }

  if (kind === 'VOCABULARY') {
    return (
      <ul className="study-vocab">
        {items.map((item) => (
          <li key={item.id}>
            <strong lang="en">{item.textEn}</strong>
            {item.textBn ? (
              <span lang="bn" className="study-bn">
                {item.textBn}
              </span>
            ) : null}
            {item.noteEn ? <small lang="en">{item.noteEn}</small> : null}
          </li>
        ))}
      </ul>
    );
  }

  if (kind === 'QUOTATION') {
    return (
      <div className="study-list">
        {items.map((item) => (
          <figure key={item.id} className="study-quote">
            <blockquote lang="en">{item.textEn}</blockquote>
            {pickText(item.noteEn, item.noteBn, language) ? (
              <figcaption>
                <b>{t.meaning}: </b>
                {pickText(item.noteEn, item.noteBn, language)}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    );
  }

  if (kind === 'QUESTION_ANSWER') {
    return (
      <div className="study-list">
        {items.map((item) => (
          <details key={item.id} className="study-qa">
            <summary>
              <b>{t.question}: </b>
              {pickText(item.textEn, item.textBn, language)}
            </summary>
            {pickText(item.noteEn, item.noteBn, language) ? (
              <p>
                <b>{t.answer}: </b>
                {pickText(item.noteEn, item.noteBn, language)}
              </p>
            ) : (
              <p className="muted">{t.answerNotAdded}</p>
            )}
          </details>
        ))}
      </div>
    );
  }

  // SUMMARY, CRITICAL_ANALYSIS, CENTRAL_IDEA: both languages when both exist.
  const asList = kind === 'CENTRAL_IDEA';
  const body = items.map((item) => (
    <div key={item.id} className={asList ? 'study-idea' : 'study-prose'}>
      {item.textEn ? <Paragraphs text={item.textEn} lang="en" /> : null}
      {item.textBn ? <Paragraphs text={item.textBn} lang="bn" /> : null}
    </div>
  ));
  return <div className={asList ? 'study-ideas' : 'study-list'}>{body}</div>;
}
