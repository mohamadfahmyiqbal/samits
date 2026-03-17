import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { menuGroups as defaultMenu } from '../layout/config/menu.js';
import { menuService } from '../services/menuService.js';
import Fuse from 'fuse.js';

const MenuContext = createContext();

const menuReducer = (state, action) => {
  switch (action.type) {
    case 'SET_MENUS':
      return { 
        ...state, 
        menus: action.payload,
        loading: false,
        error: null 
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_USER_PERMISSIONS':
      return { 
        ...state, 
        userPermissions: action.payload,
menus: filterMenusByPermissions(state.menus || [], action.payload)
      };
    case 'UPDATE_BADGE':
      return {
        ...state,
        badges: {
          ...state.badges,
          [action.payload.key]: action.payload.count
        }
      };
    default:
      return state;
  }
};

const filterMenusByPermissions = (menus, permissions) => {
  if (!Array.isArray(menus)) return [];
  const filterRecursive = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map(item => {
      if (!hasPermission(item, permissions)) return null;
      
      if (item.items && Array.isArray(item.items)) {
        const filteredItems = item.items
          .map(filterRecursive)
          .filter(Boolean);
        if (filteredItems.length === 0) return null;
        return { ...item, items: filteredItems };
      }
      
      return item;
    }).filter(Boolean);
  };
  
    return menus.map(group => {
      if (group.items && Array.isArray(group.items)) {
        const filteredItems = filterRecursive(group.items);
        if (filteredItems.length === 0) return null;
        return { ...group, items: filteredItems };
      }
      return hasPermission(group, permissions) ? group : null;
    }).filter(Boolean);
};

const hasPermission = (item, permissions) => {
  // Default: semua menu accessible kecuali ada permission required
  return !item.requiredPermission || permissions.includes(item.requiredPermission);
};

export const MenuProvider = ({ children, userPermissions = [] }) => {
  const [state, dispatch] = useReducer(menuReducer, {
menus: defaultMenu,
    filteredMenus: [],
    searchTerm: '',
    loading: true,
    error: null,
    userPermissions: [],
    badges: {}
  });

  useEffect(() => {
    loadMenus();
  }, []);

  useEffect(() => {
    dispatch({ type: 'SET_USER_PERMISSIONS', payload: userPermissions });
  }, [userPermissions]);

  const loadMenus = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const userMenus = await menuService.getUserMenus();
      dispatch({ type: 'SET_MENUS', payload: userMenus || defaultMenu });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_MENUS', payload: defaultMenu });
    }
  };

  const searchMenus = (term) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
    
    if (!term) {
      dispatch({ type: 'SET_MENUS', payload: state.menus });
      return;
    }

    const fuse = new Fuse(state.menus, {
      keys: ['label', 'items.label'],
      threshold: 0.3,
      includeScore: true
    });

    const results = fuse.search(term).map(result => result.item);
    dispatch({ type: 'SET_MENUS', payload: results });
  };

  const updateBadge = (key, count) => {
    dispatch({ type: 'UPDATE_BADGE', payload: { key, count } });
  };

  const value = {
    ...state,
    searchMenus,
    updateBadge,
    refetchMenus: loadMenus
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within MenuProvider');
  }
  return context;
};

