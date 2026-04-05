import React, { createContext, useContext, useReducer, useEffect } from 'react';

const ChecksheetManagementContext = createContext();

const initialState = {
  mainTypes: [],
  categories: [],
  subCategories: [],
  activeMainTypeId: null,
  activeCategoryId: null,
  activeSubCategoryId: null,
  checklists: [],
  loading: false,
  error: null,
  selectedChecksheet: null,
  showCreateModal: false,
  showEditModal: false,
  showAssignModal: false,
  filters: {
    search: '',
    status: 'all',
    assetType: '',
    activeTab: 'Hardware General',
  },
  refreshKey: 0,
  selectedTemplate: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_MAIN_TYPES':
      return { ...state, mainTypes: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_SUB_CATEGORIES':
      return { ...state, subCategories: action.payload };
    case 'SET_ACTIVE_MAIN_TYPE':
      return { ...state, activeMainTypeId: action.payload };
    case 'SET_ACTIVE_CATEGORY':
      return { ...state, activeCategoryId: action.payload };
    case 'SET_ACTIVE_SUB_CATEGORY':
      return { ...state, activeSubCategoryId: action.payload };
    case 'SET_CHECKLISTS':
      return { ...state, checklists: action.payload };
    case 'SELECT_CHECKSHEET':
      return { ...state, selectedChecksheet: action.payload };
    case 'SET_MODAL':
      return { ...state, [action.modal]: action.payload };
    case 'BUMP_REFRESH_KEY':
      return { ...state, refreshKey: (state.refreshKey || 0) + 1 };
    case 'SET_TEMPLATE':
      return { ...state, selectedTemplate: action.payload };
    case 'UPDATE_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
};

export const ChecksheetManagementProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // TODO: Load checklists from API on mount
  useEffect(() => {
    // Placeholder untuk service call
  }, []);

  return (
    <ChecksheetManagementContext.Provider value={{ state, dispatch }}>
      {children}
    </ChecksheetManagementContext.Provider>
  );
};

export const useChecksheetManagement = () => {
  const context = useContext(ChecksheetManagementContext);
  if (!context) {
    throw new Error('useChecksheetManagement must be used within ChecksheetManagementProvider');
  }
  return context;
};

