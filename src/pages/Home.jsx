import { useNavigate } from "react-router-dom";

export default function HomePage({ songList }) {
  const navigate = useNavigate();

  return (
    <section className="page">
      <div className="panel hero">
        <div>
          <p className="eyebrow">Song Collection</p>
          <h1>Favs</h1>
          <p className="muted">Click a song card to open full-screen stanza mode.</p>
        </div>
      </div>
      <div className="song-grid">
        {songList.map((song) => (
          <button
            key={song.id}
            type="button"
            className="song-card"
            onClick={() => navigate(`/songs/${song.id}`)}
          >
            <span className="song-card-label">Song</span>
            <strong>{song.title}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
