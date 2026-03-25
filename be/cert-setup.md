# SSL Certificate Setup for SAMIT Backend

## Certificate Status: ✅ Generated
- Private Key: `./cert/private.key`
- Certificate: `./cert/certificate.cer`

## Browser "Invalid Certificate" Solution

### Option 1: Trust Certificate (Recommended)
1. **Buka browser dan akses:** https://localhost:5002
2. **Klik "Advanced"** atau "Proceed anyway"**
3. **Klik "Proceed to localhost (unsafe)"**
4. Browser akan mengingat trusted certificate

### Option 2: Import Certificate to System
1. **Buka certificate.cer** (double-click)
2. **Install Certificate**
3. **Current User** → **Trusted Root Certification Authorities**
4. **Yes** untuk semua konfirmasi
5. **Restart browser**

### Option 3: Use HTTP for Development
Edit `.env`:
```env
USE_SSL=false
```
Restart server dengan `npm start`

### Option 4: Use Postman (No SSL Issues)
Postman tidak masalah dengan self-signed certificate:
- URL: `https://localhost:5002/api/assets/import-excel`
- Disable SSL verification di Postman settings jika perlu

## Testing Import
1. Start server: `npm start`
2. Test di Postman: `POST https://localhost:5002/api/assets/import-excel`
3. Upload file: `UPDATE ASET FEB 2026 Rev01.xlsx`
4. Set debug=1 untuk detail log

## Server Status Check
```bash
curl -k https://localhost:5002/api/users/login
# -k flag allows insecure connections
```

Certificate valid untuk development, browser hanya warning karena self-signed.
