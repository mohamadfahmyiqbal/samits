import React from 'react';
import { Nav } from 'react-bootstrap';

const ChecksheetCategoryTabs = ({
  categories = [],
  activeCategoryId,
  onCategoryChange,
}) => {
  if (!categories.length) {
    return null;
  }

  const handleSelect = (key) => {
    if (!key) return;
    onCategoryChange(Number(key));
  };

  return (
    <div className="primary-tabs-wrapper">
      <Nav
        variant="pills"
        className="asset-utama-primary-tabs checksheet-secondary-tabs"
        activeKey={activeCategoryId ? String(activeCategoryId) : undefined}
        onSelect={handleSelect}
      >
        {categories.map((category) => {
          const id = category.category_id || category.id;
          if (!id) return null;
          const label = category.category || category.category_name || category.name || 'Unnamed';
          return (
            <Nav.Item key={id}>
              <Nav.Link eventKey={String(id)}>{label}</Nav.Link>
            </Nav.Item>
          );
        })}
      </Nav>
    </div>
  );
};

export default ChecksheetCategoryTabs;
