import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useMenu } from '../context/MenuContext';
import { encryptPath } from '../../routes/pathEncoding';
import { useLocation, useNavigate } from 'react-router-dom';

export const useSidebarMenu = ({ onNavigate } = {}) => {
  const { menus, searchTerm, searchMenus, loading, badges, updateBadge } = useMenu();
  const [searchActive, setSearchActive] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownStates, setDropdownStates] = useState({});
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setSearchActive(true);
        searchRef.current?.focus();
      }

      if (searchActive) {
        if (e.key === 'Escape') {
          setSearchActive(false);
          searchRef.current.value = '';
          searchMenus('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchActive, searchMenus]);

  useEffect(() => {
    setDropdownStates({});
    setFocusedIndex(-1);
  }, [location.pathname]);

  const encryptedPathMap = useMemo(() => {
    const collectPaths = (items) => {
      const paths = {};
      items.forEach(item => {
        if (item.path) {
          paths[item.path] = `/${encryptPath(item.path)}`;
        }
        if (item.items) {
          Object.assign(paths, collectPaths(item.items));
        }
      });
      return paths;
    };

    return collectPaths(menus);
  }, [menus]);

  const isPathActive = useCallback((path) => 
    location.pathname === encryptedPathMap[path],
    [location.pathname, encryptedPathMap]
  );

  const isDropdownActive = useCallback((items) => {
    if (!items) return false;
    return items.some(item => 
      item.path ? isPathActive(item.path) : isDropdownActive(item.items)
    );
  }, [isPathActive]);

  const toggleDropdown = useCallback((id, isOpen) => {
    setDropdownStates(prev => ({ ...prev, [id]: isOpen }));
  }, []);

  const handleSearch = useCallback((e) => {
    const term = e.target.value;
    searchMenus(term);
  }, [searchMenus]);

  const goTo = useCallback((path) => {
    if (!path) return;
    const targetPath = encryptedPathMap[path];
    if (targetPath) {
      navigate(targetPath);
      onNavigate?.();
      setSearchActive(false);
    }
  }, [encryptedPathMap, navigate, onNavigate]);

  const getBadgeCount = useCallback((badgeKey) => {
    return badges[badgeKey] || 0;
  }, [badges]);

  const focusNext = useCallback(() => {
    setFocusedIndex(prev => (prev + 1) % Math.max(1, menus.length));
  });

  const focusPrev = useCallback(() => {
    setFocusedIndex(prev => (prev - 1 + menus.length) % Math.max(1, menus.length));
  });

  return {
    menus,
    searchActive,
    setSearchActive,
    searchRef,
    handleSearch,
    dropdownStates,
    toggleDropdown,
    isPathActive,
    isDropdownActive,
    goTo,
    focusedIndex,
    focusNext,
    focusPrev,
    getBadgeCount,
    loading,
    encryptedPathMap,
    searchTerm,
    updateBadge,
  };
};
