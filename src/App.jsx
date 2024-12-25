import { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import "./styles.css"; // 外部CSSをインポート
import myGames from "./data.json";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyB6jJA0Vfr_6vaDuXDxg4ga8Y6x_R_chuo",
  authDomain: "data-adb47.firebaseapp.com",
  projectId: "data-adb47",
  storageBucket: "data-adb47.firebasestorage.app",
  messagingSenderId: "48373849823",
  appId: "1:48373849823:web:3577093381a748ffeed36a",
  measurementId: "G-Q2W48CB4H7",
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedGame) {
      const q = query(
        collection(db, "gameRatings"),
        where("gameId", "==", selectedGame.id)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newRatings = snapshot.docs.map((doc) => doc.data());
        setRatings(newRatings);
      });
      return () => unsubscribe();
    }
  }, [selectedGame]);

  const calculateAverageRating = () => {
    if (ratings.length === 0) return 0;
    const total = ratings.reduce((sum, entry) => sum + entry.rating, 0);
    return (total / ratings.length).toFixed(1);
  };

  const handleSaveRating = async () => {
    if (!selectedGame || rating === 0 || review === "") {
      alert("評価と感想を入力してください！");
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "gameRatings"), {
        gameId: selectedGame.id,
        gameName: selectedGame.name,
        rating,
        review,
        timestamp: new Date(),
      });
      alert("評価が保存されました！");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("評価の保存に失敗しました");
    } finally {
      setLoading(false);
      setRating(0);
      setReview("");
    }
  };

  const handleGameClick = (game) => {
    setSelectedGame(game);
    setRatings([]);
  };

  const renderStars = (value) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={() => setRating(i)}
          className="stars"
          style={{ color: i <= value ? "gold" : "lightgray" }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <>
      <header>
        <h1>手持ちのボードゲーム</h1>
      </header>
      <main>
        <div className="game-list">
          {myGames.map((game) => (
            <div
              key={game.id}
              onClick={() => handleGameClick(game)}
              className="game-card"
            >
              {/* 修正した部分 */}
              <img src={game.image} alt={game.name} />
              <h3>{game.name}</h3>
              <p>{game.shortDescription}</p>
            </div>
          ))}
        </div>
      </main>

      {selectedGame && (
        <div className="popup">
          <h2>{selectedGame.name}</h2>
          <p>{selectedGame.description}</p>
          <p>平均評価:</p>
          <div style={{ display: "flex", alignItems: "center" }}>
            {renderStars(Math.round(calculateAverageRating()))}
            <span style={{ marginLeft: "10px", fontSize: "1rem", color: "#555" }}>
              ({calculateAverageRating()})
            </span>
          </div>
          <p>あなたの評価を選択してください:</p>
          <div style={{ marginBottom: "10px" }}>{renderStars(rating)}</div>
          <textarea
            placeholder="感想を入力してください"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="textarea"
          ></textarea>
          <button onClick={handleSaveRating} disabled={loading}>
            {loading ? "保存中..." : "評価を保存"}
          </button>
          <button onClick={() => setSelectedGame(null)}>閉じる</button>
          <h3>他のプレイヤーの評価:</h3>
          <ul className="reviews">
            {ratings.map((entry, index) => (
              <li key={index}>
                <p>評価: {entry.rating}★</p>
                <p>感想: {entry.review}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
