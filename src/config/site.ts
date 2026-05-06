export const siteConfig = {
  name: "Alex Nguyen - Senior Product Designer",
  title: "Senior Product Designer + Vibe Coding",
  url: "https://alexnguyen.design",
  locale: "en-US",
  description:
    "I design high-impact digital products and prototype ideas into working experiences with vibe coding.",
  email: "hello@alexnguyen.design",
  linkedIn: "https://linkedin.com/in/alexnguyen",
  cvUrl: "/assets/alex-nguyen-cv.pdf",
  hero: {
    headline: "Designing high-impact products. Shipping fast with vibe coding.",
    subheadline:
      "Senior Product Designer focused on product strategy, design leadership, and AI-assisted prototyping."
  },
  home: {
    trustLabel: "Trusted by product teams building from 0 to 1 and scaling to millions.",
    trustStats: [
      { value: "8+", label: "Years in product design" },
      { value: "30+", label: "Products shipped" },
      { value: "12", label: "Cross-functional teams led" }
    ],
    primaryCta: {
      label: "Book a project call",
      href: "/contact",
      eventName: "home_hero_primary_cta_click"
    },
    secondaryCta: {
      label: "Download CV",
      href: "/assets/alex-nguyen-cv.pdf",
      eventName: "home_hero_secondary_cta_click"
    },
    sections: {
      work: {
        title: "Featured work",
        description:
          "Selected case studies showing how strategy, product thinking, and delivery come together."
      },
      capabilities: {
        title: "Capabilities",
        description:
          "How I support teams across discovery, execution, and design leadership."
      },
      insights: {
        title: "Latest insights",
        description:
          "Recent writing and experiments on design systems, AI workflows, and product decisions."
      },
      finalCta: {
        title: "Ready to build something meaningful?",
        description:
          "Open to product design leadership roles and selective freelance collaborations."
      }
    },
    finalCta: {
      primary: {
        label: "Start a conversation",
        href: "/contact",
        eventName: "home_final_primary_cta_click"
      },
      secondary: {
        label: "Explore all work",
        href: "/work",
        eventName: "home_final_secondary_cta_click"
      }
    }
  },
  valuePillars: [
    {
      title: "Product Thinking",
      description:
        "Discovery to prioritization, mapped to outcomes, business constraints, and user value."
    },
    {
      title: "Design Leadership",
      description:
        "Cross-functional collaboration, decision quality, and scalable design systems."
    },
    {
      title: "Vibe Coding Execution",
      description:
        "Rapid prototypes and experiments that validate ideas before expensive delivery."
    }
  ],
  audiences: [
    "Hiring managers and product leaders",
    "Founders seeking end-to-end product support",
    "Freelance clients looking for strategy + execution"
  ],
  navigation: [
    { label: "Work", href: "/work" },
    { label: "Experiments", href: "/experiments" },
    { label: "Writing", href: "/writing" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" }
  ]
} as const;
