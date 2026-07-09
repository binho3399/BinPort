import { notFound } from 'next/navigation';
import SkyBgTest from '../../../components/debug/SkyBgTest';

export const metadata = {
  title: 'Sky Background Test',
};

export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();

  return <SkyBgTest />;
}
