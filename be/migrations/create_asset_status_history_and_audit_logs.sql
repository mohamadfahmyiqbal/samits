-- Migration: Create asset_status_history and asset_audit_logs tables
-- Run this SQL to create the required tables

-- Table: asset_status_history
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[asset_status_history]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[asset_status_history](
        [history_id] [bigint] IDENTITY(1,1) NOT NULL,
        [it_item_id] [uniqueidentifier] NOT NULL,
        [old_status] [varchar](50) NULL,
        [new_status] [varchar](50) NOT NULL,
        [changed_by_nik] [varchar](30) NULL,
        [changed_by_name] [varchar](100) NULL,
        [changed_at] [datetime2](3) NOT NULL DEFAULT GETDATE(),
        [reason] [nvarchar](500) NULL,
        [notes] [nvarchar](max) NULL,
        CONSTRAINT [PK_asset_status_history] PRIMARY KEY CLUSTERED ([history_id] ASC)
    );
    
    CREATE NONCLUSTERED INDEX [IX_asset_status_history_it_item_id] ON [dbo].[asset_status_history]([it_item_id]);
    CREATE NONCLUSTERED INDEX [IX_asset_status_history_changed_at] ON [dbo].[asset_status_history]([changed_at]);
END;
GO

-- Table: asset_audit_logs
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[asset_audit_logs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[asset_audit_logs](
        [audit_id] [bigint] IDENTITY(1,1) NOT NULL,
        [it_item_id] [uniqueidentifier] NULL,
        [asset_no] [varchar](50) NULL,
        [event_type] [varchar](20) NOT NULL,
        [actor_nik] [varchar](30) NULL,
        [actor_name] [varchar](100) NULL,
        [source_module] [varchar](50) NULL,
        [request_id] [varchar](100) NULL,
        [before_data] [nvarchar](max) NULL,
        [after_data] [nvarchar](max) NULL,
        [event_at] [datetime2](3) NOT NULL DEFAULT GETDATE(),
        [client_ip] [varchar](50) NULL,
        [user_agent] [nvarchar](300) NULL,
        CONSTRAINT [PK_asset_audit_logs] PRIMARY KEY CLUSTERED ([audit_id] ASC)
    );
    
    CREATE NONCLUSTERED INDEX [IX_asset_audit_logs_it_item_id] ON [dbo].[asset_audit_logs]([it_item_id]);
    CREATE NONCLUSTERED INDEX [IX_asset_audit_logs_asset_no] ON [dbo].[asset_audit_logs]([asset_no]);
    CREATE NONCLUSTERED INDEX [IX_asset_audit_logs_event_type] ON [dbo].[asset_audit_logs]([event_type]);
    CREATE NONCLUSTERED INDEX [IX_asset_audit_logs_event_at] ON [dbo].[asset_audit_logs]([event_at]);
    CREATE NONCLUSTERED INDEX [IX_asset_audit_logs_actor_nik] ON [dbo].[asset_audit_logs]([actor_nik]);
END;
GO

PRINT 'Migration completed: asset_status_history and asset_audit_logs tables created successfully.';

