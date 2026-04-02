-- Tambahkan kolom yang dibutuhkan Add Stock UI
IF NOT EXISTS (SELECT * FROM sys.columns 
               WHERE object_id = OBJECT_ID(N'dbo.parts') AND name = 'status')
BEGIN
    ALTER TABLE dbo.parts ADD status varchar(50) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns 
               WHERE object_id = OBJECT_ID(N'dbo.parts') AND name = 'purchase_period')
BEGIN
    ALTER TABLE dbo.parts ADD purchase_period varchar(20) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns 
               WHERE object_id = OBJECT_ID(N'dbo.parts') AND name = 'part_code')
BEGIN
    ALTER TABLE dbo.parts ADD part_code varchar(100) NULL;
END
