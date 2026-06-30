import { ArrowUpRight } from 'lucide-react';
import { contactContent, contactLinks } from '../../lib/siteContent';
import BackButton from './BackButton';

export default function ContactPage() {
  return (
    <main className="experience-page experience-page--contact">
      <section className="contact-page page-shell">
        <header className="page-shell__header">
          <BackButton />
        </header>
        <div className="contact-page__content reveal" suppressHydrationWarning>
          <div className="page-shell__intro">
            <p>{contactContent.eyebrow}</p>
            <h1>{contactContent.heading}</h1>
          </div>
          <div className="contact-page__links">
            <a href={`mailto:${contactLinks.email}`} data-cursor-stalker-label="Mail">
              {contactLinks.email} <ArrowUpRight />
            </a>
            <a
              href={contactLinks.linkedin}
              target="_blank"
              rel="noreferrer"
              data-cursor-stalker-label="LinkedIn"
            >
              LinkedIn <ArrowUpRight />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
