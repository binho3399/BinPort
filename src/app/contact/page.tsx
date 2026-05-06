import { TrackLink } from "@/components/TrackLink";
import { siteConfig } from "@/config/site";

export default function ContactPage() {
  return (
    <main className="container stack">
      <h1>Contact</h1>
      <section className="card stack">
        <p style={{ margin: 0 }}>
          For full-time roles, consulting, and product design collaborations.
        </p>
        <TrackLink
          href={`mailto:${siteConfig.email}`}
          label={`Email: ${siteConfig.email}`}
          eventName="click_contact_email"
        />
        <TrackLink
          href={siteConfig.linkedIn}
          label="LinkedIn Profile"
          eventName="click_contact_linkedin"
        />
      </section>
    </main>
  );
}
