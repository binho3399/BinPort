'use client';

import Image from 'next/image';
import { useState } from 'react';
import { projects } from '../../lib/projects';
import { projectsPageContent } from '../../lib/siteContent';
import BackButton from './BackButton';

export default function ProjectsPage() {
  const [activeProject, setActiveProject] = useState<(typeof projects)[number] | null>(null);
  // Two sets of the same items for a seamless -50% loop.
  const sets = [projects, projects];

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
          <div className="projects-marquee">
            <div className="projects-marquee__track">
              {sets.map((set, setIdx) => (
                <div
                  className="projects-marquee__set"
                  key={`set-${setIdx}`}
                  aria-hidden={setIdx > 0 ? 'true' : undefined}
                >
                  {set.map((project, projectIdx) => (
                    <div
                      key={`${setIdx}-${project.title}`}
                      className="projects-marquee__item"
                    >
                      <a
                        className="projects-marquee__card"
                        href={project.href}
                        tabIndex={setIdx > 0 ? -1 : undefined}
                        data-cursor-stalker-label="View Project"
                        onPointerEnter={() => setActiveProject(project)}
                        onPointerLeave={() => setActiveProject(null)}
                        onFocus={() => setActiveProject(project)}
                        onBlur={() => setActiveProject(null)}
                      >
                        <figure className="projects-marquee__figure">
                          <Image
                            src={project.image}
                            alt={`${project.title} preview`}
                            width={1600}
                            height={900}
                            sizes="(max-width: 768px) 92vw, (max-width: 1280px) 42vw, 33vw"
                            loading={setIdx === 0 && projectIdx === 0 ? 'eager' : 'lazy'}
                            fetchPriority={setIdx === 0 && projectIdx === 0 ? 'high' : 'auto'}
                            draggable={false}
                          />
                        </figure>
                      </a>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {activeProject ? (
          <div className="projects-page__active-meta" aria-live="polite">
            <p>{activeProject.categories.join(' / ').toUpperCase()}</p>
            <h2>{activeProject.title.toUpperCase()}</h2>
          </div>
        ) : null}
      </section>
    </main>
  );
}
