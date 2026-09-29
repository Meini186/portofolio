import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithApp } from './helpers'
import ProjectPage from '../../src/pages/ProjectPage.vue'
import ProjectDetail from '../../src/components/ProjectDetail.vue'
import ScreenshotGallery from '../../src/components/ScreenshotGallery.vue'
import ImageLightbox from '../../src/components/ImageLightbox.vue'
import type { Project, ProjectImage } from '../../src/content/types'

afterEach(() => {
  document.body.innerHTML = ''
})

const images: ProjectImage[] = [
  { src: '/a.webp', alt: 'First screen', width: 1600, height: 1000 },
  { src: '/b.webp', alt: 'Second screen', width: 1600, height: 1000 },
]

const minimal: Project = {
  slug: 'minimal',
  title: 'Minimal project',
  category: 'qa',
  course: 'Course',
  team: 'Individual',
  tools: ['Tool'],
  summary: 'Summary',
  overview: 'Overview text',
  contributions: ['Did one thing'],
  images: [],
}

describe('ProjectPage', () => {
  it('renders a real project by slug', async () => {
    const w = await mountWithApp(ProjectPage, { slug: 'snapcash-pos' }, '/projects/snapcash-pos')
    expect(w.find('h1').text()).toBe('SnapCash POS — Project Plan')
    expect(w.text()).toContain('My contribution')
  })
  it('renders the 404 content for an unknown slug', async () => {
    const w = await mountWithApp(ProjectPage, { slug: 'does-not-exist' }, '/projects/does-not-exist')
    expect(w.find('h1').text()).toBe('This page does not exist')
    expect(w.find('a[href="/"]').exists()).toBe(true)
  })
})

describe('ProjectDetail', () => {
  it('renders a project with no images, links, stats, term, or role without empty sections', async () => {
    const w = await mountWithApp(ProjectDetail, { project: minimal })
    expect(w.find('h1').text()).toBe('Minimal project')
    expect(w.text()).toContain('Did one thing')
    expect(w.text()).not.toContain('Gallery')
    expect(w.text()).not.toContain('Key numbers')
    expect(w.findAll('a[target="_blank"]')).toHaveLength(0)
    expect(w.find('nav[aria-label="More projects"]').findAll('a')).toHaveLength(0)
  })
  it('opens external links in a new tab safely', async () => {
    const w = await mountWithApp(ProjectDetail, {
      project: { ...minimal, links: [{ label: 'Live', href: 'https://example.com' }] },
    })
    const a = w.find('a[href="https://example.com"]')
    expect(a.attributes('target')).toBe('_blank')
    expect(a.attributes('rel')).toBe('noopener noreferrer')
  })
})

describe('ScreenshotGallery', () => {
  it('emits open with the image index', async () => {
    const w = await mountWithApp(ScreenshotGallery, { images })
    await w.findAll('figure button')[1]!.trigger('click')
    expect(w.emitted('open')).toEqual([[1]])
  })
  it('still opens an image after a drag that ended outside any image', async () => {
    const w = await mountWithApp(ScreenshotGallery, { images })
    const track = w.find('.gallery').element
    // Native events: test-utils cannot set clientX on a jsdom MouseEvent.
    const fire = (type: string, clientX = 0) => {
      const e = new MouseEvent(type, { clientX, bubbles: true })
      Object.defineProperty(e, 'pointerType', { value: 'mouse' })
      track.dispatchEvent(e)
    }
    fire('pointerdown', 300)
    fire('pointermove', 200)
    fire('pointerleave') // drag ends off the track, so no click follows
    fire('pointerdown', 50) // a fresh press
    await w.findAll('figure button')[0]!.trigger('click')
    expect(w.emitted('open')).toEqual([[0]])
  })
  it('shows the alt text when an image fails to load', async () => {
    const w = await mountWithApp(ScreenshotGallery, { images })
    await w.findAll('img')[0]!.trigger('error')
    expect(w.findAll('figure')[0]!.text()).toContain('First screen')
    expect(w.findAll('figure')[0]!.find('img').exists()).toBe(false)
  })
})

describe('ImageLightbox', () => {
  it('opens on index, steps with arrow keys, and returns focus to the opener on close', async () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()

    const w = await mountWithApp(ImageLightbox, {
      images,
      index: null,
      'onUpdate:index': (v: number | null) => w.setProps({ index: v }),
    })
    await w.setProps({ index: 0 })
    const dialog = w.find('dialog')
    expect(dialog.attributes('open')).toBeDefined()
    expect(w.text()).toContain('1 / 2')

    await dialog.trigger('keydown', { key: 'ArrowRight' })
    await flushPromises() // the emitted update:index → setProps → re-render
    expect(w.text()).toContain('2 / 2')
    await dialog.trigger('keydown', { key: 'ArrowRight' })
    await flushPromises()
    expect(w.text()).toContain('1 / 2') // wraps around

    ;(dialog.element as HTMLDialogElement).close() // what Esc does in a real browser
    await flushPromises()
    expect((w.props() as Record<string, unknown>).index).toBeNull()
    expect(document.activeElement).toBe(opener)
  })
})
