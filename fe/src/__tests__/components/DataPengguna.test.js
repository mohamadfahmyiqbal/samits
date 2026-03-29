import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DataPengguna from '../DataPengguna.refactored';

// Mock dependencies
jest.mock('../../hooks/useTableData', () => ({
  __esModule: true,
  default: () => ({
    data: [
      { id: 1, name: 'Test User', email: 'test@example.com', department: 'IT', position: 'Developer', status: 'active' }
    ],
    loading: false,
    setData: jest.fn(),
    refreshData: jest.fn()
  })
}));

jest.mock('../../hooks/useModal', () => ({
  __esModule: true,
  default: () => ({
    visible: false,
    showModal: jest.fn(),
    hideModal: jest.fn()
  })
}));

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('DataPengguna Component', () => {
  test('renders page layout correctly', () => {
    render(
      <TestWrapper>
        <DataPengguna />
      </TestWrapper>
    );
    
    expect(screen.getByText('Data Pengguna')).toBeInTheDocument();
    expect(screen.getByText('Management data pengguna sistem')).toBeInTheDocument();
  });

  test('displays user statistics cards', () => {
    render(
      <TestWrapper>
        <DataPengguna />
      </TestWrapper>
    );
    
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('renders user table with correct columns', () => {
    render(
      <TestWrapper>
        <DataPengguna />
      </TestWrapper>
    );
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('opens add user modal when button clicked', () => {
    const mockShowModal = jest.fn();
    jest.doMock('../../hooks/useModal', () => ({
      __esModule: true,
      default: () => ({
        visible: false,
        showModal: mockShowModal,
        hideModal: jest.fn()
      })
    }));

    render(
      <TestWrapper>
        <DataPengguna />
      </TestWrapper>
    );
    
    const addButton = screen.getByText('Add User');
    fireEvent.click(addButton);
    
    expect(mockShowModal).toHaveBeenCalled();
  });
});
