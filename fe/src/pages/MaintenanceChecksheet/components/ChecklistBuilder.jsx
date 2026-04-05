import React from 'react';
import ChecksheetTable from './ChecksheetTable';

const ChecklistBuilder = ({
  activeSubCategoryId,
  activeCategoryId,
  categories,
  subCategories,
}) => (
  <div>
    <ChecksheetTable
      activeSubCategoryId={activeSubCategoryId}
      activeCategoryId={activeCategoryId}
      categories={categories}
      subCategories={subCategories}
    />
  </div>
);

export default ChecklistBuilder;
