import { connectToDB } from "../mongo.js";

export default async function handler(req, res) {
  const { db } = await connectToDB();
  const collection = db.collection("appconfig");

  // =============================
  // GET - obtener configuración
  // =============================
  if (req.method === "GET") {
    let config = await collection.findOne({ configId: "global_theme" });

    if (!config) {
      config = {
        configId: "global_theme",
        activeTheme: "",
        activeCampaign: "default",
        isAutomatic: false,
        lastUpdated: new Date(),
      };
      await collection.insertOne(config);
    }

    return res.status(200).json(config);
  }

  // =============================
  // POST - guardar configuración
  // =============================
  if (req.method === "POST") {
    let body = "";

    // Leer el body MANUALMENTE (obligatorio en Vercel Serverless)
    await new Promise((resolve) => {
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", resolve);
    });

    try {
      body = JSON.parse(body);
    } catch (error) {
      console.error("JSON inválido:", error);
      return res.status(400).json({ error: "Invalid JSON" });
    }

    const { theme, campaign, isAutomatic } = body;

    const updateData = {
      lastUpdated: new Date(),
    };

    if (theme !== undefined) updateData.activeTheme = theme;
    if (campaign !== undefined) updateData.activeCampaign = campaign;
    if (isAutomatic !== undefined) updateData.isAutomatic = isAutomatic;

    const updated = await collection.findOneAndUpdate(
      { configId: "global_theme" },
      { $set: updateData },
      { returnDocument: "after", upsert: true }
    );

    return res.status(200).json(updated.value);
  }

  return res.status(405).json({ error: "Método no permitido" });
}

