import type { CSSProperties } from 'react';
import Image from 'next/image';
import { projects } from '../../lib/projects';
import BackButton from './BackButton';

type ProjectCardStyle = CSSProperties & { '--delay': string };

export default function ProjectsPage() {
  return (
    <main className="experience-page experience-page--projects">
      <section className="projects-page page-shell">
        <header className="page-shell__header">
          <BackButton />
        </header>
        <div className="projects-gallery reveal" suppressHydrationWarning>
          {projects.map((project, index) => (
            <a
              className="project-card"
              key={project.title}
              href={project.href}
              data-cursor-stalker-label="Open"
              suppressHydrationWarning
              style={{ '--delay': `${index * 0.045}s` } as ProjectCardStyle}
            >
              <Image
                src={project.image}
                alt={`${project.title} preview`}
                width={1600}
                height={900}
                draggable={false}
              />
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
