import type { Project } from './types'
import { projectImages } from './images.generated'

const img = (slug: string) => projectImages[slug] ?? []

export const projects: Project[] = [
  {
    slug: 'google-ads-dashboard',
    title: 'Google Ads Campaign Performance Dashboard',
    category: 'data-bi',
    featured: true,
    course: 'Data Visualization',
    team: 'Individual',
    tools: ['Tableau', 'Excel'],
    summary:
      'Cleaned a messy 2,600-row ads dataset and built an interactive Tableau dashboard on cost, conversions, and revenue.',
    overview:
      'A public Google Ads dataset had typos, mixed date formats, currency symbols, and hundreds of missing values. I cleaned it in Excel, explored it, and published an interactive Tableau dashboard for marketing managers who need to see which devices and keywords actually turn ad spend into revenue.',
    contributions: [
      'Cleaned a raw 2,600-row Google Ads dataset: standardized inconsistent campaign, location, device, and keyword values, unified 3 date formats, and recalculated 626 missing conversion rates, leaving 2,125 analysis-ready rows.',
      'Built and published an interactive Tableau dashboard (heatmap, scatter plot, dual-axis trend, bar chart) with filters, tooltips, and drill-down from device to keyword level.',
      'Found only a weak relationship between ad cost and sales revenue, and recommended optimizing device and keyword combinations instead of raising budget; documented data limitations and potential bias.',
    ],
    stats: [
      { value: 2600, label: 'raw rows' },
      { value: 626, label: 'conversion rates recalculated' },
      { value: 2125, label: 'analysis-ready rows' },
    ],
    links: [
      {
        label: 'View dashboard',
        href: 'https://public.tableau.com/app/profile/meini.rusiadi/viz/FinalProjectTableau_17803906517840/Dashboard1',
      },
      { label: 'Video walkthrough', href: 'https://www.youtube.com/watch?v=7pYhSJ-0Jeg' },
    ],
    images: img('google-ads-dashboard'),
  },
  {
    slug: 'ai-acceptance-research',
    title: 'Student Resistance and Acceptance of AI-Based Systems',
    category: 'data-bi',
    featured: true,
    course: 'Research Methods',
    team: 'Co-author · 3 authors',
    role: 'Co-author',
    tools: ['SmartPLS 4', 'PLS-SEM', 'Technology Acceptance Model'],
    summary:
      'Quantitative study of what drives university students to accept or resist AI tools, analysed with PLS-SEM.',
    overview:
      'An unpublished research paper in IEEE format. It extends the Technology Acceptance Model to explain how trust, task characteristics, and technology characteristics shape how students feel about AI tools such as ChatGPT. The data came from a survey of university students who already use generative AI.',
    contributions: [
      'Processed questionnaire data (290 responses screened to 281 valid) and co-ran the PLS-SEM analysis in SmartPLS 4.',
      'Wrote the Methodology section and prepared the results tables. All 5 hypotheses were supported.',
      'Searched for relevant journals and contributed to the Conclusion.',
    ],
    stats: [
      { value: 290, label: 'survey responses' },
      { value: 281, label: 'valid after screening' },
      { value: 5, label: 'hypotheses supported' },
    ],
    links: [{ label: 'Research data (Zenodo)', href: 'https://zenodo.org/records/20282568' }],
    images: img('ai-acceptance-research'),
  },
  {
    slug: 'budgetwise-finance-dashboard',
    title: 'Personal Finance Dashboard (BudgetWise)',
    category: 'data-bi',
    course: 'Data Modelling',
    term: 'Even 2025/2026',
    team: 'Group of 6',
    tools: ['Excel', 'PivotTable', 'Data Validation'],
    summary:
      'Cleaned a synthetic personal-finance dataset and built an interactive Excel dashboard with 7 KPIs.',
    overview:
      'The BudgetWise dataset mixes income and expense transactions from 10 Indian cities. It has missing values, duplicates, mixed date formats, and many spellings of the same category. The team built an Excel dashboard to show where money goes, which payment methods people use, and whether income covers expenses.',
    contributions: [
      'Cleaned 5,596 transactions down to 5,281 valid rows: removed 315 invalid or extreme amounts, flagged duplicates, unified 3 date formats, stripped currency symbols (Rs., ₹, $, INR), and mapped 27+ category spellings to 9 and 20+ city variants to 10 with lookup tables.',
      'Built an interactive Excel dashboard with 7 KPIs (income, expense, net balance, expense ratio, and more), slicers for year, category, payment mode, and location, and an INDEX/MATCH KPI selector.',
    ],
    stats: [
      { value: 5596, label: 'raw rows' },
      { value: 5281, label: 'clean rows' },
      { value: 7, label: 'KPIs' },
    ],
    images: img('budgetwise-finance-dashboard'),
  },
  {
    slug: 'ecommerce-order-analysis',
    title: 'E-commerce Order Analysis',
    category: 'data-bi',
    course: 'Data Modelling (Lab)',
    term: 'Even 2025/2026',
    team: 'Group of 3',
    tools: ['Excel', 'Named ranges', 'Data Validation'],
    summary:
      'Prepared a multi-table e-commerce dataset in Excel and built reusable named ranges for the dashboard.',
    overview:
      'A lab project on a public e-commerce order dataset with separate tables for customers, orders, order items, products, and payments. The team cleaned the data, modelled it, and built an interactive Excel dashboard.',
    contributions: [
      'Cleaned a multi-table e-commerce dataset: standardized city, state, and product category text, and added derived columns for item total with shipping, product volume, delivery days, and approval time in hours.',
      'Split order timestamps into year, month, and day of week for trend analysis.',
      'Built named ranges for category, payment type, and order status lists that drive dropdown validation and COUNTIF/INDEX summary tables, so a new category updates the summaries without editing any formula.',
    ],
    images: img('ecommerce-order-analysis'),
  },
  {
    slug: 'shoe-factory-database',
    title: 'Shoe Factory Database',
    category: 'database',
    course: 'Database Fundamentals',
    team: 'Group of 5',
    tools: ['Oracle SQL', 'MongoDB', 'Python (PyMongo)'],
    summary:
      'Designed the data model for a shoe factory and wrote Oracle SQL queries with MongoDB equivalents.',
    overview:
      'A case study of a shoe manufacturer that needs to track production, orders, purchasing, payments, and goods receipt. The project covers the database design and a set of Oracle SQL queries, each paired with a MongoDB version in Python.',
    contributions: [
      'Designed the ERD and data dictionary for 6 tables covering production, orders, purchasing, payment, and goods receipt.',
      'Wrote the DDL and Oracle SQL examples for single-row functions, cross and natural joins, and aggregate queries (COUNT, SUM, AVG, GROUP BY, HAVING, and more), each with a MongoDB aggregation pipeline equivalent in Python.',
    ],
    images: img('shoe-factory-database'),
  },
  {
    slug: 'soundease-database',
    title: 'SoundEase Audio Store Database',
    category: 'database',
    course: 'Database (Lab)',
    term: 'Even 2024/2025',
    team: 'Group of 4',
    tools: ['Oracle SQL'],
    summary: 'Wrote reporting queries for an audio equipment store database in Oracle SQL.',
    overview:
      'A lab project for an audio equipment store with staff, vendors, customers, equipment, and purchase and sales transactions. The team designed 9 tables with CHECK constraints and wrote 10 reporting queries.',
    contributions: [
      'Wrote 3 reporting queries that join 4 tables and filter against dataset-wide values with subqueries (MIN, AVG), with output formatted by TO_CHAR.',
    ],
    images: img('soundease-database'),
  },
  {
    slug: 'livetix-testing',
    title: 'LiveTix Concert Ticketing — Test Design',
    category: 'qa',
    course: 'Testing & Systems Implementation',
    term: 'Odd 2025/2026',
    team: 'Group of 4',
    role: 'QA Engineer',
    tools: ['Black-box testing', 'Functional testing', 'Figma'],
    summary: 'Designed 17 black-box functional test cases for a concert ticketing app.',
    overview:
      'LiveTix is a mobile app concept for buying concert tickets without crashes, unclear prices, or fake tickets. I took the QA role: deciding what to test and writing the test cases for the full purchase flow.',
    contributions: [
      'Wrote the business process for a concert ticketing app: event discovery, seat selection, checkout, QR tickets, and wishlist.',
      'Designed 17 black-box functional test cases covering onboarding, sign-up and login (including invalid credentials), search, seat selection, payment, QR ticket display, wishlist, and profile edit.',
      'Built the Figma prototype.',
    ],
    stats: [{ value: 17, label: 'test cases designed' }],
    images: img('livetix-testing'),
  },
  {
    slug: 'snapcash-pos',
    title: 'SnapCash POS — Project Plan',
    category: 'systems-pm',
    featured: true,
    course: 'IS Project Management',
    term: 'Even 2025/2026',
    team: 'Group of 5',
    tools: ['Scrum', 'Critical Path Method', 'Business case'],
    summary:
      'Planned a SaaS point-of-sale product for Indonesian F&B small businesses: business case, Scrum charter, and critical path.',
    overview:
      'SnapCash is a point-of-sale and business management app for small food and beverage businesses that still record sales by hand. The project plans its delivery with Scrum across 6 sprints, with a budget, a risk register, and a 5-year financial projection.',
    contributions: [
      'Wrote the business case for a SaaS POS for Indonesian F&B MSMEs: 3 subscription tiers (Rp100k to Rp1.5M per month) and a 5-year projection from a Rp90M first-year loss to break-even in year 2.',
      'Wrote the project charter: an 18-item product backlog, 6 two-week sprints with story points, team roles, and a Definition of Done.',
      'Built the Critical Path Method schedule.',
    ],
    stats: [
      { value: 18, label: 'backlog items' },
      { value: 6, label: 'sprints' },
      { value: 3, label: 'pricing tiers' },
    ],
    images: img('snapcash-pos'),
  },
  {
    slug: 'stsport-booking-system',
    title: 'StSport Booking System',
    category: 'systems-pm',
    course: 'Systems Analysis & Design',
    term: 'Odd 2025/2026',
    team: 'Group of 4',
    tools: ['UML', 'Fishbone diagram', 'Context diagram'],
    summary: 'Analysed and modeled a sports-court booking and equipment store system.',
    overview:
      'StSport lets customers book sports courts and buy sports equipment, while partner staff confirm bookings and admins create reports. The project analyses the problem and models the system before any code is written.',
    contributions: [
      'Analysed the problem with a fishbone diagram, and scoped the system with a context diagram and a use case diagram.',
      'Modeled the design with a class diagram, a state transition diagram, and activity diagrams for 7 flows: registration, booking, cancellation, equipment purchase, staff confirmation, and two reports.',
    ],
    images: img('stsport-booking-system'),
  },
  {
    slug: 'tix-id-redesign',
    title: 'TIX ID App Redesign',
    category: 'ux',
    course: 'UX Research & Design',
    term: 'Odd 2024/2025',
    team: 'Group of 3',
    role: 'Business Process Owner',
    tools: ['Figma', 'Design thinking'],
    summary: 'Redesigned the TIX ID movie ticket app so tickets and snacks are ordered in one checkout.',
    overview:
      'TIX ID is an Indonesian app for buying cinema tickets. Users found its home page cluttered, and they had to pay for tickets and snacks separately. The project followed design thinking from user research to a prototype.',
    contributions: [
      'Grouped Play Store user reviews into pain points, then built the user persona, user journey, and use case.',
      'Redesigned the Home page (vertical movie list, less clutter) and the bottom navigation (added F&B and Profile tabs), and merged ticket and F&B ordering into one checkout with a Skip option.',
      'Built the interactive Figma prototype.',
    ],
    images: img('tix-id-redesign'),
  },
  {
    slug: 'edupal-ai-teacher',
    title: 'EduPal — AI Teacher Assistant',
    category: 'ux',
    course: 'Foundations of AI',
    team: 'Group of 6',
    tools: ['Figma', 'NLP (concept)'],
    summary: 'Designed an AI learning app that keeps classes going when a teacher is absent.',
    overview:
      'When a teacher is absent, students often get a worksheet and no explanation. EduPal is a design concept for an app where AI explains the material, answers questions, and gives feedback on assignments. It was designed, not built.',
    contributions: [
      'Proposed the project idea: an app that keeps classes running when a teacher is absent.',
      'Wrote the background (Chapter 1) and the AI feature design (Chapter 4): NLP question answering, material recommendations, automatic assignment feedback, and a 24/7 chatbot.',
      'Designed the Figma prototype: sign-up by role, class schedule, AI-generated materials, Ask AI, assignment upload, and profile.',
    ],
    images: img('edupal-ai-teacher'),
  },
]
