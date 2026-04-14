// fe\src\layout\components\DropdownItem.jsx
import React, { useCallback } from 'react';
import { NavDropdown } from 'react-bootstrap';

const DropdownItem = React.memo(
  ({ item, isActive = false, onClick }) => {
    const handleClick = useCallback(() => {
      onClick(item.path);
    }, [onClick, item.path]);

    return (
      <NavDropdown.Item
        as="div"
        className={isActive ? 'active' : ''}
        onClick={handleClick}
        aria-current={
          isActive ? 'page' : undefined
        }
        style={{
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {item.label}
      </NavDropdown.Item>
    );
  }
);

DropdownItem.displayName = 'DropdownItem';

export default DropdownItem;