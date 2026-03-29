flowchart LR

START --> Login --> DashboardAsset --> ListAset

DashboardAsset -->|Menu| DashboardUser
DashboardAsset -->|Menu| DashboardMaintenance

%% USER FLOW
DashboardUser --> AbnormalReport --> JobRequest --> SelfAnalysis
SelfAnalysis -->|Not Solved| TicketCreated
SelfAnalysis -->|Solved| Finish

DashboardUser --> Aset --> AssetBaru --> FormPengajuanAset --> Approval --> RequestCreated
Aset --> PergantianPengguna --> FormPersonalID --> Approval

%% REQUEST ASSET FLOW
ListAset --> New --> ReqAset --> PV --> Approval2 --> PO --> Delivery --> Distribusi --> DB
Delivery --> Invoice --> Finance --> DB

%% UPDATE / DISPOSE FLOW
ListAset --> Update --> DataPengguna --> DB
ListAset --> Dispose --> ListDepresiasi --> Finance2 --> BeritaAcara --> UserApproval --> FinanceApproval --> PDApproval --> DB

%% MAINTENANCE FLOW
ListAset --> Maintenance --> Schedule --> PilihCategory --> PilihSchedule --> MaintenanceSchedule --> Maintenance2 --> Result --> Approval3 --> DB
Result --> Corrective

%% STOCK CONTROL
DashboardMaintenance --> StockControl --> PartCategory --> StockList
StockList --> MinimumStock --> AddStock --> DB
StockList -->|Auto Reduce| Maintenance2

%% ABNORMALITY FLOW
DashboardMaintenance --> Abnormality --> JobRequest2 --> CorrectiveAction --> Result2 --> Approval4 --> DB
