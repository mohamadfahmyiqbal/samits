export const sidebarReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_MENU':
      return {
        ...state,
        expandedMenus: {
          ...state.expandedMenus,
          [action.payload]: !state.expandedMenus[action.payload],
        },
      };
    case 'RESET_STATE':
      return {
        expandedMenus: {},
      };
    default:
      return state;
  }
};

export const initialSidebarState = {
  expandedMenus: {},
};
