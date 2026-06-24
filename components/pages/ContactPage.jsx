import { ArrowUpRight } from 'lucide-react';
import BackButton from './BackButton';

export default function ContactPage() {
  return (
    <main className="experience-page experience-page--contact">
      <section className="contact-page page-shell">
        <header className="page-shell__header">
          <BackButton />
        </header>
        <div className="contact-page__content reveal">
          <div className="page-shell__intro">
            <p>Contact</p>
            <h1>Get in touch.</h1>
          </div>
          <div className="contact-page__links">
            <a href="mailto:hello@hirotos.com" data-cursor-stalker-label="Mail">
              hello@hirotos.com <ArrowUpRight />
            </a>
            <a
              href="https://www.linkedin.com/in/hiroto-sato-2414b23b7"
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
