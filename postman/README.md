# SAMIT Import Assets - Postman Collection

## Overview

Postman collection untuk import data aset dari Excel file ke SAMIT backend.

## Setup Instructions

### 1. Import Collection

1. Buka Postman
2. Klik **Import** → **Select Files**
3. Pilih file `import-assets.postman_collection.json`
4. Collection akan muncul dengan nama "SAMIT Import Assets"

### 2. Configure Environment Variables

Collection menggunakan variabel:

- `baseUrl`: Base URL backend (default: `http://localhost:5002`)
- `authToken`: JWT token (kosongkan untuk endpoint import yang tidak perlu auth)

### 3. Prepare Excel File

File Excel yang akan di-import harus memiliki format:

- **Row 1-4**: Header/Judul (akan di-skip)
- **Row 5 ke atas**: Data aktual

**Kolom yang dibaca:**

- **Kolom B**: `NO.ASSET` (wajib)
- **Kolom C**: `TYPE` (wajib)
- **Kolom G**: `NIK` (opsional)
- **Kolom J**: `HOSTNAME` (opsional)
- **Kolom K**: Tahun pembelian (opsional)
- **Kolom V**: Nomor PO (opsional)
- **Kolom Y**: Status (opsional)

## Available Requests

### 1. Import Assets from Excel

- **Method**: `POST /api/assets/import-excel`
- **Auth**: Tidak diperlukan
- **Body**: Form data dengan file Excel
- **Parameters**:
  - `file`: File Excel (required)
  - `debug`: Set ke `1` untuk enable debug logging (optional)
  - `sheetNames`: Nama sheet yang di-import, comma-separated (optional)

### 2. Import Assets (JSON Array)

- **Method**: `POST /api/assets/import`
- **Auth**: Tidak diperlukan
- **Body**: JSON array dengan format:

```json
[
  {
    "noAsset": "IT001",
    "type": "Laptop",
    "nik": "12345",
    "hostname": "LAPTOP-001",
    "tahunBeli": "2023",
    "noPO": "PO001",
    "status": "Active"
  }
]
```

### 3. List Imported Assets

- **Method**: `GET /api/assets`
- **Auth**: Required (gunakan `authToken`)
- **Query Parameters**:
  - `limit`: Jumlah hasil (default: 50)
  - `sortBy`: Field sorting (default: created_at)
  - `sortOrder`: Asc/desc (default: desc)

### 4. Get Asset Categories

- **Method**: `GET /api/assets/categories`
- **Auth**: Required
- **Purpose**: Validasi nama kategori sebelum import

### 5. Get Asset Sub-Categories

- **Method**: `GET /api/assets/sub-categories`
- **Auth**: Required
- **Purpose**: Validasi nama type/sub-kategori sebelum import

## Usage Steps

### Step 1: Import Excel File

1. Buka request "Import Assets from Excel"
2. Di tab **Body**, klik **Select Files** pada field `file`
3. Pilih file `UPDATE ASET FEB 2026 Rev01.xlsx`
4. Set `debug` ke `1` untuk melihat detail proses
5. Klik **Send**

### Step 2: Check Results

Response akan menampilkan:

```json
{
  "message": "Import selesai. Created: X, Updated: Y, Failed: Z",
  "results": {
    "total": 100,
    "created": 50,
    "updated": 30,
    "failed": 20,
    "errors": [
      {
        "sheet": "Sheet1",
        "row": 10,
        "noAsset": "IT010",
        "error": "Category untuk type \"Unknown Type\" tidak ditemukan."
      }
    ],
    "notFoundCategories": ["Unknown Type"]
  }
}
```

### Step 3: Verify Import

1. Jalankan request "List Imported Assets" dengan auth token
2. Filter berdasarkan tanggal import untuk melihat data baru

## Error Handling

### Common Errors

1. **"File Excel wajib diupload"**: Pastikan file Excel ter-upload
2. **"Nomor Asset wajib diisi"**: Kolom NO.ASSET kosong
3. **"Category untuk type \"X\" tidak ditemukan"**: Type tidak ada di database
4. **"Sheet yang diminta tidak ditemukan"**: Nama sheet salah

### Debug Mode

Set parameter `debug=1` untuk melihat detail log:

- Mapping kolom per row
- Proses pencarian kategori
- Error detail per row

## Tips

1. **Validasi data**: Gunakan endpoint categories/sub-categories untuk validasi TYPE
2. **Test dengan data kecil**: Coba import 5-10 row dulu
3. **Monitor logs**: Cek console backend untuk debug info
4. **Backup data**: Pastikan backup database sebelum import massal

## Server Requirements

- Backend SAMIT harus running di `http://localhost:3000`
- Database SQL Server harus terkoneksi
- Tabel master data (categories, sub-categories) harus ada

## File Locations

- Collection: `postman/import-assets.postman_collection.json`
- Excel file: `be/UPDATE ASET FEB 2026 Rev01.xlsx`
- Controller: `be/controllers/asset/importAssetsController.js`
