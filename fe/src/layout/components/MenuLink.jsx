import React from 'react';
import { Nav } from 'react-bootstrap';

const MenuLink = React.memo(({ item, isActive, onClick }) => {
  return (
    <Nav.Link
      key={item.path}
      className={isActive ? 'active' : ''}
      onClick={() => onClick(item.path)}
      aria-current={isActive ? 'page' : undefined}
    >
      {item.label}
    </Nav.Link>
  );
});

MenuLink.displayName = 'MenuLink';

export default MenuLink;
