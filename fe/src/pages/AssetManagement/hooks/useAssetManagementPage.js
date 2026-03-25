import useAssetPage from "../../hooks/useAssetPage";

export default function useAssetManagementPage() {
  return useAssetPage({
    contextKey: "utama",
    categoryTypeGroup: undefined,
    successLabel: "Asset",
    mainFilterMode: "category",
    requireSubCategorySelection: false,
    useQueryFetch: false,
    useLocalAssets: true,
    fetchGroup: null,
    enableAssetGroupTabs: false,
    defaultAssetGroupTab: "utama",
  });

}
