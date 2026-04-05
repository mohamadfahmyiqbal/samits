// Reducer for maintenance schedule state management
export const maintenanceScheduleReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SCHEDULE_DATA':
      return { ...state, scheduleData: action.payload };
    
    case 'SET_MODAL_STATES':
      return { 
        ...state, 
        detailModalVisible: action.payload.detailModalVisible,
        selectedSchedule: action.payload.selectedSchedule,
        scheduleModalVisible: action.payload.scheduleModalVisible,
        scheduleModalMode: action.payload.scheduleModalMode,
        modalInitialValues: action.payload.modalInitialValues,
        modalLoading: action.payload.modalLoading,
      };
    
    case 'SET_VIEW_STATES':
      return {
        ...state,
        ganttViewType: action.payload.ganttViewType,
        selectedDateRange: action.payload.selectedDateRange,
      };
    
    case 'SET_CATEGORY_STATES':
      return {
        ...state,
        mainTypes: action.payload.mainTypes,
        categories: action.payload.categories,
        subCategories: action.payload.subCategories,
        itItems: action.payload.itItems,
        selectedMainType: action.payload.selectedMainType,
        selectedCategory: action.payload.selectedCategory,
        selectedSubCategory: action.payload.selectedSubCategory,
        categoriesLoading: action.payload.categoriesLoading,
        itItemsLoading: action.payload.itItemsLoading,
      };
    
    case 'SET_TEAM_STATES':
      return {
        ...state,
        maintenanceTeam: action.payload.maintenanceTeam,
        teamLoading: action.payload.teamLoading,
      };
    
    case 'RESET_CATEGORY_SELECTION':
      return {
        ...state,
        selectedCategory: null,
        selectedSubCategory: null,
        categories: [],
        subCategories: [],
        itItems: [],
      };
    
    case 'RESET_SUBCATEGORY_SELECTION':
      return {
        ...state,
        selectedSubCategory: null,
        subCategories: [],
        itItems: [],
      };
    
    case 'RESET_IT_ITEMS':
      return {
        ...state,
        itItems: [],
      };
    
    default:
      return state;
  }
};

// Initial state
export const initialMaintenanceScheduleState = {
  scheduleData: [],
  detailModalVisible: false,
  selectedSchedule: null,
  scheduleModalVisible: false,
  scheduleModalMode: 'add',
  modalInitialValues: null,
  modalLoading: false,
  ganttViewType: 'weekly',
  selectedDateRange: null,
  
  // Category states
  mainTypes: [],
  categories: [],
  subCategories: [],
  itItems: [],
  selectedMainType: null,
  selectedCategory: null,
  selectedSubCategory: null,
  categoriesLoading: false,
  itItemsLoading: false,
  
  // Team states
  maintenanceTeam: [],
  teamLoading: false,
};
