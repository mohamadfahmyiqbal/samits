// src/context/AssetContext.jsx

import React, { createContext, useState, useEffect, useCallback } from "react";
import * as AssetService from "../services/AssetService";

export const AssetContext = createContext();

export const AssetProvider = ({ children }) => {
  const [utama, setUtama] = useState([]);
  const [client, setClient] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  // Helper untuk memperbarui daftar aset (utama atau client)
  const updateAssetList = useCallback((group, newAsset) => {
    const listSetter = group === 'utama' ? setUtama : setClient;
    listSetter(prev => prev.map(a => 
      a.noAsset === newAsset.noAsset ? newAsset : a
    ));
  }, [setUtama, setClient]); 

  // =======================================================================
  // FUNGSI CRUD BARU
  // =======================================================================

  // 1. CREATE
  const addAsset = useCallback(async (newAssetData) => {
    try {
      const res = await AssetService.createAsset(newAssetData);
      if (res.data) {
        // Tambahkan ke state lokal berdasarkan assetGroup
        if (res.data.assetGroup === 'utama') {
          setUtama(prev => [...prev, res.data]);
        } else {
          setClient(prev => [...prev, res.data]);
        }
      }
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [setUtama, setClient]);

  // 2. UPDATE
const saveUpdate = useCallback(async (assetNo, updateData) => {
    console.log('🔄 DEBUG UPDATE - Input:', { assetNo, updateDataKeys: Object.keys(updateData) });
    try {
      console.log('📡 Calling AssetService.updateAsset...');
      const res = await AssetService.updateAsset(assetNo, updateData);
      console.log('✅ UPDATE SUCCESS - Response:', res.data ? { noAsset: res.data.noAsset, nama: res.data.nama } : 'No data' );

      if (res.data) {
        updateAssetList(res.data.assetGroup, res.data);
      }
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [updateAssetList]);

  // 3. DELETE
  const deleteAsset = useCallback(async (assetNo, assetGroup) => {
    try {
      // Panggil API DELETE
      await AssetService.deleteAsset(assetNo);
      
      // Hapus dari state lokal
      const listSetter = assetGroup === 'utama' ? setUtama : setClient;
      listSetter(prev => prev.filter(a => a.noAsset !== assetNo));
      
      return { message: "Asset berhasil dihapus" };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [setUtama, setClient]);
  
  // Fungsi fetchAllAssets yang sudah ada
  const fetchAllAssets = useCallback(async () => {
    setLoaded(false);
    setError("");
    try {
      const utamaRes = await AssetService.fetchAssets("utama");
      const clientRes = await AssetService.fetchAssets("client");

      setUtama(Array.isArray(utamaRes.data) ? utamaRes.data : []);
      setClient(Array.isArray(clientRes.data) ? clientRes.data : []);
      setLoaded(true);
    } catch (err) {
      console.error("Gagal memuat data asset:", err);
      setError(err.message || "Terjadi kesalahan saat memuat data");
      setLoaded(false);
    }
  }, [setUtama, setClient]); 

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllAssets();
    }
  }, [fetchAllAssets, isAuthenticated]);

  return (
    <AssetContext.Provider
      value={{
        utama,
        setUtama, 
        client,
        setClient, 
        loaded,
        error,
        refreshAssets: fetchAllAssets,
        // ✅ EXPORT FUNGSI CRUD
        addAsset,    
        saveUpdate,  
        deleteAsset, 
      }}
    >
      {children}
    </AssetContext.Provider>
  );
};