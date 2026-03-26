import React, { useState, useCallback, useMemo } from "react";
import { Navbar, Nav, NavDropdown, Container, Collapse } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import PropTypes from "prop-types";
import { encryptPath } from "../../router/encryptPath";

const menuGroups = [
  { type: "link", label: "Dashboard", path: "dashboard" },
  {
    type: "dropdown",
    label: "Asset List",
    id: "asset-dropdown",
    items: [
      { label: "Asset Management", path: "asset management" },
    ],
  },
  {
    type: "dropdown",
    label: "Maintenance",
    id: "maintenance-dropdown",
    items: [
      { label: "Work Order", path: "workorder" },
      {
        type: "nested",
        label: "Preventive",
        id: "preventive-nested",
        items: [
          { label: "Schedule", path: "schedule" },
          { label: "PM Task / Checklist", path: "pm-task" },
          { label: "PM Calendar", path: "pm-calendar" },
          { label: "PM History", path: "pm-history" },
        ],
      },
    ],
  },
  { type: "link", label: "Stok Kontrol", path: "stok kontrol" },
  { type: "link", label: "Tambah User", path: "tambah user" },
  { type: "link", label: "Summary", path: "summary" },
];

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleNested = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedMenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const encryptedPathMap = useMemo(() => {
    const map = {};
    const processItems = (items) => {
      items.forEach((item) => {
        if (item.path) {
          map[item.path] = `/${encryptPath(item.path)}`;
        }
        if (item.items) {
          processItems(item.items);
        }
      });
    };

    menuGroups.forEach((group) => {
      if (group.type === "link") {
        map[group.path] = `/${encryptPath(group.path)}`;
      } else if (group.items) {
        processItems(group.items);
      }
    });
    return map;
  }, []);

  const isPathActive = useCallback(
    (path) => location.pathname === encryptedPathMap[path],
    [location.pathname, encryptedPathMap]
  );

  const isNestedActive = useCallback(
    (items) => items.some(item => isPathActive(item.path)),
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
      const targetPath = encryptedPathMap[path];
      if (targetPath) {
        navigate(targetPath);
        onNavigate?.();
      }
    },
    [encryptedPathMap, navigate, onNavigate]
  );

  return (
    <Navbar bg="light" className="shadow-sm sidebar-navbar py-0">
      <Container fluid className="px-0">
        <Nav className="sidebar-nav sidebar-nav-flex w-100">
          {menuGroups.map((group) => {
            if (group.type === "link") {
              const active = isPathActive(group.path);
              return (
                <Nav.Link
                  key={group.path}
                  className={active ? "active" : ""}
                  onClick={() => goTo(group.path)}
                  aria-current={active ? "page" : undefined}
                >
                  {group.label}
                </Nav.Link>
              );
            }

            const dropdownActive = isDropdownActive(group.items);
            return (
              <NavDropdown
                key={group.id}
                title={group.label}
                id={group.id}
                className={dropdownActive ? "active" : ""}
              >
                {group.items.map((item) => {
                  if (item.type === "nested") {
                    // Gunakan state manual jika ada, jika tidak ada (null/undefined) gunakan status active path
                    const isOpen = expandedMenus[item.id] ?? isNestedActive(item.items);
                    
                    return (
                      <React.Fragment key={item.id}>
                        <div 
                          className={`dropdown-item d-flex justify-content-between align-items-center fw-bold py-2 ${isNestedActive(item.items) ? "text-primary bg-light" : ""}`}
                          onClick={(e) => toggleNested(item.id, e)}
                          style={{ cursor: 'pointer', borderLeft: isNestedActive(item.items) ? '3px solid #0b6bcb' : 'none' }}
                        >
                          <span>{item.label}</span>
                          {isOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                        </div>
                        <Collapse in={isOpen}>
                          <div>
                            {item.items.map(sub => {
                              const active = isPathActive(sub.path);
                              return (
                                <NavDropdown.Item
                                  key={sub.path}
                                  className={active ? "active" : ""}
                                  onClick={() => goTo(sub.path)}
                                  style={{ paddingLeft: '2.5rem', fontSize: '0.9em' }}
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
                  
                  const active = isPathActive(item.path);
                  return (
                    <NavDropdown.Item
                      key={item.path}
                      className={active ? "active" : ""}
                      onClick={() => goTo(item.path)}
                    >
                      {item.label}
                    </NavDropdown.Item>
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
