import { notFound } from 'next/navigation';
import CodeGraphUI from './CodeGraphUI';
import { hasCodegraphDb } from '../../../lib/debug/codegraph-db';

export const metadata = { title: 'CodeGraph Explorer' };

export default function CodeGraphPage() {
  if (process.env.NODE_ENV === 'production' || !hasCodegraphDb()) {
    notFound();
  }

  return <CodeGraphUI />;
}
