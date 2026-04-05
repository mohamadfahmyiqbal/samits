-- Create webPushSubscriptions table for SQL Server
CREATE TABLE [dbo].[webPushSubscriptions] (
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [endpointHash] NVARCHAR(64) NOT NULL UNIQUE,
    [endpoint] NVARCHAR(MAX) NOT NULL,
    [p256dh] NVARCHAR(MAX) NULL,
    [auth] NVARCHAR(MAX) NULL,
    [contentEncoding] NVARCHAR(50) NULL,
    [userNik] NVARCHAR(20) NULL,
    [userId] NVARCHAR(100) NULL,
    [userPosition] NVARCHAR(100) NULL,
    [rawSubscription] NVARCHAR(MAX) NOT NULL,
    [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [updatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Optional: Create index on endpointHash for performance
CREATE INDEX [IX_webPushSubscriptions_endpointHash] ON [dbo].[webPushSubscriptions] ([endpointHash]);