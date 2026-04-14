// fe\src\context\AssetContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import * as AssetService from "../services/AssetService";

export const AssetContext = createContext();

export const AssetProvider = ({ children }) => {
  const [utama, setUtama] = useState([]);
  const [client, setClient] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const updateAssetList = useCallback((group, newAsset) => {
    const listSetter =
      group === "utama" ? setUtama : setClient;

    listSetter((prev) =>
      prev.map((item) =>
        item.noAsset === newAsset.noAsset
          ? newAsset
          : item
      )
    );
  }, []);

  const addAsset = useCallback(async (newAssetData) => {
    try {
      const res = await AssetService.createAsset(
        newAssetData
      );

      if (res.data) {
        if (res.data.assetGroup === "utama") {
          setUtama((prev) => [...prev, res.data]);
        } else {
          setClient((prev) => [...prev, res.data]);
        }
      }

      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const saveUpdate = useCallback(
    async (assetNo, updateData) => {
      try {
        const res = await AssetService.updateAsset(
          assetNo,
          updateData
        );

        if (res.data) {
          updateAssetList(
            res.data.assetGroup,
            res.data
          );
        }

        return res;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [updateAssetList]
  );

  const deleteAsset = useCallback(
    async (assetNo, assetGroup) => {
      try {
        await AssetService.deleteAsset(assetNo);

        const listSetter =
          assetGroup === "utama"
            ? setUtama
            : setClient;

        listSetter((prev) =>
          prev.filter(
            (item) => item.noAsset !== assetNo
          )
        );

        return {
          message: "Asset berhasil dihapus",
        };
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    []
  );

  const fetchAllAssets = useCallback(async () => {
    setLoaded(false);
    setError("");

    try {
      const [utamaRes, clientRes] = await Promise.all([
        AssetService.fetchAssets("utama"),
        AssetService.fetchAssets("client"),
      ]);

      setUtama(
        Array.isArray(utamaRes.data)
          ? utamaRes.data
          : []
      );

      setClient(
        Array.isArray(clientRes.data)
          ? clientRes.data
          : []
      );

      setLoaded(true);
    } catch (err) {
      console.error(
        "Gagal memuat data asset:",
        err
      );

      setError(
        err.message ||
          "Terjadi kesalahan saat memuat data"
      );

      setLoaded(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(Boolean(token));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllAssets();
    }
  }, [isAuthenticated, fetchAllAssets]);

  const value = useMemo(
    () => ({
      utama,
      setUtama,
      client,
      setClient,
      loaded,
      error,
      refreshAssets: fetchAllAssets,
      addAsset,
      saveUpdate,
      deleteAsset,
    }),
    [
      utama,
      client,
      loaded,
      error,
      fetchAllAssets,
      addAsset,
      saveUpdate,
      deleteAsset,
    ]
  );

  return (
    <AssetContext.Provider value={value}>
      {children}
    </AssetContext.Provider>
  );
};