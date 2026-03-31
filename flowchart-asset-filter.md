# AssetManagement Filter Flowchart

```mermaid
graph TD
    A[User klik AssetManagement] --> B[PrimaryTabs mainTypes CLIENT/Hardware]
    B --> C{Active CLIENT?}
    C -->|Yes| D[MainTabs CLIENT]
    C -->|No| E[All Assets]
    D --> F[SubTabs All/Hardware]
    F --> G{User klik Hardware}
    G -->|All| H[onSubTabChange 'Hardware' All<br/>pass category_id/sub_category_id]
    G -->|Hardware specific| I[onSubTabChange sub_category_id]
    H --> J[Context filtered update]
    J --> K[AssetTable data prop = filtered]
    K --> L{Data.length == 0?}
    L -->|Ya| Issue[Hardware All kosong]
    L -->|No| OK[Show data]

    style Issue fill:#ffcccc
    style OK fill:#ccffcc
```
    
## Root Cause Candidates:
1. tabMeta.CLIENT.sub_category_ids.Hardware = null → filter kosong
2. useAssetPage local filter tidak match data
3. Backend /assets API return empty untuk params itu

