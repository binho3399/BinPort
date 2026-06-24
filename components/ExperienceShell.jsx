'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, ChevronLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import WebGLScene from './WebGLScene';
import { projects } from '../lib/projects';

const routes = [
  ['/', 'Home', 'home'],
  ['/projects', 'Projects', 'projects'],
  ['/about', 'About', 'about'],
  ['/contact', 'Contact', 'contact'],
];

function BackButton() {
  return <Link className="back-circle-control" href="/" data-cursor-stalker-label="Back" aria-label="Back to home"><ChevronLeft size={20} /></Link>;
}

function Home() {
  return (
    <main className="experience-page experience-page--home">
      <section className="hero-section page-shell" aria-label="Signal Pole">
        <div className="home-profile" data-text-reveal>
          <p data-text-reveal-kicker>Product Developer</p>
          <h1 data-text-reveal-heading>HO BINH</h1>
        </div>
        <dl className="home-meta" aria-label="Home details" data-text-reveal>
          <div><dt>Base</dt><dd>Tokyo, Japan</dd></div>
          <div><dt>Focus</dt><dd>Creative development / Motion / 3D modeling</dd></div>
          <div><dt>Index</dt><dd>Portfolio 2026</dd></div>
        </dl>
      </section>
    </main>
  );
}

function Preloader() {
  return (
    <div className="preloader" aria-hidden="true">
      <svg className="preloader__wave" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 100V0h100v100H0Z" />
      </svg>
      <div className="preloader__inner">
        <span className="preloader__text">HO BINH</span>
      </div>
    </div>
  );
}

function PageTransition() {
  return (
    <div className="page-transition" aria-hidden="true">
      <svg className="page-transition__clip-defs">
        <defs>
          <clipPath id="page-transition-clip" clipPathUnits="objectBoundingBox">
            <path d="M0,0 H1 V1 H0 Z" />
          </clipPath>
        </defs>
      </svg>
      <div className="page-transition__background-snapshot" />
      <div className="page-transition__next">
        <div className="page-transition__next-content" />
      </div>
    </div>
  );
}

function Projects() {
  return (
    <main className="experience-page experience-page--projects">
      <section className="projects-page page-shell">
        <header className="page-shell__header"><BackButton /></header>
        <div className="projects-gallery reveal">
          {projects.map((project, index) => (
            <a className="project-card" key={project.title} href={project.href} data-cursor-stalker-label="Open" style={{ '--delay': `${index * 0.045}s` }}>
              <img src={project.image} alt="" draggable="false" />
              <div>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h2>{project.title}</h2>
                <p>{project.type}</p>
                <small>{project.year}</small>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

function About() {
  const [lang, setLang] = useState('en');
  const copy = {
    en: ['About', 'Creative developer building interactive web experiences.', 'I design and implement digital experiences that naturally connect motion, WebGL, 3D modeling, and interface behavior. I specialize in interactive front-end development that brings visual expression and a tactile sense of interaction together.', 'Name', 'Hiroto Sato', 'Role', 'Creative Developer', 'Contact'],
    ja: ['About', 'インタラクティブなWeb体験をつくるクリエイティブデベロッパー。', 'モーション、WebGL、3Dモデリング、インターフェースを組み合わせ、自然に連動するデジタル体験を設計・実装しています。視覚表現と操作感をつなぐ、インタラクティブなフロントエンド制作を得意としています。', '名前', '佐藤ヒロト', '職業', 'クリエイティブデベロッパー', 'コンタクト'],
  }[lang];

  return (
    <main className="experience-page experience-page--about">
      <section className="about-page page-shell" lang={lang}>
        <header className="page-shell__header"><BackButton /><div className="about-language-toggle">{['en', 'ja'].map((item) => <button key={item} type="button" aria-pressed={lang === item} data-cursor-stalker-label={item.toUpperCase()} onClick={() => setLang(item)}>{item.toUpperCase()}</button>)}</div></header>
        <div className="about-page__content reveal">
          <div className="page-shell__intro"><p>{copy[0]}</p><h1>{copy[1]}</h1></div>
          <div className="about-page__body"><p>{copy[2]}</p><dl className="about-page__meta"><div><dt>{copy[3]}</dt><dd>{copy[4]}</dd></div><div><dt>{copy[5]}</dt><dd>{copy[6]}</dd></div><div><dt>{copy[7]}</dt><dd><a href="mailto:hello@hirotos.com" data-cursor-stalker-label="Mail">hello@hirotos.com <ArrowUpRight size={18} /></a><a href="https://www.linkedin.com/in/hiroto-sato-2414b23b7" target="_blank" rel="noreferrer" data-cursor-stalker-label="LinkedIn">LinkedIn <ArrowUpRight size={18} /></a></dd></div></dl></div>
        </div>
      </section>
    </main>
  );
}

function Contact() {
  return (
    <main className="experience-page experience-page--contact">
      <section className="contact-page page-shell">
        <header className="page-shell__header"><BackButton /></header>
        <div className="contact-page__content reveal"><div className="page-shell__intro"><p>Contact</p><h1>Get in touch.</h1></div><div className="contact-page__links"><a href="mailto:hello@hirotos.com" data-cursor-stalker-label="Mail">hello@hirotos.com <ArrowUpRight /></a><a href="https://www.linkedin.com/in/hiroto-sato-2414b23b7" target="_blank" rel="noreferrer" data-cursor-stalker-label="LinkedIn">LinkedIn <ArrowUpRight /></a></div></div>
      </section>
    </main>
  );
}

export default function ExperienceShell() {
  const pathname = usePathname();
  const route = pathname === '/projects' ? 'projects' : pathname === '/about' ? 'about' : pathname === '/contact' ? 'contact' : 'home';
  const page = useRef(null);

  useEffect(() => {
    const handleCursorReset = () => {
      document.body.style.cursor = '';
    };
    window.addEventListener('signal-pole:cursor-reset', handleCursorReset);
    return () => window.removeEventListener('signal-pole:cursor-reset', handleCursorReset);
  }, []);

  const handleNavigate = (href, event) => {
    event.preventDefault();
    document.body.style.cursor = '';
    window.dispatchEvent(new CustomEvent('signal-pole:cursor-reset'));
    window.location.href = href;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (route === 'home') {
        gsap.fromTo('[data-text-reveal-kicker], [data-text-reveal-heading], .home-meta > div', { yPercent: 55, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.8, stagger: 0.055, ease: 'power3.out' });
      } else {
        gsap.fromTo('.reveal', { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.72, stagger: 0.06, ease: 'power3.out' });
      }

      if (route === 'projects') {
        gsap.fromTo('.project-card', { y: 42, autoAlpha: 0 }, { y: 0, autoAlpha: 1, delay: 0.08, duration: 0.75, stagger: 0.045, ease: 'power3.out' });
      }
    }, page);
    return () => ctx.revert();
  }, [route]);

  return (
    <div ref={page} className="persistent-experience is-page-ready is-entered is-page-surface-ready" data-route={route} data-transitioning="false">
      <WebGLScene interactive={route === 'home'} />
      <Preloader />
      <div className="route-current">
        {route === 'projects' ? <Projects /> : route === 'about' ? <About /> : route === 'contact' ? <Contact /> : <Home />}
      </div>
      <nav className="site-nav" aria-label="Primary">{routes.map(([href, label, id]) => <Link key={id} href={href} aria-current={route === id ? 'page' : undefined} data-cursor-stalker-label={label} onClick={(event) => handleNavigate(href, event)}>{label}</Link>)}</nav>
      <PageTransition />
    </div>
  );
}
