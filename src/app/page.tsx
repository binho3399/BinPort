import type { Metadata } from "next";
import Link from "next/link";
import { TrackLink } from "@/components/TrackLink";
import { siteConfig } from "@/config/site";
import { getCaseStudies, getExperiments, getWritingPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Senior Product Designer Portfolio",
  description:
    "Portfolio of Alex Nguyen featuring product design case studies, experiments, and writing."
};

export default function HomePage() {
  const featuredCaseStudies = getCaseStudies()
    .filter((item) => item.frontmatter.featured)
    .slice(0, 3);
  const featuredExperiments = getExperiments()
    .filter((item) => item.frontmatter.featured)
    .slice(0, 3);
  const latestPosts = getWritingPosts().slice(0, 4);

  return (
    <main className="home">
      <section className="home-hero container">
        <span className="home-badge">Senior Product Designer</span>
        <h1>{siteConfig.hero.headline}</h1>
        <p>{siteConfig.hero.subheadline}</p>
        <div className="home-hero-cta">
          <TrackLink
            href={siteConfig.home.primaryCta.href}
            label={siteConfig.home.primaryCta.label}
            eventName={siteConfig.home.primaryCta.eventName}
          />
          <TrackLink
            href={siteConfig.home.secondaryCta.href}
            label={siteConfig.home.secondaryCta.label}
            eventName={siteConfig.home.secondaryCta.eventName}
          />
        </div>
      </section>

      <section className="container">
        <div className="home-proof">
          <p>{siteConfig.home.trustLabel}</p>
          <div className="home-proof-grid">
            {siteConfig.home.trustStats.map((stat) => (
              <article key={stat.label} className="stat-card">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container home-section">
        <div className="section-heading">
          <h2>{siteConfig.home.sections.work.title}</h2>
          <p>{siteConfig.home.sections.work.description}</p>
        </div>
        <div className="feature-grid">
          {featuredCaseStudies.map((item) => (
            <article key={item.frontmatter.slug} className="feature-card">
              <p className="feature-eyebrow">{item.frontmatter.domain}</p>
              <h3>
                <Link href={`/case-studies/${item.frontmatter.slug}`}>{item.frontmatter.title}</Link>
              </h3>
              <p>{item.frontmatter.summary}</p>
              <p className="feature-meta">
                <span>{item.frontmatter.timeline}</span>
                <span>{item.frontmatter.impact}</span>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="container home-section">
        <div className="section-heading">
          <h2>{siteConfig.home.sections.capabilities.title}</h2>
          <p>{siteConfig.home.sections.capabilities.description}</p>
        </div>
        <div className="capability-grid">
          {siteConfig.valuePillars.map((pillar) => (
            <article key={pillar.title} className="capability-card">
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container home-section">
        <div className="section-heading">
          <h2>{siteConfig.home.sections.insights.title}</h2>
          <p>{siteConfig.home.sections.insights.description}</p>
        </div>
        <div className="insight-grid">
          {latestPosts.map((item) => (
            <article key={item.frontmatter.slug} className="insight-card">
              <p className="feature-eyebrow">Writing</p>
              <h3>
                <Link href={`/writing/${item.frontmatter.slug}`}>{item.frontmatter.title}</Link>
              </h3>
            </article>
          ))}
          {featuredExperiments.map((item) => (
            <article key={item.frontmatter.slug} className="insight-card">
              <p className="feature-eyebrow">Experiment</p>
              <h3>
                <Link href={`/experiments/${item.frontmatter.slug}`}>{item.frontmatter.title}</Link>
              </h3>
            </article>
          ))}
        </div>
      </section>

      <section className="container home-section">
        <div className="final-cta">
          <h2>{siteConfig.home.sections.finalCta.title}</h2>
          <p>{siteConfig.home.sections.finalCta.description}</p>
          <div className="home-hero-cta">
            <TrackLink
              href={siteConfig.home.finalCta.primary.href}
              label={siteConfig.home.finalCta.primary.label}
              eventName={siteConfig.home.finalCta.primary.eventName}
            />
            <TrackLink
              href={siteConfig.home.finalCta.secondary.href}
              label={siteConfig.home.finalCta.secondary.label}
              eventName={siteConfig.home.finalCta.secondary.eventName}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
