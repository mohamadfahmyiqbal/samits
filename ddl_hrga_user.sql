-- DDL untuk membuat tabel users (HRGA User)
-- Database: SQL Server

CREATE TABLE [users] (
    NIK VARCHAR(20) NOT NULL,
    NAMA VARCHAR(100) NULL,
    DEPT VARCHAR(100) NULL,
    DIVISI VARCHAR(100) NULL,
    CONSTRAINT PK_users PRIMARY KEY (NIK)
);
GO

-- Index untuk pencarian cepat
CREATE INDEX IX_users_NAMA ON [users](NAMA);
CREATE INDEX IX_users_DEPT ON [users](DEPT);
GO

-- Comment/Description (opsional)
EXEC sys.sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Data karyawan dari HRGA', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'users';
GO
