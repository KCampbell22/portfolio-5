"""Generates /projects/<slug>/index.html (case-study pages) from the content below.

Run from anywhere:  python scripts/build_projects.py
Re-run after editing a project here, or after changing the home page's header/nav.

Projects marked "draft": True are still built (so you can preview them), but get
<meta name="robots" content="noindex"> so search engines skip them until they're filled in.
When a write-up is finished, set draft to False, add it to sitemap.xml and add a
"Case study" link to its card on the home page (see the StowList card for an example).

Body text below is written as HTML (links, <strong> etc. are fine).
"""
import json, os

from build_services import ROOT, SITE, header, theme_script, ARROW, CHECK, esc

ARROW_OUT = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9"/></svg>'

PROJECTS = [
    {
        "slug": "stowlist",
        "draft": False,
        "name": "StowList",
        "title": "StowList: QR Code Storage Box Inventory App (React + Supabase) | Kade Campbell",
        "description": "Case study: StowList, a mobile-first React and Supabase app that puts a QR label on every storage box so you can scan it and see what's inside. Built by freelance web developer Kade Campbell.",
        "kicker": "Case study · Full-stack web app",
        "summary": "Stick a QR label on any box, scan it with your phone, and see what's inside. StowList is a mobile-first web app for keeping track of what's stored in boxes, bins and shelves.",
        "hue": 200,
        "image": "stowlist",
        "alt": "Three phone screens of StowList: a list of storage boxes with search, a box's items with a photo and its QR label, and the page for printing QR labels",
        "facts": [("Type", "Personal project"), ("Role", "Design &amp; development"), ("Stack", "React · Supabase · Postgres")],
        "live": "https://stowlist-kadecampbell.netlify.app/",
        "github": "https://github.com/KCampbell22/StowList",
        "tags": ["React 18", "React Router", "Vite", "Supabase", "PostgreSQL", "Netlify"],
        "sections": [
            ("The idea", [
                "Storage boxes all look the same from the outside. Instead of opening every bin to find one cable, each box gets a printable QR label. Scanning it with any phone camera opens that box's list of contents, ready to add, edit or remove items.",
            ]),
            ("What it does", [
                ("ul", [
                    "<strong>QR labels for every box.</strong> A label is created automatically with each box, or print a sheet of blank labels first and set up each box the first time it's scanned.",
                    "<strong>Scan to open.</strong> Any phone camera works, since the QR code is just a link. An in-app scanner also recognizes other products' barcodes and QR codes, so existing packaging can be used as a label.",
                    "<strong>Items with photos</strong>, with quantities, descriptions and a photo taken straight from the phone camera.",
                    "<strong>Search across every box</strong> by item name or description.",
                    "<strong>Printable label sheets</strong> laid out four across for sticker paper.",
                    "<strong>Accounts</strong> with email and password, including password reset.",
                ]),
            ]),
            ("How it works", [
                "<strong>No custom server.</strong> The React front end talks to Supabase directly, and the database itself decides who can see what.",
                "<strong>Security lives in the database.</strong> Every table has a <code>user_id</code> column and Postgres row-level security policies (<code>user_id = auth.uid()</code>), so a query can only ever return the signed-in user's rows, even if the front end had a bug. Item photos sit in a private storage bucket, filed under each user's own folder with matching policies, and are shown through short-lived signed URLs.",
                "<strong>Labels are just links.</strong> Each QR code holds a short URL. Opening it looks the code up and either opens the box, offers to set up a new box for a blank label, or shows \"Label not found\". Signed-out visitors are sent to sign in and then returned to the box they scanned.",
            ]),
            # TODO: add a "What I learned" or "What's next" section, and a short screen recording of scanning a label
        ],
    },
    {
        "slug": "st-louis-county-portal",
        "draft": False,
        "name": "St. Louis County Portal",
        "title": "St. Louis County Permitting Portal Redesign | Kade Campbell, Web Developer",
        "description": "Case study: leading the redesign of St. Louis County's public permitting and contractor licensing portal to match the county's new brand, customizing Accela Citizen Access with HTML and CSS.",
        "kicker": "Case study · Employer project",
        "summary": "As an applications developer at St. Louis County, I led the redesign of the county's public permitting and contractor licensing portal to match its new brand identity.",
        "hue": 245,
        "image": "stl-county-portal",
        "alt": "Screenshot of St. Louis County's permitting and contractor licensing portal",
        "facts": [("Type", "Employer project"), ("Role", "Applications Developer"), ("When", "2023 – 2025")],
        "live": "https://aca-prod.accela.com/SLC/Default.aspx",
        "github": None,
        "note": "Built while employed by St. Louis County. The portal and its branding belong to the county.",
        "tags": ["HTML", "CSS", "JavaScript", "SQL", "Accela Citizen Access"],
        "sections": [
            ("The project", [
                "When St. Louis County rolled out a new brand identity, its public-facing permitting and contractor licensing portal needed to match. Residents and contractors use the portal to apply for permits and licenses, so it had to stay familiar and working while it changed.",
                "I led the redesign, customizing the Accela Citizen Access platform with HTML and CSS to bring the portal in line with the county's new look.",
            ]),
            ("My role", [
                "I joined St. Louis County as an applications developer through TEKsystems on a contract-to-hire basis and was brought on full-time after two months. Alongside the portal redesign I:",
                ("ul", [
                    "Partnered with multiple county departments to translate their processes into custom software workflows",
                    "Wrote JavaScript business logic and SQL to automate processes",
                    "Handled both day-to-day support tickets and larger projects",
                ]),
            ]),
            # TODO: add specifics, e.g. what changed (layout, navigation, mobile, accessibility), constraints of
            # styling a hosted platform, and anything measurable (fewer support calls, faster applications)
        ],
    },
    {
        "slug": "portfolio-site",
        "draft": False,
        "name": "Portfolio Site",
        "title": "Building a Fast, Accessible Portfolio Without a Framework | Kade Campbell",
        "description": "Case study: kadecampbelldev.com, a hand-built portfolio in plain HTML, CSS and JavaScript with a swipeable project stack, automatic dark mode, accessible forms and no framework.",
        "kicker": "Case study · Personal",
        "summary": "This site, hand-built in plain HTML, CSS and JavaScript with no templates and no framework, and written to load fast and work for everyone.",
        "hue": 230,
        "image": "portfolio",
        "alt": "Screenshot of this portfolio site's homepage",
        "facts": [("Type", "Personal project"), ("Role", "Design &amp; development"), ("Stack", "HTML · CSS · JavaScript")],
        "live": None,
        "github": "https://github.com/KCampbell22/portfolio-5",
        "tags": ["HTML", "CSS", "JavaScript", "Netlify Forms", "Schema.org"],
        "sections": [
            ("Goals", [
                "The site is aimed at agencies looking for an extra developer, so it has to show the same things I'd deliver for them: a design built faithfully, fast loading, a good experience on phones and accessibility throughout.",
            ]),
            ("Highlights", [
                ("ul", [
                    "<strong>Swipeable project stack on phones and tablets.</strong> The project cards follow your finger with a slight tilt and fly off when released, while the next card grows into place. Vertical swipes still scroll the page, and reduced-motion preferences are respected.",
                    "<strong>Automatic dark mode</strong> from 7pm to 7am on the visitor's clock, set before the first paint so the page never flashes, with a manual toggle.",
                    "<strong>A contact form that works anywhere.</strong> It's handled by Netlify Forms with a spam honeypot and accessible validation messages. On phones it opens as a bottom sheet you can minimize.",
                    "<strong>Third parties load only when needed.</strong> The Calendly booking widget is fetched only when someone clicks \"Book a call\".",
                    "<strong>Performance basics done properly:</strong> self-hosted fonts, responsive WebP images with explicit sizes, lazy-loaded media and no framework to download.",
                    "<strong>Built to be found:</strong> structured data, link previews, a sitemap, and service and case-study pages like this one.",
                ]),
            ]),
            ("Before the redesign", [
                "The previous version was a dark-only page with a grid of project cards, and it loaded the full Bootstrap stylesheet from a CDN. The redesign added a light theme with automatic dark mode, a sharper pitch aimed at agencies, the swipeable project stack and a contact form that works well on phones. It also dropped the framework CSS and switched to compressed self-hosted fonts and responsive WebP images.",
                '<a href="/archive/2026-11-13/">See the archived version of the old site</a>, kept exactly as it was apart from a banner and a disabled contact form.',
            ]),
            # TODO: add Lighthouse scores or Core Web Vitals once measured on the live site, ideally before vs after
        ],
    },
    {
        "slug": "scheduler-app",
        "draft": True,
        "name": "Scheduler App",
        "title": "Scheduler App: Task Delegation Web App (ASP.NET Core) | Kade Campbell",
        "description": "Scheduler App, a task delegation web app with a full back end built in C#, ASP.NET Core and Entity Framework Core, with a video walkthrough.",
        "kicker": "Project · Web app",
        "summary": "Task delegation web app with a full back end, built in C# with ASP.NET Core and Entity Framework Core.",
        "hue": 265,
        "video": "/Screen%20Recording%202022-12-09%20at%2011.08.12%20PM%20(1).mp4",
        "video_desc": "Silent 58-second walkthrough of the Scheduler App, a task delegation web app built with ASP.NET Core, starting from its welcome and sign-in screen.",
        "facts": [("Type", "Personal project"), ("Stack", "C# · ASP.NET Core · EF Core")],
        "live": None,
        "github": "https://github.com/KCampbell22/TaskDelegatingWebApp",
        "tags": ["C#", "ASP.NET Core", "Entity Framework Core"],
        "sections": [
            # TODO: what problem it solves, who assigns tasks to whom, main features, how the data is modeled
        ],
    },
    {
        "slug": "currency-exchange-app",
        "draft": True,
        "name": "Currency Exchange App",
        "title": "Currency Exchange App (React + Frankfurter API) | Kade Campbell",
        "description": "A React currency conversion app powered by the Frankfurter API, built by freelance web developer Kade Campbell.",
        "kicker": "Project · React app",
        "summary": 'Currency conversion app built in React and powered by the <a href="https://www.frankfurter.app/" target="_blank" rel="noopener">Frankfurter API<span class="visually-hidden"> (opens in new tab)</span></a>.',
        "hue": 190,
        "image": "currency-app",
        "alt": "Screenshot of the Currency Exchange App",
        "facts": [("Type", "Personal project"), ("Stack", "React")],
        "live": "https://kcampbell22.github.io/currency-converter/",
        "github": "https://github.com/KCampbell22/exhange-app-code",
        "tags": ["React", "Frankfurter API"],
        "sections": [
            # TODO: features (live rates? swap currencies? history chart?), how API calls are handled, what you learned
        ],
    },
    {
        "slug": "movie-finder-app",
        "draft": True,
        "name": "Movie Finder App",
        "title": "Movie Finder App (React + OMDb API) | Kade Campbell",
        "description": "A React movie search app powered by the OMDb API, built by freelance web developer Kade Campbell.",
        "kicker": "Project · React app",
        "summary": 'Movie search app built in React and powered by the <a href="https://www.omdbapi.com/" target="_blank" rel="noopener">OMDb API<span class="visually-hidden"> (opens in new tab)</span></a>.',
        "hue": 300,
        "image": "movie-finder",
        "alt": "Screenshot of the Movie Finder App",
        "facts": [("Type", "Personal project"), ("Stack", "React")],
        "live": "https://kcampbell22.github.io/final/",
        "github": "https://github.com/KCampbell22/movie-finder-react",
        "tags": ["React", "OMDb API"],
        "sections": [
            # TODO: features (search, details view, loading/empty states), how state and API calls are handled
        ],
    },
    {
        "slug": "abc-creations",
        "draft": True,
        "name": "ABC Creations",
        "title": "ABC Creations Business Website | Kade Campbell, Web Developer",
        "description": "ABC Creations, a business website hand-built with HTML, CSS and JavaScript by freelance web developer Kade Campbell.",
        "kicker": "Project · Website",
        "summary": "Business website hand-built with HTML, CSS and JavaScript.",
        "hue": 210,
        "image": "abc",
        "alt": "Screenshot of the ABC Creations site",
        "facts": [("Type", "Website"), ("Stack", "HTML · CSS · JavaScript")],
        "live": "https://abc-creations.netlify.app/",
        "github": "https://github.com/KCampbell22/ABC-Creations",
        "tags": ["HTML", "CSS", "JavaScript"],
        "sections": [
            # TODO: who ABC Creations is, what they needed, what the site includes, and any results
        ],
    },
    {
        "slug": "endurance-plus",
        "draft": True,
        "name": "Endurance+",
        "title": "Endurance+ Responsive Landing Page | Kade Campbell, Web Developer",
        "description": "Endurance+, a responsive marketing landing page built with HTML and CSS by freelance web developer Kade Campbell.",
        "kicker": "Project · Landing page",
        "summary": "Responsive marketing landing page built with HTML and CSS.",
        "hue": 170,
        "image": "endurance",
        "alt": "Screenshot of the Endurance+ landing page",
        "facts": [("Type", "Landing page"), ("Stack", "HTML · CSS")],
        "live": "https://e-plus.netlify.app/",
        "github": "https://github.com/KCampbell22/E-plus-landing",
        "tags": ["HTML", "CSS"],
        "sections": [
            # TODO: the brief, the page's sections and call to action, how it adapts from phone to desktop
        ],
    },
    {
        "slug": "airbnb-clone",
        "draft": True,
        "name": "Airbnb Clone",
        "title": "Airbnb Newsroom Layout Recreation (Bootstrap) | Kade Campbell",
        "description": "A practice layout recreation of the Airbnb Newsroom built with Bootstrap, HTML and CSS.",
        "kicker": "Project · Practice build",
        "summary": "Layout recreation of the Airbnb Newsroom, built with Bootstrap.",
        "hue": 330,
        "image": "airbnb",
        "alt": "Screenshot of the Airbnb Newsroom clone",
        "facts": [("Type", "Practice build"), ("Stack", "Bootstrap · HTML · CSS")],
        "live": "https://bnb-newsroom-clone-kade-campbell.netlify.app/",
        "github": "https://github.com/KCampbell22/aribnb_news_clone",
        "tags": ["Bootstrap", "HTML", "CSS"],
        "sections": [
            # TODO: what you practiced (grid, responsive navigation, Bootstrap components) and what was tricky
        ],
    },
    {
        "slug": "newsweekly-clone",
        "draft": True,
        "name": "Newsweekly Clone",
        "title": "Newsweekly Layout Recreation (Bootstrap) | Kade Campbell",
        "description": "A practice news layout recreation built with Bootstrap, HTML and CSS.",
        "kicker": "Project · Practice build",
        "summary": "News layout recreation built with Bootstrap.",
        "hue": 220,
        "image": "news-weekly",
        "alt": "Screenshot of the Newsweekly clone",
        "facts": [("Type", "Practice build"), ("Stack", "Bootstrap · HTML · CSS")],
        "live": "https://newsweekly-clone-kade-campbell.netlify.app/",
        "github": "https://github.com/KCampbell22/Newsweekly-Kade",
        "tags": ["Bootstrap", "HTML", "CSS"],
        "sections": [
            # TODO: what you practiced and what was tricky
        ],
    },
]


def block_html(b):
    if isinstance(b, tuple) and b[0] == "ul":
        items = "\n".join(f"            <li>{i}</li>" for i in b[1])
        return f'          <ul class="prose-list">\n{items}\n          </ul>'
    return f"          <p>{b}</p>"


def media_html(p):
    if p.get("video"):
        return f'''        <div class="browser">
          <div class="browser-bar" aria-hidden="true"><span></span><span></span><span></span><i></i></div>
          <video controls preload="metadata" playsinline aria-label="Screen recording demo of the {esc(p['name'])}" aria-describedby="video-desc">
            <source src="{p['video']}#t=0.1" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
        <p id="video-desc" class="visually-hidden">{esc(p['video_desc'])}</p>'''
    i = p["image"]
    return f'''        <div class="browser">
          <div class="browser-bar" aria-hidden="true"><span></span><span></span><span></span><i></i></div>
          <img src="/images/{i}-1080.webp" srcset="/images/{i}-640.webp 640w, /images/{i}-1080.webp 1080w" sizes="(max-width: 760px) calc(100vw - 80px), 760px" width="1080" height="720" fetchpriority="high" alt="{esc(p['alt'])}">
        </div>'''


def page_html(p, others):
    url = f"{SITE}/projects/{p['slug']}/"
    image = f"{SITE}/images/{p['image']}-1080.webp" if p.get("image") else f"{SITE}/images/share.jpg"
    ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CreativeWork",
                "name": p["name"],
                "headline": p["title"],
                "description": p["description"],
                "url": url,
                "image": image,
                "keywords": ", ".join(p["tags"]),
                "author": {"@id": f"{SITE}/#kade"},
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
                    {"@type": "ListItem", "position": 2, "name": "Work", "item": f"{SITE}/#projects"},
                    {"@type": "ListItem", "position": 3, "name": p["name"], "item": url},
                ],
            },
        ],
    }
    ld_text = json.dumps(ld, indent=2, ensure_ascii=False).replace("\n", "\n  ")
    robots = '\n  <meta name="robots" content="noindex">' if p["draft"] else ""

    buttons = []
    if p.get("live"):
        buttons.append(f'''        <a href="{p['live']}" class="btn btn-ink btn-lg" target="_blank" rel="noopener">Visit live site<span class="visually-hidden"> (opens in new tab)</span>
          {ARROW_OUT}
        </a>''')
    if p.get("github"):
        cls = "btn-outline" if buttons else "btn-ink"
        buttons.append(f'        <a href="{p["github"]}" class="btn {cls} btn-lg" target="_blank" rel="noopener">GitHub repo<span class="visually-hidden"> (opens in new tab)</span></a>')
    buttons = "\n".join(buttons)

    facts = "\n".join(f"        <div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in p["facts"])
    note = f'\n      <p class="slide-note">{esc(p["note"])}</p>' if p.get("note") else ""
    tags = "".join(f"<li>{esc(t)}</li>" for t in p["tags"])

    sections = "\n".join(
        f'''        <section aria-labelledby="s{n}">
          <h2 id="s{n}">{esc(h)}</h2>
{chr(10).join(block_html(b) for b in blocks)}
        </section>'''
        for n, (h, blocks) in enumerate(p["sections"], 1)
    )
    if not sections:
        sections = "        <!-- Draft: write-up coming. See the TODO for this project in scripts/build_projects.py -->"

    more = "\n".join(
        f'        <a href="/projects/{o["slug"]}/" class="btn btn-outline">{esc(o["name"])}</a>' for o in others
    )

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{esc(p['description'])}">{robots}
  <meta name="theme-color" content="#F7F8FC" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0F1120" media="(prefers-color-scheme: dark)">
  <title>{esc(p['title'])}</title>

  <link rel="canonical" href="{url}">

  <!-- Link previews (LinkedIn, Slack, iMessage, etc.) -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{SITE}/images/share.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Kade Campbell, freelance web developer">
  <meta name="twitter:card" content="summary_large_image">
  <meta property="og:title" content="{esc(p['name'])} | Kade Campbell">
  <meta property="og:description" content="{esc(p['description'])}">

  <script type="application/ld+json">
  {ld_text}
  </script>

{theme_script}  <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">
  <link rel="icon" type="image/x-icon" href="/images/favIcon.ico">

  <link rel="stylesheet" href="/style.css">
  <script src="/index.js" defer></script>
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>

{header}  <main id="main" tabindex="-1">
    <article style="--hue: {p['hue']}">
    <header class="container page-hero" aria-labelledby="page-title">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          <li><a href="/#projects">Work</a></li>
          <li aria-current="page">{esc(p['name'])}</li>
        </ol>
      </nav>
      <h1 id="page-title" class="hero-title"><span class="hero-kicker">{esc(p['kicker'])}</span> {esc(p['name'])}</h1>
      <p class="hero-text">{p['summary']}</p>{note}
      <div class="btn-row">
{buttons}
      </div>
      <dl class="hero-facts">
{facts}
      </dl>
    </header>

    <div class="container section">
      <div class="project-shot">
{media_html(p)}
      </div>
    </div>

    <div class="container section">
      <div class="prose">
{sections}
        <section aria-labelledby="built-with">
          <h2 id="built-with">Built with</h2>
          <ul class="tags">{tags}</ul>
        </section>
      </div>
    </div>
    </article>

    <section class="container section" aria-labelledby="more-title">
      <h2 id="more-title" class="section-title">More work</h2>
      <div class="related-list">
{more}
        <a href="/#projects" class="btn btn-outline">All projects</a>
      </div>
    </section>

    <section class="container section contact-section" aria-labelledby="cta-title">
      <div class="contact-band">
        <div class="contact-dots" aria-hidden="true"></div>
        <div class="contact-head">
          <div class="contact-copy">
            <p class="eyebrow eyebrow-on-dark">contact</p>
            <h2 id="cta-title">Need something like this built? Let's talk.</h2>
            <p>Tell me about the project, or grab a free 30-minute intro call. I'll get back to you as soon as possible.</p>
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
    published = [p for p in PROJECTS if not p["draft"]]
    for p in PROJECTS:
        others = [o for o in published if o is not p][:3]
        out_dir = os.path.join(ROOT, "projects", p["slug"])
        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8", newline="\n") as f:
            f.write(page_html(p, others))
        print("wrote", out_dir, "(draft, noindex)" if p["draft"] else "")
