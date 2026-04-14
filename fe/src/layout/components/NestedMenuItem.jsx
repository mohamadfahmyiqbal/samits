// fe\src\layout\components\NestedMenuItem.jsx
import React from 'react';
import { NavDropdown, Collapse } from 'react-bootstrap';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

const NestedMenuItem = React.memo(
 ({ item, isOpen, isNestedActive, onToggle, isPathActive, goTo }) => {
  const nestedActive = React.useMemo(
   () => isNestedActive(item.items),
   [isNestedActive, item.items]
  );

  const handleSubClick = React.useCallback(
   (path) => {
    goTo(path);
   },
   [goTo]
  );

  return (
   <React.Fragment>
    <div
     className={`dropdown-item d-flex justify-content-between align-items-center fw-bold py-2 ${nestedActive ? 'text-primary bg-light' : ''}`}
     onClick={(e) => onToggle(item.id, e)}
     style={{
      cursor: 'pointer',
      borderLeft: nestedActive ? '3px solid #0b6bcb' : 'none',
     }}
     role='button'
     tabIndex={0}
     onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
       e.preventDefault();
       onToggle(item.id, e);
      }
     }}
     aria-expanded={isOpen}
     aria-controls={`nested-menu-${item.id}`}
    >
     <span>{item.label}</span>
     {isOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
    </div>
    <Collapse in={isOpen} id={`nested-menu-${item.id}`}>
     <div>
      {item.items.map((sub) => {
       const active = isPathActive(sub.path);
       return (
        <NavDropdown.Item
         key={sub.path}
         as='div'
         className={`${active
          ? 'active fw-semibold text-primary bg-light border-start border-3 border-primary'
          : ''
          }`}
         onClick={() => handleSubClick(sub.path)}
         style={{ paddingLeft: '2.5rem', fontSize: '0.9em', cursor: 'pointer' }}
        >
         {sub.label}
        </NavDropdown.Item>
       );
      })}
     </div>
    </Collapse>
   </React.Fragment>
  );
 }
);

NestedMenuItem.displayName = 'NestedMenuItem';

export default NestedMenuItem;
