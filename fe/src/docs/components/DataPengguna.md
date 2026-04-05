# DataPengguna Component

## Overview
The DataPengguna component is a comprehensive user management interface that provides CRUD operations for system users.

## Features
- 🔍 **Search & Filter**: Real-time search with status filtering
- 📊 **Statistics Dashboard**: Visual representation of user metrics
- ➕ **Add/Edit Users**: Modal-based user creation and editing
- 📱 **Responsive Design**: Mobile-friendly interface
- 🎨 **Modern UI**: Built with Ant Design components

## Props
No props required - uses internal state management.

## Hooks Used
- `useTableData`: Manages table data, loading states, and error handling
- `useModal`: Controls modal visibility and data

## Dependencies
- React 18+
- Ant Design
- Custom hooks from `/hooks`
- Shared components from `/components/shared`

## Usage Example
```jsx
import DataPengguna from './pages/DataPengguna/DataPengguna.refactored';

function App() {
  return <DataPengguna />;
}
```

## Component Structure
```
DataPengguna/
├── PageLayout (Header + Content)
├── Statistics Cards (4 metrics)
├── DataTable (Users table)
└── ActionModal (Add/Edit form)
```

## State Management
Uses React hooks for local state:
- `data`: Array of user objects
- `loading`: Loading state for async operations
- `selectedUser`: Currently selected user for editing
- `modalVisible`: Modal visibility state

## API Integration
Replace mock data in `useEffect` with actual API calls:

```jsx
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setData(response.data);
    } catch (error) {
      message.error('Failed to fetch users');
    }
  };
  fetchUsers();
}, []);
```

## Styling
- Uses shared CSS from `/styles/shared.css`
- Component-specific styles in `DataPengguna.css`
- Responsive design with mobile breakpoints

## Testing
Run tests with:
```bash
npm test DataPengguna.test.js
```

## Accessibility
- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast color scheme

## Performance
- Lazy loading with React.lazy
- Optimized re-renders with useMemo/useCallback
- Efficient search with debouncing (recommended)

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
