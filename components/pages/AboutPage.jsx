'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { aboutContent, aboutLanguages, contactLinks } from '../../lib/siteContent';
import BackButton from './BackButton';

export default function AboutPage() {
  const [lang, setLang] = useState(aboutLanguages[0]);
  const copy = aboutContent[lang];

  return (
    <main className="experience-page experience-page--about">
      <section className="about-page page-shell" lang={lang}>
        <header className="page-shell__header">
          <BackButton />
          <div className="about-language-toggle">
            {aboutLanguages.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={lang === item}
                data-cursor-stalker-label={item.toUpperCase()}
                onClick={() => setLang(item)}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </header>
        <div className="about-page__content reveal">
          <div className="page-shell__intro">
            <p>{copy.eyebrow}</p>
            <h1>{copy.heading}</h1>
          </div>
          <div className="about-page__body">
            <p>{copy.body}</p>
            <dl className="about-page__meta">
              {copy.meta.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
              <div>
                <dt>{copy.contactLabel}</dt>
                <dd>
                  <a href={`mailto:${contactLinks.email}`} data-cursor-stalker-label="Mail">
                    {contactLinks.email} <ArrowUpRight size={18} />
                  </a>
                  <a
                    href={contactLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor-stalker-label="LinkedIn"
                  >
                    LinkedIn <ArrowUpRight size={18} />
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </main>
  );
}
