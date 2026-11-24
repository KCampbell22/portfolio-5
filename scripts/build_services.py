"""Generates /services/<slug>/index.html from index.html's header + the content below.

Run from anywhere:  python scripts/build_services.py
Re-run after changing the home page's header/nav so the copies stay in sync.
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://www.kadecampbelldev.com"
home = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()

# Header from the home page, with in-page anchors pointed back at the home page
header = home[home.index('  <div class="nav-wrap">'):home.index('  <main id="main"')]
header = header.replace('<a href="#" class="brand">', '<a href="/" class="brand">')
header = header.replace(', back to top</span>', ', home</span>')
header = re.sub(r'href="#(projects|about|experience|services|contact)"', r'href="/#\1"', header)

theme_script = home[home.index('  <!-- Set the theme before first paint'):home.index('  <link rel="icon"')]

CHECK = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>'
ARROW = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'

PAGES = [
    {
        "slug": "white-label-development",
        "nav": "White-label development",
        "title": "White-Label Web Development for Agencies | Kade Campbell, Des Moines",
        "description": "White-label front-end and React development for agencies. Kade Campbell builds your Figma and Photoshop designs under your brand, NDA-ready, from Grimes near Des Moines, Iowa, and remote.",
        "service_name": "White-label web development for agencies",
        "kicker": "Services · For agencies",
        "h1": "White-label web development for agencies",
        "intro": "When your team is at capacity, I take on the build. You keep the client relationship and your brand; I deliver clean, mobile-first front-end and React work that ships under your name. Based in Grimes, near Des Moines, Iowa, and working remotely with agencies anywhere in the US.",
        "cols": [
            ("What you get", [
                "Your designs built in semantic HTML, CSS, JavaScript or React",
                "Responsive, mobile-first layouts tested across browsers",
                "Accessibility built in: WCAG-minded markup, keyboard and screen reader support",
                "Performance tuned for Core Web Vitals",
                "Clean code your team can maintain after handoff",
            ]),
            ("How I fit into your agency", [
                "White-label: your brand on everything the client sees",
                "NDA-ready before we look at anything",
                "Works in your tools: Slack, Figma, GitHub, your project board",
                "Joins client calls when you want a developer in the room",
                "Clear updates, so you always know where the build stands",
            ]),
        ],
        "steps": [
            ("Send the brief", "Share the designs, scope and deadline. I'll ask questions early instead of guessing later."),
            ("Agree on scope", "You get a clear plan for what's included and when each piece lands."),
            ("Build & review", "I build in your repo or mine, with previews you can share with the client."),
            ("Hand off", "Final code, notes and a walkthrough so your team can take it from there."),
        ],
        "faq": [
            ("Will the client know I'm involved?", "Only if you want them to. By default the work goes out under your agency's name, and I'm happy to sign an NDA first."),
            ("What kinds of projects do you take?", "Marketing sites, landing pages, React apps and component libraries, redesigns, and accessibility or performance fixes on existing sites."),
            ("Do you work with agencies outside Iowa?", "Yes. I'm based near Des Moines and work remotely, in Central Time, with teams anywhere in the US."),
            ("What do you need to get started?", "Design files (Figma or Photoshop), the scope and the deadline. A short intro call is the quickest way to check we're a fit."),
        ],
        "related": ["figma-to-react", "landing-pages"],
    },
    {
        "slug": "figma-to-react",
        "nav": "Figma to React",
        "title": "Figma to React Development | Design-to-Code Developer, Des Moines",
        "description": "Turn Figma designs into fast, accessible React apps and components. Freelance design-to-code development by Kade Campbell in Grimes near Des Moines, Iowa, and remote.",
        "service_name": "Figma to React development",
        "kicker": "Services · Design to code",
        "h1": "Figma to React development",
        "intro": "Send me a Figma (or Photoshop) file and get back a React build that matches it: responsive, accessible, and organized into components your team can reuse. I'm a freelance front-end and React developer based in Grimes, near Des Moines, Iowa, working remotely.",
        "cols": [
            ("What you get", [
                "Pixel-close React components built from your Figma file",
                "Responsive behavior for the breakpoints that aren't in the design",
                "Reusable components that follow your design system",
                "Accessible markup: semantic HTML, focus states, ARIA where needed",
                "Plain HTML, CSS and JavaScript instead, if the project doesn't need React",
            ]),
            ("Good fit for", [
                "Agencies with designs ready and no developer free",
                "Product teams starting or extending a component library",
                "Startups turning a Figma prototype into a working app",
                "Existing sites being redesigned to a new brand",
            ]),
        ],
        "steps": [
            ("Review the file", "I go through the design, flag missing states (hover, error, empty, mobile) and confirm the stack."),
            ("Set up components", "Shared pieces such as buttons, inputs and cards come first, so pages go together fast."),
            ("Build the pages", "Screens are built from those components and checked against the design at every size."),
            ("Polish & hand off", "Accessibility and performance passes, then clean code and notes for your team."),
        ],
        "faq": [
            ("Do my designs need to be perfect first?", "No. I'll point out gaps like missing mobile layouts or states and either fill them in sensibly or check with your designer."),
            ("Can you work inside our existing React codebase?", "Yes. I can follow your conventions and component library, or set up a new project if you're starting fresh."),
            ("Do you only build in React?", "No. If the project is better as a fast static site, I'll build it in semantic HTML, CSS and JavaScript."),
            ("Will it be accessible?", "Accessibility is part of every build: semantic HTML, keyboard support, visible focus and sensible ARIA, with WCAG in mind."),
        ],
        "related": ["white-label-development", "landing-pages"],
    },
    {
        "slug": "landing-pages",
        "nav": "Landing pages",
        "title": "Landing Page Design & Development for Small Businesses | Des Moines",
        "description": "Fast, mobile-first landing pages for small businesses in Des Moines and beyond. Custom-built by freelance web developer Kade Campbell, with no bloated templates.",
        "service_name": "Landing pages for small businesses",
        "kicker": "Services · Small businesses",
        "h1": "Landing pages for small businesses",
        "intro": "A landing page has one job: get the visitor to call, book or buy. I build custom, fast-loading pages that look right on phones and make that next step obvious. I'm a freelance web developer in Grimes, near Des Moines, Iowa, working with businesses locally and remotely.",
        "cols": [
            ("What you get", [
                "A custom page built for your offer, not a stretched template",
                "Mobile-first layout, since most visitors arrive on a phone",
                "Fast loading, tuned for Core Web Vitals",
                "Clear calls to action: contact form, booking link or checkout",
                "Search basics: page titles, descriptions and link previews",
                "Accessible to every visitor, with WCAG in mind",
            ]),
            ("Good fit for", [
                "Launching a new product, service or location",
                "Running ads that need a page built to convert",
                "Replacing an outdated one-page site",
                "Agencies that need landing pages built for their clients",
            ]),
        ],
        "steps": [
            ("Talk it through", "A short call about the offer, the audience and the action you want visitors to take."),
            ("Plan the page", "We agree on sections, content and any design you already have, or I work from your brand."),
            ("Build", "I build the page and share a preview link so you can try it on your own phone."),
            ("Launch", "I connect forms or booking tools and get it live on your domain."),
        ],
        "faq": [
            ("Do you work with businesses outside Des Moines?", "Yes. I'm based in Grimes, near Des Moines, and happy to meet locally, but most of the work happens remotely, so location doesn't matter."),
            ("I don't have a design. Can you still help?", "Yes. I can lay out the page from your logo, colors and content, or build from a design if you already have one."),
            ("Can you connect it to the tools I already use?", "Usually, yes: contact forms, booking tools like Calendly, payment and email sign-up services."),
            ("Will I be able to update it?", "We'll talk about how often you expect to change it, and I'll set it up so updates are straightforward."),
        ],
        "related": ["white-label-development", "figma-to-react"],
    },
]
BY_SLUG = {p["slug"]: p for p in PAGES}


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def page_html(p):
    url = f"{SITE}/services/{p['slug']}/"
    ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Service",
                "name": p["service_name"],
                "description": p["description"],
                "url": url,
                "serviceType": p["service_name"],
                "provider": {"@id": f"{SITE}/#business"},
                "areaServed": [
                    {"@type": "City", "name": "Des Moines, IA"},
                    {"@type": "Country", "name": "United States"},
                ],
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
                    {"@type": "ListItem", "position": 2, "name": "Services", "item": f"{SITE}/#services"},
                    {"@type": "ListItem", "position": 3, "name": p["nav"], "item": url},
                ],
            },
        ],
    }
    ld_text = json.dumps(ld, indent=2, ensure_ascii=False).replace("\n", "\n  ")

    cols = "\n".join(
        f'''        <article class="card">
          <h3>{esc(h)}</h3>
          <ul class="check-list">
{chr(10).join(f"            <li>{CHECK}{esc(i)}</li>" for i in items)}
          </ul>
        </article>'''
        for h, items in p["cols"]
    )
    steps = "\n".join(
        f'''        <li class="card">
          <h3>{esc(h)}</h3>
          <p>{esc(t)}</p>
        </li>'''
        for h, t in p["steps"]
    )
    faq = "\n".join(
        f'''        <details class="card">
          <summary>{esc(q)}</summary>
          <p>{esc(a)}</p>
        </details>'''
        for q, a in p["faq"]
    )
    related = "\n".join(
        f'        <a href="/services/{r}/" class="btn btn-outline">{esc(BY_SLUG[r]["nav"])}</a>'
        for r in p["related"]
    )

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{esc(p['description'])}">
  <meta name="theme-color" content="#F7F8FC" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0F1120" media="(prefers-color-scheme: dark)">
  <title>{esc(p['title'])}</title>

  <link rel="canonical" href="{url}">

  <!-- Link previews (LinkedIn, Slack, iMessage, etc.) -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{SITE}/images/share.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Kade Campbell, freelance web developer">
  <meta name="twitter:card" content="summary_large_image">
  <meta property="og:title" content="{esc(p['h1'])} | Kade Campbell">
  <meta property="og:description" content="{esc(p['description'])}">

  <script type="application/ld+json">
  {ld_text}
  </script>

{theme_script}  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">

  <link rel="stylesheet" href="/style.css">
  <script src="/index.js" defer></script>
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>

{header}  <main id="main" tabindex="-1">
    <section class="container page-hero" aria-labelledby="page-title">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          <li><a href="/#services">Services</a></li>
          <li aria-current="page">{esc(p['nav'])}</li>
        </ol>
      </nav>
      <h1 id="page-title" class="hero-title"><span class="hero-kicker">{esc(p['kicker'])}</span> {esc(p['h1'])}</h1>
      <p class="hero-text">{esc(p['intro'])}</p>
      <div class="btn-row">
        <a href="https://calendly.com/kadecampbelldev" class="btn btn-accent btn-lg js-calendly" target="_blank" rel="noopener">Book a free intro call<span class="visually-hidden"> (opens scheduling)</span>
          {ARROW}
        </a>
        <a href="/#projects" class="btn btn-outline btn-lg">See my work</a>
      </div>
    </section>

    <section class="container section" aria-labelledby="included-title">
      <h2 id="included-title" class="section-title">What's included</h2>
      <div class="page-cols">
{cols}
      </div>
    </section>

    <section class="container section" aria-labelledby="process-title">
      <h2 id="process-title" class="section-title">How it works</h2>
      <ol class="steps">
{steps}
      </ol>
    </section>

    <section class="container section" aria-labelledby="faq-title">
      <h2 id="faq-title" class="section-title">Questions</h2>
      <div class="faq">
{faq}
      </div>
    </section>

    <section class="container section" aria-labelledby="related-title">
      <h2 id="related-title" class="section-title">Other services</h2>
      <div class="related-list">
{related}
        <a href="/#services" class="btn btn-outline">All services</a>
      </div>
    </section>

    <section class="container section contact-section" aria-labelledby="cta-title">
      <div class="contact-band">
        <div class="contact-dots" aria-hidden="true"></div>
        <div class="contact-head">
          <div class="contact-copy">
            <p class="eyebrow eyebrow-on-dark">contact</p>
            <h2 id="cta-title">Have a project in mind? Let's talk.</h2>
            <p>Tell me about it, or grab a free 30-minute intro call. I'll get back to you as soon as possible.</p>
          </div>
          <div class="btn-row">
            <a href="https://calendly.com/kadecampbelldev" class="btn btn-lavender btn-lg js-calendly" target="_blank" rel="noopener">Book an intro call<span class="visually-hidden"> (opens scheduling)</span>
              {ARROW}
            </a>
            <a href="/#contact-form" class="btn btn-ghost-dark btn-lg">Send a message</a>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="container site-footer">
    <p>© <span id="year">2026</span> Kade Campbell · Grimes, Iowa</p>
    <ul>
      <li><a href="https://www.linkedin.com/in/kade-campbell-21a3601aa/" target="_blank" rel="noopener">LinkedIn<span class="visually-hidden"> (opens in new tab)</span></a></li>
      <li><a href="https://github.com/KCampbell22" target="_blank" rel="noopener">GitHub<span class="visually-hidden"> (opens in new tab)</span></a></li>
      <li><a href="#">Back to top <span aria-hidden="true">↑</span></a></li>
    </ul>
  </footer>
</body>
</html>
'''



if __name__ == "__main__":
    for p in PAGES:
        out_dir = os.path.join(ROOT, "services", p["slug"])
        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8", newline="\n") as f:
            f.write(page_html(p))
        print("wrote", out_dir)
