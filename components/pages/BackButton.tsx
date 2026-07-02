'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from '../../lib/navigationContext';

export default function BackButton() {
  const navigate = useNavigate();

  if (navigate) {
    return (
      <button
        type="button"
        className="back-circle-control"
        aria-label="Back to home"
        onClick={() => navigate('/')}
      >
        <ChevronLeft size={20} />
      </button>
    );
  }

  return (
    <Link className="back-circle-control" href="/" aria-label="Back to home">
      <ChevronLeft size={20} />
    </Link>
  );
}
