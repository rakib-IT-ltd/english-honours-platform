import { Suspense } from 'react';
import { BookView } from '../../../components/syllabus/BookView';

export default function BookPage() {
  return (
    <Suspense fallback={null}>
      <BookView />
    </Suspense>
  );
}
