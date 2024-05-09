export default async function handler(req: any, res: any) {
  try {
    const response = await fetch("https://price.renec.foundation/api/quotes");
    const data = await response.json();
    res.status(200).json({ ...data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data." });
  }
}
