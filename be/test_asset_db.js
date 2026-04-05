import { initializeDB, db } from "./models/index.js";

async function testAssetDB() {
  try {
    await initializeDB();
    const ITItem = db.ITItem;

    console.log("Testing ITItem model...");
    const count = await ITItem.count();
    console.log("ITItem count:", count);

    const items = await ITItem.findAll({ limit: 5 });
    console.log(
      "Sample items:",
      items.map((i) => ({
        id: i.it_item_id,
        status: i.current_status,
        category_id: i.category_id,
      })),
    );

    process.exit(0);
  } catch (error) {
    console.error("Database error:", error.message);
    process.exit(1);
  }
}

testAssetDB();
