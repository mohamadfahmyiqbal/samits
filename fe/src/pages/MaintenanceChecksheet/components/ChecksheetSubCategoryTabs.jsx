import React from 'react';
import { Nav } from 'react-bootstrap';

const ChecksheetSubCategoryTabs = ({
  subCategories = [],
  activeSubCategoryId,
  onSubCategoryChange,
}) => {
  if (!subCategories.length) {
    return null;
  }

  const handleSelect = (key) => {
    if (!key) return;
    onSubCategoryChange(Number(key));
  };

  return (
    <div className="primary-tabs-wrapper">
      <Nav
        variant="pills"
        className="asset-utama-primary-tabs checksheet-tertiary-tabs"
        activeKey={activeSubCategoryId ? String(activeSubCategoryId) : undefined}
        onSelect={handleSelect}
      >
        {subCategories.map((subcategory) => {
          const id = subcategory.sub_category_id || subcategory.id;
          if (!id) return null;
          const label =
            subcategory.sub_category_name ||
            subcategory.name ||
            subcategory.label ||
            'Unnamed';
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

export default ChecksheetSubCategoryTabs;
