import { memo, useCallback } from 'react';
import * as LucideIcons from 'lucide-react';
import PropTypes from 'prop-types';

const MenuItem = memo(({
  item,
  level = 0,
  isPathActive,
  isDropdownActive,
  dropdownStates,
  toggleDropdown,
  goTo,
  focusedIndex,
  index,
  getBadgeCount,
  isFocused
}) => {
  const itemActive = item.path ? isPathActive(item.path) : isDropdownActive(item.items);
  const isOpen = dropdownStates[item.id] ?? false;
  const badgeCount = getBadgeCount(item.badgeKey || item.id);

  const handleClick = useCallback(() => {
    if (item.path) {
      goTo(item.path);
    } else if (item.type === 'dropdown') {
      toggleDropdown(item.id, !isOpen);
    }
  }, [item, goTo, toggleDropdown, isOpen]);

  let IconComponent = null;
  if (item.icon) {
    const IconName = item.icon.charAt(0).toUpperCase() + item.icon.slice(1) + 'Icon';
    IconComponent = LucideIcons[IconName];
    if (!IconComponent || typeof IconComponent !== 'function') {
      IconComponent = null;
    }
  }

  if (item.type === "dropdown" && item.items && item.items.length) {
    return (
      <div 
        className={`menu-dropdown p-0 ${level === 0 ? 'border-b' : ''} transition-all duration-200 ${
          itemActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''
        } ${isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
        role="menuitem"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <div className="dropdown-toggle flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          {IconComponent && <IconComponent className="w-4 h-4 mr-3 opacity-75" />}
          <span className="font-medium">{item.label}</span>
          
          {badgeCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[1.5rem] flex items-center justify-center">
              {badgeCount > 99 ? '99+' : badgeCount}
            </span>
          )}
          
          <span className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
        
        {isOpen && (
          <div className="dropdown-menu animate-in slide-in-from-top-2 duration-200 nested-menu overflow-hidden">
            {item.items.map((subItem, subIndex) => (
              <MenuItem 
                key={subItem.id || subItem.path || subItem.label} 
                item={subItem} 
                level={level + 1}
                isPathActive={isPathActive}
                isDropdownActive={isDropdownActive}
                dropdownStates={dropdownStates}
                toggleDropdown={toggleDropdown}
                goTo={goTo}
                focusedIndex={focusedIndex}
                index={`${index}-${subIndex}`}
                getBadgeCount={getBadgeCount}
                isFocused={false}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`menu-link p-3 cursor-pointer rounded-lg transition-all duration-200 ${
        itemActive 
          ? 'bg-blue-500 text-white shadow-md' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      } ${isFocused ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : ''}`}
      onClick={handleClick}
      role="menuitem"
      tabIndex={0}
      aria-current={itemActive ? "page" : undefined}
    >
      <div className="flex items-center">
        {IconComponent && <IconComponent className={`w-4 h-4 mr-3 ${itemActive ? 'opacity-100' : 'opacity-75'}`} />}
        <span>{item.label}</span>
        {badgeCount > 0 && (
          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[1.5rem] flex items-center justify-center">
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}
      </div>
    </div>
  );
});

MenuItem.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.string.isRequired,
    path: PropTypes.string,
    type: PropTypes.string,
    items: PropTypes.array,
    id: PropTypes.string,
    icon: PropTypes.string,
    badgeKey: PropTypes.string,
    requiredPermission: PropTypes.string
  }).isRequired,
  level: PropTypes.number,
  isPathActive: PropTypes.func.isRequired,
  isDropdownActive: PropTypes.func.isRequired,
  dropdownStates: PropTypes.object.isRequired,
  toggleDropdown: PropTypes.func.isRequired,
  goTo: PropTypes.func.isRequired,
  focusedIndex: PropTypes.number,
  index: PropTypes.string,
  getBadgeCount: PropTypes.func.isRequired,
  isFocused: PropTypes.bool
};

MenuItem.displayName = 'MenuItem';

export default MenuItem;

