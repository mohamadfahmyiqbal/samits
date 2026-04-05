import React from 'react';
import { NavDropdown } from 'react-bootstrap';

const DropdownItem = React.memo(({ item, isActive, onClick }) => {
  return (
    <NavDropdown.Item
      key={item.path}
      as='div'
      className={isActive ? 'active' : ''}
      onClick={() => onClick(item.path)}
      aria-current={isActive ? 'page' : undefined}
      style={{ cursor: 'pointer' }}
    >
      {item.label}
    </NavDropdown.Item>
  );
});

DropdownItem.displayName = 'DropdownItem';

export default DropdownItem;
