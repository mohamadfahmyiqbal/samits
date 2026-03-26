// src/context/MaintenanceContext.jsx

import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { AssetContext } from "./AssetContext";
import { sopConfig } from "../pages/AssetManagement/asset/config/sopConfig";
import { isSameDay, isSameMonth, isSameYear, parseISO, addYears } from "date-fns"; 
import * as MaintenanceService from "../services/MaintenanceService"; 

export const MaintenanceContext = createContext();

export const MaintenanceProvider = ({ children }) => {
  // Ambil data asset untuk membuat log awal
  const { utama, client } = useContext(AssetContext);

  // 1. Logs yang sedang aktif/berjalan (State Utama)
  const [logs, setLogs] = useState([]); 
  // 2. Log yang sudah selesai dan diarsipkan
  const [historyLogs, setHistoryLogs] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const defaultPIC = useRef({
    Hardware: "Deni",
    Software: "Fahmy",
    Cyber: "Fadhi",
    Infrastruktur: "Misbah"
  });

  // Helper untuk menghitung tanggal pemeliharaan tahun berikutnya
  const calculateNext = (fromDate) => {
    const date = parseISO(fromDate); 
    const nextDate = addYears(date, 1);
    return nextDate.toISOString().split("T")[0];
  };

  // Sinkronisasi status log (Overdue check)
  const syncLogs = useCallback((prevLogs) => {
    // Implementasi logika Overdue, In-Progress, dll. (TIDAK BERUBAH)
    const today = new Date().toISOString().split("T")[0];
    return prevLogs.map((log) => {
      let status = log.status;
      if (log.status === 'in-progress') return log; // Jangan ubah status 'in-progress'
      if (log.scheduledDate < today) {
        status = 'overdue';
      } else {
        status = 'pending';
      }
      return { ...log, status };
    });
  }, []);

  // =======================================================================
  // 1. FUNGSI FETCH & GENERATE LOGS
  // =======================================================================

  const fetchAndGenerateLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch Log Aktif dan Riwayat dari API
      const activeRes = await MaintenanceService.fetchActiveLogs();
      const historyRes = await MaintenanceService.fetchHistoryLogs();
      


      const initialActiveLogs = Array.isArray(activeRes.data) ? activeRes.data : [];
      const initialHistoryLogs = Array.isArray(historyRes.data) ? historyRes.data : [];

      // Gabungkan semua aset untuk generate logs yang TIDAK ada di active logs
      const allAssets = [...utama, ...client];
      
      const activeAssetIds = new Set(initialActiveLogs.map(log => log.itItemId));
      
      const newLogs = allAssets
        .filter(asset => !activeAssetIds.has(asset.noAsset))
        .map(asset => {
          // Asumsi: sopConfig berisi data maintenance awal (category, type, schedule)
          const sop = sopConfig[asset.category] || {};
          
          return {
            itItemId: asset.noAsset,
            assetGroup: asset.assetGroup,
            hostname: asset.hostname,
            category: asset.category,
            type: asset.type,
            pic: defaultPIC.current[asset.category] || "N/A",
            // Tanggal scheduled default (misalnya, 1 tahun dari hari ini)
            scheduledDate: calculateNext(new Date().toISOString().split("T")[0]), 
            status: 'pending',
            detail: sop.schedule || "Cek Berkala",
            notes: "",
            executedBy: "",
          };
        });
        


      // Set logs aktif: logs baru + logs yang sudah ada dari API, lalu sinkronkan status
      setLogs(syncLogs([...initialActiveLogs, ...newLogs]));
      setHistoryLogs(initialHistoryLogs);

    } catch (err) {
      setError(err.message || "Gagal memuat log maintenance.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [utama, client, syncLogs]); // Dipanggil ulang jika data asset berubah

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAndGenerateLogs();
    }
  }, [fetchAndGenerateLogs, isAuthenticated]);

  // =======================================================================
  // 2. FUNGSI UPDATE LOG (PERBAIKAN KRITIS)
  // =======================================================================

  const updateLog = useCallback(async (logId, updateData) => {
    try {
        // Panggil API untuk update (backend akan mengurus pengarsipan)
        const res = await MaintenanceService.updateLog(logId, updateData);
        // Data yang kembali adalah log yang sudah diperbarui/diarsipkan
        const updatedLog = res.data; 

        // Cek apakah log diarsipkan (status 'done' atau 'abnormal')
        if (updatedLog.status === "done" || updatedLog.status === "abnormal") {
            
            // 1. KONDISI PENGARSIPAN: Hapus dari state logs aktif
            setLogs((prev) => prev.filter((log) => log.itItemId !== logId));

            // 2. Tambahkan log BARU (yang sudah diarsipkan, memiliki archivedAt) ke historyLogs
            setHistoryLogs((prev) => [updatedLog, ...prev]);

            return { message: res.message || "Log berhasil diarsipkan dan diperbarui" };

        } else {
            // 3. KONDISI PEMBARUAN NORMAL (Status masih 'in-progress', 'pending', dll.)

            // Ganti log LAMA di state logs aktif dengan log yang BARU dari API
            setLogs((prev) =>
                prev.map((log) => (log.itItemId === logId ? syncLogs([updatedLog])[0] : log))
            );
            // Catatan: Gunakan syncLogs untuk memastikan status Overdue/Pending terbaru

            return { message: res.message || "Log berhasil diperbarui" };
        }

    } catch (err) {
        setError(err.message || "Gagal memperbarui log.");
        throw err;
    }
  }, [syncLogs]);

  // =======================================================================
  // 3. FUNGSI CREATE LOG (Tambah Schedule)
  // =======================================================================

  const createLog = useCallback(async (logData) => {
    try {
        const res = await MaintenanceService.createLog(logData);
        const newLog = res.data;
        const createdLogs = Array.isArray(newLog) ? newLog : [newLog];
        
        setLogs((prev) => [...prev, ...createdLogs]);
        
        return { message: res.message || "Schedule berhasil ditambahkan", data: createdLogs };
    } catch (err) {
        setError(err.message || "Gagal menambahkan schedule.");
        throw err;
    }
  }, []);

  // DELETE Schedule (hanya pending)
  const deleteLog = useCallback(async (planId) => {
    try {
      const res = await MaintenanceService.deleteLog(planId);
      
      // Hapus dari local state
      setLogs(prev => prev.filter(log => log.id !== planId));
      
      return { message: res.message || "Schedule dihapus" };
    } catch (err) {
      setError(err.message || "Gagal hapus schedule");
      throw err;
    }
  }, []);


  // =======================================================================
  // 3. FUNGSI GET ACTIVITIES (untuk Dashboard)
  // =======================================================================

  // Gabungkan history logs (yang sudah diarsipkan) dan hapus duplikat jika ada (TIDAK BERUBAH)
  const allActivities = useMemo(() => {
    const combined = [...historyLogs]; 
    const seen = new Set();
    
    // Logika Duplikasi (diasumsikan sudah benar)
    return combined.filter((log) => {
      const key = `${log.itItemId}-${log.endDate || ""}-${log.result || ""}-${log.archivedAt}`; 
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [historyLogs]);

  const getFilteredLogs = (period = "daily", filter = "all") => {
    // Logika filtering untuk Dashboard (TIDAK BERUBAH)
    const today = new Date();

    const filteredByResult = allActivities.filter((log) => {
      if (!log.result) return false;
      if (filter === "normal") return log.result !== "Abnormal";
      if (filter === "abnormal") return log.result === "Abnormal";
      return true;
    });

    const filtered = filteredByResult.filter((log) => {
      const date = log.endDate ? parseISO(log.endDate) : null; 
      if (!date) return false;

      if (period === "daily") return isSameDay(date, today);
      if (period === "monthly") return isSameMonth(date, today);
      if (period === "yearly") return isSameYear(date, today);

      return true;
    });

    return filtered.sort((a, b) => {
      const t1 = parseISO(a.endDate).getTime();
      const t2 = parseISO(b.endDate).getTime();
      return t2 - t1; // Sort descending by endDate
    });
  };

  return (
    <MaintenanceContext.Provider
      value={{
        logs,
        historyLogs,
        updateLog, // Fungsi update yang diperbaiki
        createLog, // Fungsi create log baru
        isLoading,
        error,
        getFilteredLogs,
        allActivities // Logs untuk dashboard
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
};
