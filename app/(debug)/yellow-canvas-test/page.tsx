import { notFound } from 'next/navigation';
import YellowCanvasTest from '../../../components/YellowCanvasTest';

export const metadata = {
  title: 'Yellow Canvas Test',
};

export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();

  return <YellowCanvasTest />;
}
