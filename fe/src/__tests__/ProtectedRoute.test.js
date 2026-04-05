import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
  })

  test('renders children when token exists', () => {
    localStorageMock.getItem.mockReturnValue('valid-token')
    
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    )
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  test('redirects to login when no token', () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    )
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
