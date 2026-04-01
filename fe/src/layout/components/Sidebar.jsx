
import React, { useReducer, useCallback, useMemo } from 'react';
import { Navbar, Nav, NavDropdown, Container, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { menuGroups } from '../../config/menuConfig';
import { useEncryptedPaths } from '../../hooks/useEncryptedPaths';
import { useUserRole } from '../../hooks/useUserRole';
import { sidebarReducer, initialSidebarState } from '../reducers/sidebarReducer';
import MenuLink from './MenuLink';
import NestedMenuItem from './NestedMenuItem';
import DropdownItem from './DropdownItem';

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, dispatch] = useReducer(sidebarReducer, initialSidebarState);
  const { userRole, hasRole, isLoading } = useUserRole();

  // Filter menu berdasarkan role user
  const filteredMenuGroups = useMemo(() => {
    if (!userRole) return menuGroups;

    const filterItems = (items) => {
      return items
        .filter((item) => {
          // Jika tidak ada allowedRoles, tampilkan untuk semua
          if (!item.allowedRoles) return true;
          return item.allowedRoles.includes(userRole);
        })
        .map((item) => {
          // Jika nested, filter items di dalamnya juga
          if (item.items) {
            const filteredNested = filterItems(item.items);
            return { ...item, items: filteredNested };
          }
          return item;
        });
    };

    return menuGroups
      .filter((group) => {
        if (!group.allowedRoles) return true;
        return group.allowedRoles.includes(userRole);
      })
      .map((group) => {
        if (group.items) {
          const filteredItems = filterItems(group.items);
          return { ...group, items: filteredItems };
        }
        return group;
      });
  }, [userRole]);

  const encryptedPathMap = useEncryptedPaths(filteredMenuGroups);

  const toggleNested = useCallback((id, e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_MENU', payload: id });
  }, []);

  const isPathActive = useCallback(
    (path) => location.pathname === encryptedPathMap.get(path),
    [location.pathname, encryptedPathMap]
  );

  const isNestedActive = useCallback(
    (items) => items.some((item) => isPathActive(item.path)),
    [isPathActive]
  );

  const isDropdownActive = useCallback(
    (items) =>
      items.some((item) => {
        if (item.path) return isPathActive(item.path);
        if (item.items) return isNestedActive(item.items);
        return false;
      }),
    [isPathActive, isNestedActive]
  );

const goTo = useCallback(
    (path) => {
      const targetPath = encryptedPathMap.get(path);
      
      if (targetPath) {
        navigate(targetPath, { replace: true });
        onNavigate?.();
      } else {
        console.warn(`⚠️ Navigation path "${path}" not found in map`);
        toast.error(`Navigasi "${path}" tidak tersedia`);
      }
    },
    [encryptedPathMap, navigate, onNavigate]
  );

  // Show loading state while user role is being determined
  if (isLoading) {
    return (
      <Navbar bg='light' className='shadow-sm sidebar-navbar'>
        <Container fluid className='px-0 d-flex justify-content-center align-items-center py-4'>
          <Spinner animation='border' size='sm' variant='primary' />
          <span className='ms-2 text-muted'>Loading menu...</span>
        </Container>
      </Navbar>
    );
  }

  return (
    <Navbar bg='light' className='shadow-sm sidebar-navbar'>
      <Container fluid className='px-0'>
        <Nav className='sidebar-nav sidebar-nav-flex w-100' role='navigation'>
          {filteredMenuGroups.map((group) => {
            if (group.type === 'link') {
              const active = isPathActive(group.path);
              return <MenuLink key={group.path} item={group} isActive={active} onClick={goTo} />;
            }

            const dropdownActive = isDropdownActive(group.items);
            return (
              <NavDropdown
                key={group.id}
                title={group.label}
                id={group.id}
                className={dropdownActive ? 'active' : ''}
                aria-expanded={dropdownActive}
              >
                {group.items.map((item) => {
                  if (item.type === 'nested') {
                    const isOpen = state.expandedMenus[item.id] ?? isNestedActive(item.items);

                    return (
                      <NestedMenuItem
                        key={item.id}
                        item={item}
                        isOpen={isOpen}
                        isNestedActive={isNestedActive}
                        onToggle={toggleNested}
                        isPathActive={isPathActive}
                        goTo={goTo}
                      />
                    );
                  }

                  const active = isPathActive(item.path);
                  const uniqueKey = item.path ? `${item.path}-${item.label}` : item.id;
                  return (
                    <DropdownItem key={uniqueKey} item={item} isActive={active} onClick={goTo} />
                  );
                })}
              </NavDropdown>
            );
          })}
        </Nav>
      </Container>
    </Navbar>
  );
}

Sidebar.propTypes = {
  onNavigate: PropTypes.func,
};
