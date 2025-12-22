import { disconnectRedis } from 'app/shared/cache/redis.server.ts';
import { disconnectDB } from 'tests/db-helpers.ts';
import { eventProposalTagFactory } from 'tests/factories/proposal-tags.ts';
import { eventCategoryFactory } from '../tests/factories/categories.ts';
import { commentFactory } from '../tests/factories/comments.ts';
import { eventFactory } from '../tests/factories/events.ts';
import { eventFormatFactory } from '../tests/factories/formats.ts';
import { organizerKeyFactory } from '../tests/factories/organizer-key.ts';
import { proposalFactory } from '../tests/factories/proposals.ts';
import { reviewFactory } from '../tests/factories/reviews.ts';
import { talkFactory } from '../tests/factories/talks.ts';
import { teamFactory } from '../tests/factories/team.ts';
import { userFactory } from '../tests/factories/users.ts';

async function seed() {
  const user = await userFactory({
    traits: ['clark-kent', 'admin'],
    attributes: {
      bio: '## 🦸‍♂️ The Dev Who Can Fly (Through Code)\n\n**Mild-mannered developer by day, conference superhero by night!** 🌟\n\nWhen I\'m not saving Metropolis from bad code, I\'m building **React apps** faster than a speeding bullet and organizing conferences that are more powerful than a locomotive.\n\n### ⚡ Superpowers\n- **Frontend wizardry** with React & TypeScript\n- **Backend sorcery** with Node.js\n- **Conference organizing** without breaking a sweat\n- Can debug in **multiple timezones** simultaneously\n\n### 🎯 Secret Identity\n- Tech Lead at Daily Planet Media (shh! 🤫)\n- Maintainer of [metropolis-ui](https://github.com/clark/metropolis-ui) - 2K+ stars\n- **50+ conferences** and counting\n\n> *"With great code comes great responsibility!"* 💪\n\n📍 **Metropolis** (but I travel at light speed) ✈️',
      company: 'Daily Planet Media',
      location: 'Metropolis, USA',
      references:
        'Available upon request - can provide references from previous speaking engagements and open source work.',
    },
  });
  const user2 = await userFactory({
    traits: ['bruce-wayne'],
    attributes: {
      bio: "## 🦇 The Dark Knight of Clean Code\n\n**By day: billionaire playboy philanthropist. By night: debugging Gotham's messiest codebases.** 🌃\n\nI fight crime AND technical debt with equal passion! Currently funding Wayne Enterprises' quest to make **enterprise software** less scary than actual villains.\n\n### 🛡️ Vigilante Skills\n- **Security expert** - I see vulnerabilities in my sleep\n- **Microservices architect** - because monoliths are for museums\n- **Angel investor** - funding the good guys (15+ startups)\n- **Penetration testing** - legally breaking things since 2010\n\n### 🏢 Day Job\n- CTO at Wayne Enterprises (the fun division)\n- **Kubernetes whisperer** and cloud native evangelist\n- Gotham's most eligible **backend developer** 😉\n\n> *\"I'm not the hero Gotham deserves, but I'm the one who writes the cleanest code.\"* 🦇\n\n📍 **Gotham City** (mostly working nights) 🌙",
      company: 'Wayne Enterprises',
      location: 'Gotham City, USA',
      references:
        'Portfolio available at wayne.tech - References from portfolio companies and enterprise clients available.',
    },
  });
  const user3 = await userFactory({
    traits: ['peter-parker'],
    attributes: {
      bio: "## 🕷️ Your Friendly Neighborhood Flutter Dev\n\n**With great power comes great app performance!** ⚡\n\nWhen I'm not swinging between buildings, I'm **optimizing Flutter apps** and making mobile experiences so smooth they'd make a web slinger jealous.\n\n### 🕸️ Web-Slinging Skills\n- **Flutter ninja** - can animate anything that moves\n- **Performance guru** - apps load faster than my reflexes\n- **Cross-platform hero** - iOS, Android, and everything in between\n- **Memory leak detector** - my spider-sense tingles for inefficient code\n\n### 📱 Day Job Adventures\n- Mobile Team Lead at Daily Bugle Digital\n- **50M+ downloads** across my apps (no joke!)\n- **Google Developer Expert** for Flutter\n- **App Store featured** 3 times (and counting)\n\n### 🎯 Fun Facts\n- Organizes Flutter NYC meetups between superhero duties\n- Can debug with **web-shooters tied behind back**\n- Writes **100K+ readers** worth of technical blogs\n\n> *\"Whatever a spider can, whatever a developer can - I've got radioactive code!\"* 🕷️\n\n📍 **NYC** (rooftops preferred, but remote works too) 🏙️",
      company: 'Daily Bugle Digital',
      location: 'New York City, USA',
      references:
        'Portfolio: parker.dev | Apps available on App Store and Google Play | LinkedIn recommendations available.',
    },
  });

  const team = await teamFactory({
    owners: [user],
    members: [user2],
    attributes: { name: 'GDG Nantes', slug: 'gdg-nantes' },
  });

  const event = await eventFactory({
    traits: ['conference', 'conference-cfp-open', 'withSurveyConfig'],
    team,
    attributes: {
      name: 'Devfest Nantes',
      slug: 'devfest-nantes',
      description:
        "# DevFest Nantes 2024 🎉\n\n**The largest developers conference in western France!**\n\nJoin **1000+ developers** for inspiring talks, workshops, and networking.\n\n## 🎯 What's On\n- **Web Development** - React, Vue, Angular\n- **Mobile** - Android, iOS, Flutter, React Native\n- **Cloud & AI** - Google Cloud, Firebase, ML\n- **DevOps** - Kubernetes, CI/CD\n\n## 🎁 Perks\n- **Free lunch** and swag bag\n- **After-party** with local tech community\n- Access to **exclusive workshops**\n\n> 💡 Follow [@GDGNantes](https://twitter.com/gdgnantes) for live updates!\n\n**Don't miss Nantes' premier tech event!** 🚀",
      location: 'Cité des Congrès de Nantes, 5 Rue de Valmy, 44000 Nantes, France',
      websiteUrl: 'https://devfest.gdgnantes.com',
      contactEmail: 'contact@gdgnantes.com',
      maxProposals: 3,
      migrationId: '123',
    },
  });

  const format1 = await eventFormatFactory({
    event,
    attributes: {
      name: 'Conference Talk',
      description: 'Standard conference presentation format (45 minutes including Q&A)',
    },
  });
  const format2 = await eventFormatFactory({
    event,
    attributes: {
      name: 'Lightning Talk',
      description: 'Short and impactful presentation (5-10 minutes)',
    },
  });
  await eventFormatFactory({
    event,
    attributes: {
      name: 'Workshop',
      description: 'Hands-on interactive session (2-3 hours)',
    },
  });

  const cat1 = await eventCategoryFactory({
    event,
    attributes: {
      name: 'Frontend & Web',
      description: 'JavaScript, TypeScript, React, Vue, Angular, CSS, and modern web technologies',
    },
  });
  const cat2 = await eventCategoryFactory({
    event,
    attributes: {
      name: 'Backend & Infrastructure',
      description: 'Server-side development, APIs, databases, DevOps, and cloud technologies',
    },
  });
  await eventCategoryFactory({
    event,
    attributes: {
      name: 'Mobile Development',
      description: 'iOS, Android, React Native, Flutter, and cross-platform mobile development',
    },
  });

  const tag1 = await eventProposalTagFactory({
    event,
    attributes: {
      name: 'Beginner Friendly',
      color: '#10B981',
    },
  });
  const tag2 = await eventProposalTagFactory({
    event,
    attributes: {
      name: 'Live Coding',
      color: '#3B82F6',
    },
  });

  const meetup = await eventFactory({
    traits: ['meetup-cfp-open'],
    team,
    attributes: {
      name: 'GDG Nantes Monthly Meetup',
      slug: 'gdg-nantes-meetup',
      description:
        '# GDG Nantes Monthly Meetup 📱\n\n**Monthly meetup for Google tech enthusiasts** - Join us for talks, networking, and **pizza**! 🍕\n\n## This Month\n- 🤖 **Android** - Jetpack Compose & Kotlin Multiplatform\n- 🔥 **Firebase** - Firestore querying & Cloud Functions\n\n## Schedule\n| Time | Activity |\n|------|----------|\n| 18:30 | 🍕 Pizza & Networking |\n| 19:00 | 📱 Android Talk (30min) |\n| 19:45 | 🔥 Firebase Talk (30min) |\n| 20:15 | 🍻 Drinks & Discussion |\n\n**RSVP required** - Limited to 50 attendees 👥',
      location: 'Campus Epitech Nantes, 18 Rue Pasteur, 44100 Nantes, France',
    },
  });

  await eventFactory({
    traits: ['conference', 'private'],
    team,
    attributes: {
      name: 'GDG Nantes VIP Tech Summit',
      slug: 'vip-tech-summit',
      description:
        '# 🏆 VIP Tech Summit - Exclusive Event\n\n**Invite-only summit** for senior developers and tech leaders\n\n## 🎯 For You If\n- **Senior Engineer** (5+ years) or **Tech Lead**\n- **Engineering Manager** or **CTO**\n\n## 📚 Sessions\n- 🏗️ **Architecture** - DDD, event-driven, microservices vs monoliths\n- 🔮 **Emerging Tech** - WebAssembly, edge computing, quantum\n- 💼 **Leadership** - Scaling teams, technical debt management\n\n## 🤝 Exclusive Perks\n- **Private dinner** with industry leaders\n- **Executive roundtables** and mentoring\n\n> ⚠️ **Invitation Required** - Contact organizers\n\n**Limited to 30 attendees** 👥',
      location: 'Private venue, Nantes, France',
    },
  });

  const team2 = await teamFactory({
    owners: [user2],
    members: [user],
    attributes: { name: 'Devoxx', slug: 'devoxx' },
  });

  await eventFactory({
    traits: ['conference-cfp-past'],
    attributes: {
      name: 'Devoxx France',
      slug: 'devoxx-france',
      description:
        '# ☕ Devoxx France - The Ultimate Java Conference\n\n**The biggest Java conference in France!** 🇫🇷\n\n**3 days** with the **best speakers** and **innovative companies**.\n\n## 📅 Format\n- **Day 1** - Deep-dive workshops & hands-on labs\n- **Day 2-3** - Keynotes, talks, and BOFs\n\n## 🎯 Tracks\n- ☕ **Core Java** - JVM, Spring, Reactive programming\n- 🚀 **Modern Dev** - Microservices, Cloud-native, GraalVM\n- 🔧 **Tools & Practices** - DevOps, Testing, Performance\n\n## 🌟 Special Features\n- **Expo hall** with 50+ vendors\n- **Networking cocktails** each evening\n- **Live coding** sessions\n\n**Join 3000+ Java enthusiasts!** ☕',
      location: 'Palais des Congrès de Paris, 2 Place de la Porte Maillot, 75017 Paris, France',
      websiteUrl: 'https://www.devoxx.fr',
      contactEmail: 'team@devoxx.fr',
    },
    team: team2,
  });

  const bdx_io_team = await teamFactory({
    owners: [user],
    members: [user2],
    attributes: { name: 'BDX I/O', slug: 'bdx-io' },
  });

  await eventFactory({
    traits: ['conference-cfp-future'],
    attributes: {
      name: 'BDX I/O',
      slug: 'bdx-io',
      description:
        '# 🍷 BDX I/O - Bordeaux Developer Conference\n\n**Where tech meets wine country!** 🇫🇷\n\nA full day with **exceptional speakers** and the latest development technologies.\n\n## 🎯 Tracks\n- 🌐 **Web** - JavaScript, CSS, PWAs, JAMstack\n- 📱 **Mobile** - Native, cross-platform, UI/UX\n- ⚙️ **DevOps** - Docker, Kubernetes, CI/CD\n- 📊 **Data & AI** - ML in production, analytics\n\n## 🍷 Bordeaux Experience\n- **Regional specialties** lunch\n- **Wine tasting** networking\n- **Bordeaux wine** welcome gift\n\n> 🌟 **Special**: Evening reception at a local **château**!\n\n**Join Southwest France tech community!** 🚀',
      location: 'Palais des Congrès de Bordeaux, France',
      websiteUrl: 'https://www.bdx.io',
      contactEmail: 'contact@bdx.io',
    },
    team: bdx_io_team,
  });

  await eventFactory({
    traits: ['conference-cfp-open'],
    attributes: {
      name: 'Sunny Tech',
      slug: 'sunny-tech',
      description:
        '# ☀️ Sunny Tech - The Brightest Tech Conference\n\n**The sunniest tech conference in the south of France!** 🌅\n\n**Two days** in beautiful **Montpellier** focused on innovation and sustainability.\n\n## 🎯 Themes\n- 🚀 **Innovation** - Cutting-edge tech, startup pitches, demos\n- 🌱 **Sustainability** - Green software, carbon-aware programming\n- 🔬 **Emerging Tech** - AI, blockchain, IoT, quantum computing\n\n## 📅 Format\n- **Day 1** - Keynotes, innovation showcase, startup competition\n- **Day 2** - Technical workshops, architecture sessions\n\n## 🌞 Mediterranean Experience\n- **Outdoor networking** sessions\n- **Mediterranean cuisine** catering\n- **Solar-powered** charging stations\n\n> 🌱 **Climate Positive** - We offset 200% of our carbon footprint!\n\n**Combine learning with sunshine!** ☀️🚀',
      location: 'Montpellier, France',
      websiteUrl: 'https://sunny-tech.io',
      contactEmail: 'contact@sunny-tech.io',
    },
  });

  const talk1 = await talkFactory({
    attributes: {
      title: 'Introduction to React Server Components',
      abstract:
        "**React Server Components** represent a paradigm shift in how we build React applications. This talk will introduce you to the fundamentals of RSCs, explaining how they enable us to:\n\n- Run React components on the **server**\n- Reduce bundle sizes significantly\n- Improve performance and user experience\n\nWe'll explore practical examples, discuss the benefits and trade-offs, and see how they integrate with modern React frameworks like **Next.js**.\n\n### What you'll learn:\n\n1. Core concepts of Server Components\n2. Performance implications and measurements\n3. Real-world implementation patterns\n4. Integration with existing React applications",
      references:
        '## Speaker Experience\n\n- **5+ years** of React development experience\n- Active contributor to several **open-source React libraries**:\n  - [react-server-toolkit](https://github.com/example/react-server-toolkit)\n  - [rsc-utils](https://github.com/example/rsc-utils)\n\n## Previous Speaking Experience\n\n- **React Paris 2023** - "Building for the Future with React"\n- **JSConf EU 2022** - "Component Architecture Patterns"\n- **Frontend Focus Podcast** - Episode #127 guest\n\n> *"One of the most knowledgeable React speakers I\'ve seen"* - React Paris organizers',
      level: 'BEGINNER',
      languages: ['fr'],
    },
    speakers: [user3],
  });

  const proposal1 = await proposalFactory({
    talk: talk1,
    event,
    categories: [cat1],
    formats: [format1],
    tags: [tag1],
  });
  await reviewFactory({
    proposal: proposal1,
    user: user,
    attributes: {
      feeling: 'POSITIVE',
      note: 5,
    },
  });
  await commentFactory({
    user: user,
    proposal: proposal1,
    attributes: {
      comment:
        'Excellent proposal! React Server Components is a hot topic and the speaker demonstrates solid expertise. The abstract is clear and the talk would be perfect for developers looking to understand this new paradigm. Great for our frontend track.',
    },
  });
  await reviewFactory({
    proposal: proposal1,
    user: user2,
    attributes: {
      feeling: 'NEGATIVE',
      note: 0,
    },
  });
  await commentFactory({
    user: user2,
    proposal: proposal1,
    attributes: {
      comment:
        "While the topic is relevant, I feel this content might be too basic for our audience. The abstract lacks depth and doesn't show how this differs from existing SSR solutions. Would prefer a more advanced take on the subject.",
    },
  });

  const talk2 = await talkFactory({
    attributes: {
      title: 'Building Resilient Microservices with Node.js and Kubernetes',
      abstract:
        "In this **hands-on session**, we'll explore how to build and deploy resilient microservices using **Node.js** and **Kubernetes**.\n\n## What we'll cover:\n\n### 🔧 Architecture Patterns\n- Service mesh implementation with **Istio**\n- Health checks and readiness probes\n- Circuit breakers with **Hystrix**\n\n### 📊 Observability\n- Distributed tracing with **Jaeger**\n- Metrics collection using **Prometheus**\n- Centralized logging strategies\n\n### 🛡️ Resilience Strategies\n- Graceful degradation patterns\n- Retry mechanisms and backoff strategies\n- Bulkhead isolation techniques\n\n> You'll learn practical strategies for handling failures gracefully and maintaining system reliability at scale.\n\n**Bonus**: We'll demonstrate real-world examples and provide code samples you can use in your own projects!",
      references:
        '## Speaker Backgrounds\n\n### 👨‍💻 Speaker 1: Peter Parker\n- **Senior Infrastructure Engineer** at TechCorp\n- **8+ years** in distributed systems architecture\n- Architect of microservices platform serving **10M+ users daily**\n- **Kubernetes Certified Expert** (CKE)\n\n### 👨‍💻 Speaker 2: Bruce Wayne\n- **Principal DevOps Engineer** at TechCorp\n- **6+ years** in cloud-native technologies\n- Led migration of **200+ services** to Kubernetes\n- **AWS Solutions Architect Professional**\n\n## Combined Experience\n\n- Built and maintained systems handling **1B+ requests/day**\n- Reduced infrastructure costs by **40%** through optimization\n- Authored **3 technical whitepapers** on microservices patterns\n\n### Recent Publications\n- ["Microservices at Scale"](https://techcorp.blog/microservices-scale) - 50K+ views\n- ["Kubernetes Production Patterns"](https://medium.com/@techcorp/k8s-patterns) - Featured in CNCF newsletter',
      level: 'INTERMEDIATE',
      languages: ['en'],
    },
    speakers: [user3, user2],
  });

  const proposal2 = await proposalFactory({
    talk: talk2,
    event,
    categories: [cat2],
    formats: [format1, format2],
    traits: ['accepted'],
    tags: [tag2],
  });
  await reviewFactory({
    proposal: proposal2,
    user: user,
    attributes: {
      feeling: 'NO_OPINION',
      note: null,
    },
  });
  await commentFactory({
    user: user,
    proposal: proposal2,
    attributes: {
      comment:
        'Not my area of expertise, but the proposal seems well-structured. The speakers appear qualified and the topic is relevant for backend developers. Would defer to infrastructure track reviewers for final assessment.',
    },
  });
  await reviewFactory({
    proposal: proposal2,
    user: user2,
    attributes: {
      feeling: 'NEUTRAL',
      note: 3,
    },
  });
  await commentFactory({
    user: user2,
    proposal: proposal2,
    attributes: {
      comment:
        'Solid technical content and experienced speakers. However, microservices and Kubernetes topics are quite common at conferences these days. The proposal would benefit from highlighting unique insights or novel approaches to stand out from similar talks.',
    },
  });

  const talk3 = await talkFactory({
    attributes: {
      title: 'Advanced Performance Optimization in Flutter: Memory Management and GPU Rendering',
      abstract:
        '## 🚀 Deep Dive into Flutter Performance\n\nThis **advanced-level** talk focuses on cutting-edge performance optimization techniques for Flutter applications.\n\n### 🧠 Memory Management Mastery\n- **Efficient widget lifecycle** management\n- Custom **memory pools** for high-frequency objects\n- **Garbage collection** optimization strategies\n- Memory leak detection and prevention\n\n### 🎨 GPU Rendering Optimization\n- Understanding the **Flutter rendering pipeline**\n- Custom **RenderObject** implementations\n- **Impeller engine** optimization techniques\n- **Shader compilation** best practices\n\n### 📊 Profiling & Measurement\n- **Live profiling sessions** with real applications\n- Performance measurement frameworks\n- **Flame graphs** interpretation\n- Automated performance regression testing\n\n### 🛠️ Widget Tree Optimization\n- **const constructors** and widget reuse\n- **RepaintBoundary** strategic placement\n- Custom **paint methods** for complex graphics\n\n> ⚡ **Warning**: This talk contains live coding and real-time performance analysis!\n\n**Takeaways**: Production-ready optimization patterns you can implement immediately.',
      references:
        '## 🏆 Speaker Credentials\n\n### Professional Background\n- **Flutter Team Contributor** at Google\n- **3+ years** optimizing high-performance mobile applications\n- Performance consultant for **Fortune 500 companies**\n- **50M+ app downloads** across optimized applications\n\n### Open Source Contributions\n- [**flutter-performance-tools**](https://github.com/flutter/performance-tools) - Core maintainer\n- [**memory-profiler-flutter**](https://pub.dev/packages/memory_profiler) - 10K+ weekly downloads\n- [**render-optimizer**](https://github.com/example/render-optimizer) - Featured in Flutter Weekly\n\n### Publications & Recognition\n- **"Flutter Performance at Scale"** - Flutter Forward 2023 keynote\n- [**Medium articles series**](https://medium.com/@flutterperf) - 100K+ total views\n- **Google Developer Expert** for Flutter\n- **Speaker at Flutter Interact 2022**\n\n### Recent Achievements\n- Improved **Instagram app performance** by 40%\n- Created **performance regression testing** framework adopted by Flutter team\n- **#1 rated speaker** at FlutterConf Europe 2023\n\n> *"The most knowledgeable Flutter performance expert I know"* - Flutter team lead',
      level: 'ADVANCED',
      languages: ['fr'],
    },
    speakers: [user3],
  });

  await proposalFactory({ talk: talk3, event, categories: [], formats: [], traits: ['rejected'] });

  for (const _value of Array.from({ length: 26 })) {
    const talk = await talkFactory({ speakers: [user3] });
    await proposalFactory({ event: meetup, talk });
  }

  for (const _value of Array.from({ length: 26 })) {
    await eventFactory({ traits: ['meetup-cfp-open'] });
  }

  await organizerKeyFactory({ attributes: { id: '123456' } });
}

try {
  await seed();
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
  await disconnectDB();
  await disconnectRedis();
}
