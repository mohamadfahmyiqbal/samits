import React, { useState } from "react";
import StokFilter from "../comp/stokkontrol/filter/StokFilter";
import StokTable from "../comp/stokkontrol/tables/StokTable";
import StokModal from "../comp/ModalStok";

export default function StokKontrol() {
  const [stokData, setStokData] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({});

  return (
    <div className="p-3">
      <StokFilter
        search={search}
        setSearch={setSearch}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        stokData={stokData}
        openAddModal={() => {
          setEditMode(false);
          setCurrentItem({ name: "", category: "Part", qty: 0, location: "" });
          setShowModal(true);
        }}
        exportExcel={() => {
          // bisa ditambahkan disini
        }}
      />

      <StokTable
        stokData={stokData}
        search={search}
        filterCategory={filterCategory}
        openEditModal={(item) => {
          setEditMode(true);
          setCurrentItem(item);
          setShowModal(true);
        }}
        deleteItem={(id) => {
          if (window.confirm("Hapus item ini?")) {
            setStokData((prev) => prev.filter((item) => item.id !== id));
          }
        }}
      />

      <StokModal
        show={showModal}
        onHide={() => setShowModal(false)}
        editMode={editMode}
        currentItem={currentItem}
        setCurrentItem={setCurrentItem}
        saveItem={() => {
          if (editMode) {
            setStokData((prev) =>
              prev.map((item) => (item.id === currentItem.id ? currentItem : item))
            );
          } else {
            setStokData((prev) => [...prev, { ...currentItem, id: Date.now() }]);
          }
          setShowModal(false);
        }}
      />
    </div>
  );
}
