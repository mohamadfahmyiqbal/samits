import React from 'react';
import { NavDropdown } from 'react-bootstrap';

const DropdownItem = React.memo(({ item, isActive, onClick }) => {
  return (
    <NavDropdown.Item
      key={item.path}
      className={isActive ? 'active' : ''}
      onClick={() => onClick(item.path)}
    >
      {item.label}
    </NavDropdown.Item>
  );
});

DropdownItem.displayName = 'DropdownItem';

export default DropdownItem;
