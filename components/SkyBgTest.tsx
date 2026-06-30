'use client';

import SkyBackground from './SkyBackground';

/**
 * Debug wrapper for the sky background. Renders the shared SkyBackground
 * component inside the fixed full-viewport `.sky-bg-test` shell so the
 * `/bg-test-2` route can be inspected in isolation.
 */
export default function SkyBgTest() {
  return (
    <main className="sky-bg-test">
      <SkyBackground />
    </main>
  );
}
