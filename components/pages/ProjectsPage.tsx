'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { projects } from '../../lib/projects';
import { projectsPageContent } from '../../lib/siteContent';
import BackButton from './BackButton';

export default function ProjectsPage() {
  const [activeProject, setActiveProject] = useState<(typeof projects)[number] | null>(null);

  return (
    <main className="experience-page experience-page--projects">
      <section className="projects-page">
        <header className="projects-page__header">
          <BackButton />
        </header>
        <header className="projects-page__intro reveal">
          <p>{projectsPageContent.eyebrow}</p>
          <h1>{projectsPageContent.heading}</h1>
        </header>

        <div className="projects-gl-gallery">
          <div className="projects-stack" aria-label="Selected projects">
            {projects.map((project, index) => (
              <a
                className="projects-stack__card"
                href={project.href}
                key={project.title}
                style={{ '--project-index': index } as CSSProperties & Record<'--project-index', number>}
                data-cursor-stalker-label="View Project"
                onPointerEnter={() => setActiveProject(project)}
                onPointerLeave={() => setActiveProject(null)}
                onFocus={() => setActiveProject(project)}
                onBlur={() => setActiveProject(null)}
              >
                <figure className="projects-stack__figure">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={`${project.title} preview`}
                      width={1600}
                      height={900}
                      sizes="(max-width: 768px) 86vw, (max-width: 1280px) 54vw, 42vw"
                      priority={index < 3}
                      draggable={false}
                    />
                  ) : (
                    <div
                      className="projects-stack__placeholder"
                      aria-label={`${project.title} preview unavailable`}
                      role="img"
                    />
                  )}
                  <figcaption className="projects-stack__caption">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{project.title}</strong>
                  </figcaption>
                </figure>
              </a>
            ))}
          </div>
        </div>

        <div className="projects-page__active-meta" aria-live="polite">
          <p>{(activeProject ?? projects[0]).categories.join(' / ').toUpperCase()}</p>
          <h2>{(activeProject ?? projects[0]).title.toUpperCase()}</h2>
        </div>

        <div className="projects-page__mode-pill" aria-label="Project view mode">
          <span aria-current="true">Overview</span>
          <span>Index</span>
        </div>
      </section>
    </main>
  );
}
