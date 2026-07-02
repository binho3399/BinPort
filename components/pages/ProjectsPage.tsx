'use client';

import Image from 'next/image';
import { projects } from '../../lib/projects';
import { projectsPageContent } from '../../lib/siteContent';
import BackButton from './BackButton';

export default function ProjectsPage() {
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
                  {set.map((project) => (
                    <div
                      key={`${setIdx}-${project.title}`}
                      className="projects-marquee__item"
                    >
                      <a
                        className="projects-marquee__card"
                        href={project.href}
                        tabIndex={setIdx > 0 ? -1 : undefined}
                        data-cursor-stalker-label="View"
                      >
                        <figure className="projects-marquee__figure">
                          <Image
                            src={project.image}
                            alt={`${project.title} preview`}
                            width={1600}
                            height={900}
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
      </section>
    </main>
  );
}
