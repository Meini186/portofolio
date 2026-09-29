import type { Site } from './types'
import { projects } from './projects'

export const site: Site = {
  name: 'Meini Rusiadi',
  shortName: 'Meini',
  roles: ['Data & BI Analyst', 'QA', 'Database'],
  headline: { lead: 'Turning messy data into', highlight: 'clear decisions' },
  intro:
    'Information Systems student at BINUS University. I clean data, build dashboards, write SQL, and design test cases.',
  cvUrl: undefined, // spec §13 item 2 — set to '/cv.pdf' once Meini provides the file
  contact: {}, // spec §13 item 3 — email / linkedin / github from Meini
  stats: [
    { value: projects.length, label: 'projects' },
    { value: 281, label: 'survey responses analysed' },
    { value: 2125, label: 'rows cleaned for one dashboard' },
    { value: 2, label: 'certificates' },
  ],
  skills: [
    { group: 'Data & BI', items: ['Tableau', 'Excel', 'PivotTable', 'Data cleaning', 'SmartPLS 4'] },
    { group: 'Database', items: ['Oracle SQL', 'MongoDB', 'ERD & data dictionary'] },
    { group: 'Quality assurance', items: ['Test case design', 'Black-box testing', 'Functional testing'] },
    {
      group: 'Analysis & PM',
      items: ['UML', 'Context & fishbone diagrams', 'Scrum', 'Critical Path Method', 'Business case'],
    },
    { group: 'UX', items: ['Figma', 'Design thinking', 'User persona & journey'] },
  ],
  certificates: [
    {
      name: 'Applied Database Systems using Oracle AI Database',
      issuer: 'Oracle Academy',
      date: 'June 2026',
    },
    {
      name: 'Good Achievement — Student Advisory and Support Center Mentoring Program',
      issuer: 'BINUS University',
      date: 'June 2026',
    },
  ],
}
