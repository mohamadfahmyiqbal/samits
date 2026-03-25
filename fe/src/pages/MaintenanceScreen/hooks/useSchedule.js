


import { useContext, useMemo, useState, useCallback, useEffect } from "react";
import { MaintenanceContext } from "../../../context/MaintenanceContext";
import { AssetContext } from "../../../context/AssetContext";
import { format } from "date-fns";
import * as AssetService from "../../../services/AssetService";
import UserService from "../../../services/UserService";

export const useSchedule = () => {
  const { logs, createLog } = useContext(MaintenanceContext);
  const { utama, client } = useContext(AssetContext);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("monthly"); // daily, monthly, yearly
  
  // State untuk menyimpan type options dari API
  const [categoryTypesData, setCategoryTypesData] = useState([]);
  
  // State untuk menyimpan categories dari API
  const [categoriesData, setCategoriesData] = useState([]);
  
  // State untuk menyimpan data karyawan dari API
  const [karyawanData, setKaryawanData] = useState([]);

  const [formData, setFormData] = useState({
    assetId: "",
    category: "",
    type: "",
    scheduledDate: "",
    scheduledEndDate: "",
    pic: "",
    detail: "",
    hostname: ""
  });

  // Ambil category types dari API saat component mount
  useEffect(() => {
    const fetchCategoryTypes = async () => {
      try {
        const response = await AssetService.fetchCategoryTypes();
        if (response.data && Array.isArray(response.data)) {
          setCategoryTypesData(response.data);
        }
      } catch (error) {
        console.error("Gagal mengambil category types:", error);
      }
    };
    fetchCategoryTypes();
  }, []);

  // Ambil categories dari API saat component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await AssetService.fetchCategories();
        if (response.data && Array.isArray(response.data)) {
          setCategoriesData(response.data);
        }
      } catch (error) {
        console.error("Gagal mengambil categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Ambil data karyawan dari API saat component mount
  useEffect(() => {
    const fetchKaryawan = async () => {
      try {
        const response = await UserService.getAllKaryawan();
        if (response.data && Array.isArray(response.data)) {
          setKaryawanData(response.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data karyawan:", error);
      }
    };
    fetchKaryawan();
  }, []);

  const allAssets = useMemo(() => {
    const combined = [...utama, ...client];
    const seen = new Set();
    return combined.filter(a => {
      if (seen.has(a.noAsset)) return false;
      seen.add(a.noAsset);
      return true;
    }).map(a => ({
      noAsset: a.noAsset,
      hostname: a.hostname,
      category: a.category,
      type: a.type
    }));
  }, [utama, client]);

  // Get unique types based on selected category - ambil dari API
  const typeOptions = useMemo(() => {
    if (!formData.category) return [];
    
    // Cari semua type di data API berdasarkan category yang dipilih
    const categoryDataList = categoryTypesData.filter(
      cat => cat.category === formData.category
    );
    
    // Kumpulkan semua types dari semua category yang cocok dan hapus duplikat
    const allTypes = categoryDataList.flatMap(cat => cat.types || []);
    const uniqueTypes = [...new Set(allTypes)];
    
    if (uniqueTypes.length > 0) {
      return uniqueTypes.sort();
    }
    
    // Fallback: ambil dari assets jika tidak ada di API
    const typesFromAssets = allAssets
      .filter(a => a.category === formData.category)
      .map(a => a.type)
      .filter(Boolean);
    
    return [...new Set(typesFromAssets)].sort();
  }, [allAssets, formData.category, categoryTypesData]);

  // Filter assets by category and type
  const filteredAssets = useMemo(() => {
    return allAssets.filter(a => {
      if (formData.category && a.category !== formData.category) return false;
      if (formData.type && a.type !== formData.type) return false;
      return true;
    });
  }, [allAssets, formData.category, formData.type]);

  const categoryOptions = useMemo(() => {
    const categories = logs.map(l => l.category).filter(Boolean);
    return ["All", ...Array.from(new Set(categories))];
  }, [logs]);

  // Categories untuk dropdown di ScheduleForm - dari API
  const categoriesForForm = useMemo(() => {
    if (categoriesData.length > 0) {
      // Hapus duplikat berdasarkan category name
      const uniqueCategories = [...new Map(
        categoriesData.map(cat => [cat.category, cat])
      ).values()];
      
      return uniqueCategories
        .map(cat => ({
          value: cat.category,
          label: cat.category
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    // Fallback ke default jika API gagal
    return [
      { value: "Hardware", label: "Hardware" },
      { value: "Software", label: "Software" },
      { value: "Infrastruktur", label: "Infrastruktur" },
      { value: "Cyber", label: "Cyber" },
    ];
  }, [categoriesData]);

  const filteredLogs = useMemo(() => {
    if (filterCategory === "All") return logs;
    return logs.filter(l => l.category === filterCategory);
  }, [logs, filterCategory]);

  const logsByDate = useMemo(() => {
    const grouped = {};
    filteredLogs.forEach(log => {
      if (log.scheduledDate) {
        const dateKey = format(new Date(log.scheduledDate), "yyyy-MM-dd");
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(log);
      }
    });
    return grouped;
  }, [filteredLogs]);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleDayClick = useCallback((day) => {
    setSelectedDate(day);
  }, []);

  const handleDayDoubleClick = useCallback((day) => {
    setFormData(prev => ({
      ...prev,
      scheduledDate: format(day, "yyyy-MM-dd")
    }));
    setSelectedDate(day);
    setShowModal(true);
  }, []);

  // Handle category change - reset type and asset
  const handleCategoryChange = useCallback((e) => {
    const category = e.target.value;
    setFormData(prev => ({
      ...prev,
      category: category,
      type: "",
      assetId: "",
      hostname: ""
    }));
  }, []);

  // Handle type change - reset asset
  const handleTypeChange = useCallback((e) => {
    const type = e.target.value;
    setFormData(prev => ({
      ...prev,
      type: type,
      assetId: "",
      hostname: ""
    }));
  }, []);

  // Handle asset selection
  const handleAssetChange = useCallback((e) => {
    const selectedAsset = filteredAssets.find(a => a.noAsset === e.target.value);
    if (selectedAsset) {
      setFormData(prev => ({
        ...prev,
        assetId: selectedAsset.noAsset,
        hostname: selectedAsset.hostname || ""
      }));
    }
  }, [filteredAssets]);

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Map form field ke field yang diharapkan backend
      const apiData = {
        itItemId: formData.assetId,
        hostname: formData.hostname,
        category: formData.category,
        type: formData.type,
        scheduledDate: formData.scheduledDate,
        scheduledEndDate: formData.scheduledEndDate || formData.scheduledDate,
        pic: formData.pic,
        description: formData.detail,
        status: "pending"
      };
      await createLog(apiData);
      setShowModal(false);
      setFormData({
        assetId: "",
        category: "",
        type: "",
        scheduledDate: "",
        scheduledEndDate: "",
        pic: "",
        detail: "",
        hostname: ""
      });
    } catch (error) {
      alert(error.message || "Gagal menambahkan schedule");
    } finally {
      setIsSubmitting(false);
    }
  }, [createLog, formData]);

  const getLogsForDate = useCallback((date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return logsByDate[dateKey] || [];
  }, [logsByDate]);

  const selectedDateLogs = selectedDate ? getLogsForDate(selectedDate) : [];

  const getCategoryBadgeColor = (category) => {
    if (category === "Hardware") return "primary";
    if (category === "Software") return "success";
    if (category === "Infrastruktur") return "info";
    if (category === "Cyber") return "danger";
    return "warning";
  };

  const getStatusBadgeColor = (status) => {
    if (status === "pending") return "secondary";
    if (status === "in_progress") return "warning";
    if (status === "done") return "success";
    if (status === "abnormal") return "danger";
    return "secondary";
  };

  const getStatusLabel = (status) => {
    if (status === "pending") return "Open";
    if (status === "in_progress") return "In Progress";
    if (status === "done") return "Done";
    if (status === "abnormal") return "Abnormal";
    return status;
  };

  // View mode handlers
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  const handlePrevYear = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(newDate.getFullYear() - 1);
      return newDate;
    });
  }, []);

  const handleNextYear = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(newDate.getFullYear() + 1);
      return newDate;
    });
  }, []);

  const handlePrevDay = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  }, []);

  const handleNextDay = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  }, []);

  return {
    currentDate,
    selectedDate,
    filterCategory,
    showModal,
    isSubmitting,
    formData,
    allAssets,
    filteredAssets,
    typeOptions,
    categoryOptions,
    categoriesForForm,
    karyawanData,
    filteredLogs,
    logsByDate,
    selectedDateLogs,
    viewMode,
    setCurrentDate,
    setSelectedDate,
    setFilterCategory,
    setShowModal,
    setFormData,
    handlePrevMonth,
    handleNextMonth,
    handleToday,
    handleDayClick,
    handleDayDoubleClick,
    handleCategoryChange,
    handleTypeChange,
    handleAssetChange,
    handleFormChange,
    handleSubmit,
    handleViewModeChange,
    handlePrevYear,
    handleNextYear,
    handlePrevDay,
    handleNextDay,
    getLogsForDate,
    getCategoryBadgeColor,
    getStatusBadgeColor,
    getStatusLabel,
  };
};

