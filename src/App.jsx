import { useState } from "react";

// 自分の手持ちゲームのデータ（ローカル）
const myGames = [
  {
    id: 1,
    name: "ラブレター",
    shortDescription: "心理戦が熱い短時間カードゲーム",
    image: "love_letter.jpg",
    apiId: "129622",
  },
  {
    id: 2,
    name: "カタン",
    shortDescription: "資源を集めて開拓する戦略ゲーム",
    image: "catan.jpg",
    apiId: "13",
  },
  {
    id: 3,
    name: "ドミニオン",
    shortDescription: "デッキ構築型カードゲームの名作",
    image: "dominion.jpg",
    apiId: "36218",
  },
];

// APIを使用してゲームの詳細情報を取得
async function fetchGameDetails(apiId) {
  const response = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${apiId}`);
  const text = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "text/xml");
  const item = xml.querySelector("item");

  return {
    description: item.querySelector("description")?.textContent || "説明がありません",
    year: item.querySelector("yearpublished")?.getAttribute("value") || "不明",
    minPlayers: item.querySelector("minplayers")?.getAttribute("value") || "不明",
    maxPlayers: item.querySelector("maxplayers")?.getAttribute("value") || "不明",
  };
}

export default function App() {
  const [selectedGame, setSelectedGame] = useState(null); // 選択したゲーム
  const [details, setDetails] = useState(null); // APIで取得した詳細
  const [loading, setLoading] = useState(false);

  // ゲームを選択したときの処理
  const handleGameClick = async (game) => {
    setSelectedGame(game);
    setLoading(true);
    const gameDetails = await fetchGameDetails(game.apiId);
    setDetails(gameDetails);
    setLoading(false);
  };

  return (
    <>
      <header>
        <h1>手持ちのボードゲーム</h1>
      </header>
      <main>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {myGames.map((game) => (
            <div
              key={game.id}
              onClick={() => handleGameClick(game)}
              style={{
                cursor: "pointer",
                textAlign: "center",
                border: "1px solid #ccc",
                padding: "16px",
                borderRadius: "8px",
                maxWidth: "150px",
              }}
            >
              <img
                src={`/images/${game.image}`}
                alt={game.name}
                style={{ width: "100%" }}
              />
              <h3>{game.name}</h3>
              <p>{game.shortDescription}</p>
            </div>
          ))}
        </div>
      </main>
      {selectedGame && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "20px",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            zIndex: 1000,
          }}
        >
          <h2>{selectedGame.name}</h2>
          {loading ? (
            <p>読み込み中...</p>
          ) : (
            details && (
              <>
                <p>{details.description}</p>
                <p>公開年: {details.year}</p>
                <p>プレイヤー数: {details.minPlayers} - {details.maxPlayers}</p>
                <button
                  onClick={() =>
                    window.open(
                      `https://boardgamegeek.com/boardgame/${selectedGame.apiId}`,
                      "_blank"
                    )
                  }
                >
                  詳細を見る
                </button>
              </>
            )
          )}
          <button onClick={() => setSelectedGame(null)}>閉じる</button>
        </div>
      )}
      {selectedGame && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
          onClick={() => setSelectedGame(null)}
        ></div>
      )}
    </>
  );
}
