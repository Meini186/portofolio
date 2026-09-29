import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mountWithApp } from './helpers'
import HomePage from '../../src/pages/HomePage.vue'
import ProjectFilter from '../../src/components/ProjectFilter.vue'
import ContactSection from '../../src/components/ContactSection.vue'
import StatNumber from '../../src/components/StatNumber.vue'
import { media } from '../setup'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('HomePage', () => {
  it('renders the headline and one card per project', async () => {
    const w = await mountWithApp(HomePage)
    expect(w.find('h1').text()).toContain('clear decisions')
    expect(w.findAll('#work li')).toHaveLength(11)
  })
  it('shows 3 featured cards', async () => {
    const w = await mountWithApp(HomePage)
    expect(w.findAll('#featured article')).toHaveLength(3)
  })
  it('filters the grid when a chip is pressed', async () => {
    const w = await mountWithApp(HomePage)
    const qa = w.findAll('#work button').find((b) => b.text().startsWith('QA'))!
    await qa.trigger('click')
    await nextTick()
    expect(qa.attributes('aria-pressed')).toBe('true')
    const items = w.findAll('#work li')
    expect(items).toHaveLength(1)
    expect(items[0]!.text()).toContain('LiveTix')
  })
  it('hides the contact section and the CV button while that data is missing', async () => {
    const w = await mountWithApp(HomePage)
    expect(w.find('#contact').exists()).toBe(false)
    expect(w.text()).not.toContain('Download CV')
  })
})

describe('ProjectFilter', () => {
  it('marks only the active chip as pressed and shows counts', async () => {
    const w = await mountWithApp(ProjectFilter, {
      modelValue: 'all',
      counts: { all: 11, 'data-bi': 4, database: 2, qa: 1, 'systems-pm': 2, ux: 2 },
    })
    const pressed = w.findAll('button').filter((b) => b.attributes('aria-pressed') === 'true')
    expect(pressed.map((b) => b.text())).toEqual(['All 11'])
  })
})

describe('ContactSection', () => {
  it('renders only the links that exist', async () => {
    const w = await mountWithApp(ContactSection, { contact: { email: 'meini@example.com' } })
    expect(w.find('a[href="mailto:meini@example.com"]').exists()).toBe(true)
    expect(w.text()).not.toContain('LinkedIn')
  })
})

describe('StatNumber', () => {
  it('shows the formatted final number when motion is reduced', async () => {
    media.reduce = true
    const w = await mountWithApp(StatNumber, { value: 2125, label: 'rows' })
    await nextTick()
    expect(w.text()).toContain('2,125')
  })
})
