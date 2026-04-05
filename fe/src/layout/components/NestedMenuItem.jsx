import React from 'react';
import { NavDropdown, Collapse } from 'react-bootstrap';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

const NestedMenuItem = React.memo(
  ({ item, isOpen, isNestedActive, onToggle, isPathActive, goTo }) => {
    return (
      <React.Fragment key={item.id}>
        <div
          className={`dropdown-item d-flex justify-content-between align-items-center fw-bold py-2 ${isNestedActive(item.items) ? 'text-primary bg-light' : ''}`}
          onClick={(e) => onToggle(item.id, e)}
          style={{
            cursor: 'pointer',
            borderLeft: isNestedActive(item.items) ? '3px solid #0b6bcb' : 'none',
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
                  className={active ? 'active' : ''}
                  onClick={() => goTo(sub.path)}
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
