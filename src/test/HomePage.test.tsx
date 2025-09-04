import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HomePage from '@/app/home/page'

describe('HomePage', () => {
  it('renders home page content', () => {
    render(<HomePage />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
