'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import BackButton from './BackButton';

export default function AboutPage() {
  const [lang, setLang] = useState('en');
  const copy = {
    en: [
      'About',
      'Creative developer building interactive web experiences.',
      'I design and implement digital experiences that naturally connect motion, WebGL, 3D modeling, and interface behavior. I specialize in interactive front-end development that brings visual expression and a tactile sense of interaction together.',
      'Name',
      'Hiroto Sato',
      'Role',
      'Creative Developer',
      'Contact',
    ],
    ja: [
      'About',
      'インタラクティブなWeb体験をつくるクリエイティブデベロッパー。',
      'モーション、WebGL、3Dモデリング、インターフェースを組み合わせ、自然に連動するデジタル体験を設計・実装しています。視覚表現と操作感をつなぐ、インタラクティブなフロントエンド制作を得意としています。',
      '名前',
      '佐藤ヒロト',
      '職業',
      'クリエイティブデベロッパー',
      'コンタクト',
    ],
  }[lang];

  return (
    <main className="experience-page experience-page--about">
      <section className="about-page page-shell" lang={lang}>
        <header className="page-shell__header">
          <BackButton />
          <div className="about-language-toggle">
            {['en', 'ja'].map((item) => (
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
            <p>{copy[0]}</p>
            <h1>{copy[1]}</h1>
          </div>
          <div className="about-page__body">
            <p>{copy[2]}</p>
            <dl className="about-page__meta">
              <div>
                <dt>{copy[3]}</dt>
                <dd>{copy[4]}</dd>
              </div>
              <div>
                <dt>{copy[5]}</dt>
                <dd>{copy[6]}</dd>
              </div>
              <div>
                <dt>{copy[7]}</dt>
                <dd>
                  <a href="mailto:hello@hirotos.com" data-cursor-stalker-label="Mail">
                    hello@hirotos.com <ArrowUpRight size={18} />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/hiroto-sato-2414b23b7"
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
