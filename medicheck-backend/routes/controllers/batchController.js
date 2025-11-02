import Batch from "./models/Batch.js";
// GET all batches
export const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find().lean(); // lean() gives plain JS objects

    // ✅ Add safe defaults so nothing is undefined in the frontend
    const cleaned = batches.map(b => ({
      ...b,
      batchNo: b.batchNo || "",
      name: b.name || "",
      manufacturer: b.manufacturer || "Unknown Manufacturer",
      pharmacy: b.pharmacy || "Unassigned",
      expiry: b.expiry || "",
      formulation: b.formulation || "",
      quantity: b.quantity || 0,
      status: b.status || "active",
      blockchainVerified: b.blockchainVerified ?? false,
    }));

    res.json(cleaned);
  } catch (error) {
    console.error("❌ Error fetching batches:", error);
    res.status(500).json({ error: "Failed to fetch batches" });
  }
};



//MAIN
// export const getBatches = async (req, res) => {
//   try {
//     const batches = await Batch.find();
//     res.json(batches);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch batches" });
//   }
// };

// ADD new batch main code
// export const addBatch = async (req, res) => {
//   try {
//     const { id, name, expiry, stock, supplier } = req.body;
//     const newBatch = new Batch({ id, name, expiry, stock, supplier });
//     await newBatch.save();
//     res.status(201).json({ message: "Batch added successfully", newBatch });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to add batch" });
//   }
// };




export const addBatch = async (req, res) => {
  try {
    const newBatch = new Batch(req.body);
    await newBatch.save();
    res.status(201).json({ message: "Batch added successfully", newBatch });
  } catch (error) {
    res.status(500).json({ error: "Failed to add batch" });
  }
};

// UPDATE batch
export const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Batch.findOneAndUpdate({ id }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Batch not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update batch" });
  }
};

// DELETE batch
export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Batch.findOneAndDelete({ id });
    if (!deleted) return res.status(404).json({ message: "Batch not found" });
    res.json({ message: "Batch deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete batch" });
  }
};

//OPTIONAL
export const acceptBatch = async (req, res) => {
  try {
    const { batchNo } = req.params;
    const updated = await Batch.findOneAndUpdate(
      { batchNo },
      { status: "Accepted" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Batch not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update batch status" });
  }
};

// import Batch from "./models/Batch.js";

// // GET all batches
// export const getBatches = async (req, res) => {
//   try {
//     const batches = await Batch.find();
//     res.json(batches);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch batches" });
//   }
// };

// // ADD a new batch
// export const addBatch = async (req, res) => {
//   try {
//     const newBatch = new Batch(req.body);
//     await newBatch.save();
//     res.json({ message: "Batch added successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to add batch" });
//   }
// };



//LATEST
// export const addBatch = async (req, res) => {
//   try {
//     const newBatch = new Batch(req.body);
//     await newBatch.save();
//     res.status(201).json({ message: "Batch added successfully", newBatch });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to add batch" });
//   }
// };