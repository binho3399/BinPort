import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function BackButton() {
  return (
    <Link
      className="back-circle-control"
      href="/"
      data-cursor-stalker-label="Back"
      aria-label="Back to home"
    >
      <ChevronLeft size={20} />
    </Link>
  );
}
