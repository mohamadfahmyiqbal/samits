// fe\src\layout\components\MenuLink.jsx
import React, { useCallback } from 'react';
import { Nav } from 'react-bootstrap';

const MenuLink = React.memo(
  ({ item, isActive, onClick }) => {
    const handleClick = useCallback(() => {
      onClick(item.path);
    }, [onClick, item.path]);

    return (
      <Nav.Link
        as="div"
        className={`menu-link ${
          isActive
            ? 'active'
            : ''
        }`}
        onClick={handleClick}
        aria-current={
          isActive
            ? 'page'
            : undefined
        }
        style={{
          cursor: 'pointer',
          transition:
            'all 0.2s ease-in-out',
        }}
      >
        {item.label}
      </Nav.Link>
    );
  }
);

MenuLink.displayName = 'MenuLink';

export default MenuLink;