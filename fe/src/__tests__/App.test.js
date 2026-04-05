import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

// Mock components untuk testing
jest.mock('../pages/LoginScreen', () => () => <div>Login Page</div>)
jest.mock('../pages/DashboardScreen', () => () => <div>Dashboard</div>)
jest.mock('../layout/MainLayout', () => ({ children }) => <div>Main Layout{children}</div>)

describe('App Routing', () => {
  test('renders login page at /login route', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    // Should redirect to login by default
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })
})
