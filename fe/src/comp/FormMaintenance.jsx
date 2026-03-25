import React from "react";
import Select from "react-select";
import { Form as BootstrapForm, Button } from "react-bootstrap";

export default function FormMaintenance({
  currentItem,
  formData,
  setFormData,
  handleSubmit,
  stokData = [], // default empty array supaya aman
}) {
  if (!currentItem) return <div className="p-4 text-center">Loading...</div>;

  // pastikan stokData selalu array
  const partList = (stokData || []).filter((i) => i.category === "Part");
  const consumableList = (stokData || []).filter((i) => i.category === "Consumable");
  const toolsList = (stokData || []).filter((i) => i.category === "Tools");

  const toOptions = (data) =>
    (data || []).map((item) => ({
      value: item.id,
      label: `${item.name} (Qty: ${item.qty})`,
      name: item.name,
    }));

  return (
    <BootstrapForm>
      <BootstrapForm.Group className="mb-2">
        <BootstrapForm.Label>Tipe Maintenance</BootstrapForm.Label>
        <BootstrapForm.Control type="text" value={formData.type || ""} disabled />
      </BootstrapForm.Group>

      <BootstrapForm.Group className="mb-2">
        <BootstrapForm.Label>Start Date</BootstrapForm.Label>
        <BootstrapForm.Control
          type="date"
          value={formData.startDate || ""}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
        />
      </BootstrapForm.Group>

      <BootstrapForm.Group className="mb-2">
        <BootstrapForm.Label>End Date</BootstrapForm.Label>
        <BootstrapForm.Control
          type="date"
          value={formData.endDate || ""}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
        />
      </BootstrapForm.Group>

      <BootstrapForm.Group className="mb-2">
        <BootstrapForm.Label>Checklist</BootstrapForm.Label>
        <BootstrapForm.Control
          as="textarea"
          rows={3}
          value={formData.checklist || ""}
          onChange={(e) => setFormData({ ...formData, checklist: e.target.value })}
        />
      </BootstrapForm.Group>

      <BootstrapForm.Group className="mb-2">
        <BootstrapForm.Label>Part</BootstrapForm.Label>
        <Select
          isMulti
          options={toOptions(partList)}
          value={formData.part || []}
          onChange={(selected) => setFormData({ ...formData, part: selected || [] })}
        />
      </BootstrapForm.Group>

      <BootstrapForm.Group className="mb-2">
        <BootstrapForm.Label>Consumable</BootstrapForm.Label>
        <Select
          isMulti
          options={toOptions(consumableList)}
          value={formData.consumable || []}
          onChange={(selected) => setFormData({ ...formData, consumable: selected || [] })}
        />
      </BootstrapForm.Group>

      <BootstrapForm.Group className="mb-2">
        <BootstrapForm.Label>Tools</BootstrapForm.Label>
        <Select
          isMulti
          options={toOptions(toolsList)}
          value={formData.tools || []}
          onChange={(selected) => setFormData({ ...formData, tools: selected || [] })}
        />
      </BootstrapForm.Group>

      <BootstrapForm.Group className="mb-2">
        <BootstrapForm.Label>Notes / Abnormal</BootstrapForm.Label>
        <BootstrapForm.Control
          as="textarea"
          rows={2}
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </BootstrapForm.Group>

      <BootstrapForm.Group className="mb-2">
        <BootstrapForm.Label>Hasil Maintenance</BootstrapForm.Label>
        <BootstrapForm.Select
          value={formData.result || "Normal"}
          onChange={(e) => setFormData({ ...formData, result: e.target.value })}
        >
          <option value="Normal">Normal</option>
          <option value="Abnormal">Abnormal</option>
        </BootstrapForm.Select>
      </BootstrapForm.Group>

      <Button variant="success" onClick={handleSubmit}>
        ✅ Selesai Maintenance
      </Button>
    </BootstrapForm>
  );
}
