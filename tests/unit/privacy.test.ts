// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { findViolations } from '../../scripts/privacy'
import { projects } from '../../src/content/projects'
import { site } from '../../src/content/site'

// Test inputs are built by concatenation, so this file never contains a literal
// that the repo-wide privacy check would flag.
const fakeId = '28' + '00000000'
const fakeCampusMail = 'x.y' + '@' + 'binus.ac.id'
const fakeCanvaEdit = 'https://www.canva.com/design/DAGabc/xyz/' + 'edit?utm=1'

describe('findViolations', () => {
  it('flags a student ID', () => {
    expect(findViolations(`NIM ${fakeId} here`)).toEqual([{ rule: 'student-id', match: fakeId }])
  })
  it('flags a campus email', () => {
    expect(findViolations(`mail ${fakeCampusMail}`)[0]?.rule).toBe('campus-email')
  })
  it('flags a Canva edit link', () => {
    expect(findViolations(fakeCanvaEdit)[0]?.rule).toBe('canva-edit')
  })
  it('does not flag normal numbers, prices, or dates', () => {
    expect(findViolations('2,125 rows, Rp 1,500,000, 20282568, 2026-09-29, 12345678901')).toEqual([])
  })
  it('finds nothing in the published content', () => {
    expect(findViolations(JSON.stringify({ projects, site }))).toEqual([])
  })
})
