
import React, { useState } from "react";
import StokKontrol from "./StokKontrol";
import FormMaintenance from "./FormMaintenance";
import { showSuccess, alertSuccess } from "./Notification";

export default function Parent() {
  const initialStok = [
    { id: 1, name: "Harddisk 1TB", category: "Part", qty: 5, location: "Gudang A" },
    { id: 2, name: "Cable RJ45", category: "Consumable", qty: 20, location: "Gudang B" },
    { id: 3, name: "Obeng Set", category: "Tools", qty: 3, location: "Gudang C" },
    { id: 4, name: "RAM 8GB", category: "Part", qty: 10, location: "Gudang A" },
  ];

  const [stokData, setStokData] = useState(initialStok);

  const [formData, setFormData] = useState({
    type: "Preventive",
    part: [],
    consumable: [],
    tools: [],
    checklist: "",
    notes: "",
    startDate: "",
    endDate: "",
    result: "Normal",
  });

  const handleSubmitMaintenance = () => {
    // ===== Kurangi consumable otomatis =====
    const updatedStok = stokData.map((item) => {
      const used = formData.consumable.find((c) => c.value === item.id);
      if (used) {
        return { ...item, qty: item.qty - 1 };
      }
      return item;
    });
    setStokData(updatedStok);

    alertSuccess("Maintenance selesai & stok consumable diperbarui!");

    // Reset form
    setFormData({
      type: "Preventive",
      part: [],
      consumable: [],
      tools: [],
      checklist: "",
      notes: "",
      startDate: "",
      endDate: "",
      result: "Normal",
    });
  };

  return (
    <div className="p-3">
      <h2 className="mb-4">Sistem Maintenance</h2>

      <div className="mb-5">
        <StokKontrol stokData={stokData} setStokData={setStokData} />
      </div>

      <div className="mb-5">
        <Form as="form"Maintenance
          currentItem={{ id: 0 }}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmitMaintenance}
          stokData={stokData}
        />
      </div>
    </div>
  );
}
