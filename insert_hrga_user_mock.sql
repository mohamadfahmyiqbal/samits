-- Insert mock data ke tabel user (HRGA User)
-- Hanya NIK, NAMA, DEPT, DIVISI yang diinsert (sesuai struktur HRGA)

INSERT INTO [users] (NIK, NAMA, DEPT, DIVISI) VALUES
('2304024', 'MOHAMAD FAHMY IQBAL', 'IT', 'System Development'),
('1008001', 'ERMA PURNAMA WIDA PANE', 'HR', 'Recruitment'),
('1803070', 'MOHAMAD FAHMY IQBAL', 'IT', 'Infrastructure'),
('123456', 'Test User', 'IT', 'Testing'),
('1205001', 'AYUNG YUANSAH', 'Finance', 'Accounting'),
('1102003', 'BUDI SANTOSO', 'IT', 'Network'),
('1506002', 'SITI RAHAYU', 'HR', 'Payroll'),
('1708005', 'AGUS WIDODO', 'Finance', 'Treasury'),
('1403004', 'RINA SUSANTI', 'Marketing', 'Digital'),
('1607006', 'DEDI KURNIAWAN', 'Operations', 'Warehouse'),
('1304007', 'ANI SETYAWATI', 'IT', 'Support'),
('1909008', 'YUSUF MANSUR', 'Sales', 'Regional'),
('2001010', 'MAWAR SARI', 'HR', 'Training'),
('2102011', 'BAMBANG IRAWAN', 'Finance', 'Audit'),
('2203012', 'LISA NURYANTI', 'Marketing', 'Brand'),
('2304013', 'TONI SUPRIYANTO', 'IT', 'Security'),
('2405014', 'DEWI KARTIKA', 'Operations', 'Logistics'),
('2506015', 'RUDI HARTONO', 'Sales', 'Corporate'),
('2607016', 'SARAH AMELIA', 'HR', 'GA'),
('2708017', 'FAHRI ALI', 'Finance', 'Tax');
GO

-- Verifikasi data
SELECT * FROM [users] ORDER BY NAMA;
GO
