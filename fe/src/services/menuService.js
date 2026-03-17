// import apiClient from './apiClient.js'; // Sesuaikan dengan API client existing
import { menuGroups as defaultMenus } from '../layout/config/menu.js';

// Mock data untuk development (ganti dengan real API)
const MOCK_USER_MENUS = [
  { 
    type: "link", 
    label: "Dashboard", 
    path: "dashboard",
    icon: "activity",
    requiredPermission: null
  },
  {
    type: "dropdown",
    label: "Asset Management", 
    id: "asset-dropdown",
    icon: "package",
    items: [
      { 
        label: "Asset List", 
        path: "asset management",
        icon: "list"
      },
      {
        label: "Asset Audit", 
        path: "asset-audit",
        icon: "clipboard-list",
        requiredPermission: "asset.audit"
      }
    ]
  },
  {
    type: "dropdown",
    label: "Maintenance", 
    id: "maintenance-dropdown",
    icon: "wrench",
    badgeKey: "unreadWorkorders",
    items: [
      {
        type: "dropdown",
        label: "Preventive", 
        id: "preventive-dropdown",
        items: [
          { label: "Schedule", path: "schedule", icon: "calendar" },
          { label: "Work Order", path: "workorder", icon: "clipboard-check", badgeKey: "pendingWO" }
        ]
      }
    ]
  }
];

class MenuService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  async getUserMenus(userId = null) {
    const cacheKey = `menus_${userId || 'guest'}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      // Real API call
      // API call disabled - using mock data
      const response = { data: { menus: MOCK_USER_MENUS } };
      
      const menus = MOCK_USER_MENUS || defaultMenus;
      this.cache.set(cacheKey, { data: menus, timestamp: Date.now() });
      return menus;
    } catch (error) {
      console.warn('Menu API failed, using fallback:', error.message);
      // Return cached or default
      return cached?.data || defaultMenus;
    }
  }

  async getNotifications() {
    try {
      // API call disabled - using mock data
      const response = { data: { unreadWorkorders: 3, pendingWO: 1 } };
      return response.data;
    } catch (error) {
      return { unreadWorkorders: 0, pendingWO: 0 };
    }
  }

  subscribeUpdates(callback) {
    // WebSocket subscription untuk real-time menu updates
    // Implementasi sesuai WebSocket service existing
    console.log('MenuService: Subscribed to real-time updates');
  }
}

export const menuService = new MenuService();
export default menuService;

