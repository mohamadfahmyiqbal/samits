IF NOT EXISTS (
    SELECT 1
    FROM sys.objects
    WHERE object_id = OBJECT_ID(N'[dbo].[asset_documents]')
      AND type = N'U'
)
BEGIN
    CREATE TABLE [dbo].[asset_documents] (
        [document_id] [int] IDENTITY(1,1) NOT NULL,
        [it_item_id] [uniqueidentifier] NOT NULL,
        [asset_no] [varchar](50) NULL,
        [original_name] [varchar](255) NOT NULL,
        [stored_name] [varchar](255) NOT NULL,
        [mime_type] [varchar](100) NOT NULL,
        [file_size] [bigint] NULL,
        [file_path] [varchar](500) NOT NULL,
        [uploaded_by_nik] [varchar](30) NULL,
        [uploaded_by_name] [varchar](200) NULL,
        [uploaded_at] [datetime] NOT NULL CONSTRAINT [DF_asset_documents_uploaded_at] DEFAULT (GETDATE()),
        CONSTRAINT [PK_asset_documents] PRIMARY KEY CLUSTERED ([document_id] ASC)
    );

    CREATE NONCLUSTERED INDEX [IX_asset_documents_it_item_id]
        ON [dbo].[asset_documents]([it_item_id]);

    CREATE NONCLUSTERED INDEX [IX_asset_documents_asset_no]
        ON [dbo].[asset_documents]([asset_no]);
END
