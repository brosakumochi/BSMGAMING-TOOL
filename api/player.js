
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      error: "GETリクエストのみ対応しています"
    });
  }

  const apiKey = process.env.BRAWL_STARS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "APIキーがサーバーに設定されていません"
    });
  }

  let tag = String(req.query.tag || "")
    .trim()
    .replace(/^#/, "")
    .toUpperCase();

  if (!tag || !/^[0289PYLQGRJCUV]+$/.test(tag)) {
    return res.status(400).json({
      error: "プレイヤータグを確認してください"
    });
  }

  try {
    const response = await fetch(
      `https://api.brawlstars.com/v1/players/%23${encodeURIComponent(tag)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json"
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Brawl Stars APIから情報を取得できませんでした",
        reason: data.message || data.reason || "APIエラー"
      });
    }

    return res.status(200).json({
      name: data.name,
      tag: data.tag,
      trophies: data.trophies,
      highestTrophies: data.highestTrophies,
      expLevel: data.expLevel,
      expPoints: data.expPoints,
      victories: data.victories,
      threeVsThreeVictories: data["3vs3Victories"],
      soloVictories: data.soloVictories,
      duoVictories: data.duoVictories,
      club: data.club?.name || null
    });
  } catch (error) {
    return res.status(502).json({
      error: "APIへの接続に失敗しました"
    });
  }
};
