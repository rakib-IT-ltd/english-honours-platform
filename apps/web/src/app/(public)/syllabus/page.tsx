import { Suspense } from 'react';
import { SyllabusView } from '../../../components/syllabus/SyllabusView';

export default function SyllabusPage() {
  // useSearchParams needs a Suspense boundary for the static export.
  return (
    <Suspense fallback={null}>
      <SyllabusView />
    </Suspense>
  );
}
