import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { menuGroups as defaultMenu } from '../config/menu.js';
import { menuService } from '../../services/menuService.js';
import Fuse from 'fuse.js';

const MenuContext = createContext();

const hasPermission = (item, permissions) => {
  return (
    !item.requiredPermission ||
    permissions.includes(item.requiredPermission)
  );
};

const filterMenusByPermissions = (menus, permissions) => {
  if (!Array.isArray(menus)) return [];

  const filterRecursive = (items) => {
    if (!Array.isArray(items)) return [];

    return items
      .map((item) => {
        if (!hasPermission(item, permissions)) return null;

        if (item.items && Array.isArray(item.items)) {
          const filteredItems = filterRecursive(item.items);

          if (filteredItems.length === 0) return null;

          return { ...item, items: filteredItems };
        }

        return item;
      })
      .filter(Boolean);
  };

  return menus
    .map((group) => {
      if (group.items && Array.isArray(group.items)) {
        const filteredItems = filterRecursive(group.items);

        if (filteredItems.length === 0) return null;

        return { ...group, items: filteredItems };
      }

      return hasPermission(group, permissions) ? group : null;
    })
    .filter(Boolean);
};

const menuReducer = (state, action) => {
  switch (action.type) {
    case 'SET_MENUS':
      return {
        ...state,
        menus: action.payload,
        loading: false,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.payload,
      };

    case 'SET_USER_PERMISSIONS':
      return {
        ...state,
        userPermissions: action.payload,
        menus: filterMenusByPermissions(
          state.menus || [],
          action.payload
        ),
      };

    case 'UPDATE_BADGE':
      return {
        ...state,
        badges: {
          ...state.badges,
          [action.payload.key]: action.payload.count,
        },
      };

    default:
      return state;
  }
};

export const MenuProvider = ({
  children,
  userPermissions = [],
}) => {
  const [state, dispatch] = useReducer(menuReducer, {
    menus: defaultMenu,
    filteredMenus: [],
    searchTerm: '',
    loading: true,
    error: null,
    userPermissions: [],
    badges: {},
  });

  const loadMenus = useCallback(async () => {
    try {
      dispatch({
        type: 'SET_LOADING',
        payload: true,
      });

      const userMenus = await menuService.getUserMenus();

      dispatch({
        type: 'SET_MENUS',
        payload: userMenus || defaultMenu,
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message,
      });

      dispatch({
        type: 'SET_MENUS',
        payload: defaultMenu,
      });
    }
  }, []);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  useEffect(() => {
    dispatch({
      type: 'SET_USER_PERMISSIONS',
      payload: userPermissions,
    });
  }, [userPermissions]);

  const searchMenus = useCallback(
    (term) => {
      dispatch({
        type: 'SET_SEARCH_TERM',
        payload: term,
      });

      if (!term) {
        dispatch({
          type: 'SET_MENUS',
          payload: state.menus,
        });
        return;
      }

      const fuse = new Fuse(state.menus, {
        keys: ['label', 'items.label'],
        threshold: 0.3,
        includeScore: true,
      });

      const results = fuse
        .search(term)
        .map((result) => result.item);

      dispatch({
        type: 'SET_MENUS',
        payload: results,
      });
    },
    [state.menus]
  );

  const updateBadge = useCallback((key, count) => {
    dispatch({
      type: 'UPDATE_BADGE',
      payload: { key, count },
    });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      searchMenus,
      updateBadge,
      refetchMenus: loadMenus,
    }),
    [state, searchMenus, updateBadge, loadMenus]
  );

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error(
      'useMenu must be used within MenuProvider'
    );
  }

  return context;
};
