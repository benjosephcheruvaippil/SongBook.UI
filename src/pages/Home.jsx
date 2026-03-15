import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const [songList, setSongList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const fetchSongs = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch("/api/SongBook/homPageSongs", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
        navigate("/login", { replace: true });
        return;
        }
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (isActive) {
          const rawSongs = Array.isArray(data) ? data : data?.songs ?? [];
          const mappedSongs = rawSongs.map((song) => {
            const songId = song.songId ?? song.SongId ?? song.id;
            const title = song.title ?? song.Title ?? "";
            const englishTitle = song.englishTitle ?? song.EnglishTitle ?? "";
            const category = song.category ?? song.Category ?? "";
            const stanzas = Array.isArray(song.stanzas)
              ? song.stanzas
              : Array.isArray(song.Stanzas)
                ? song.Stanzas
                : [];
            const stanzaNosRaw = song.stanzaNos ?? song.StanzaNos;
            const stanzaNos = Number(stanzaNosRaw);

            return {
              id: String(songId),
              title,
              englishTitle,
              category,
              stanzaNos: Number.isNaN(stanzaNos) ? stanzas.length : stanzaNos,
              stanzas,
              createdBy: song.createdBy ?? song.CreatedBy ?? "",
              updatedBy: song.updatedBy ?? song.UpdatedBy ?? "",
            };
          });

          setSongList(mappedSongs);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage("Unable to load songs. Please try again.");
          setSongList([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchSongs();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="page">
      <div className="panel hero">
        <div>
          <p className="eyebrow">Song Collection</p>
          <h1>Latest Updated</h1>
          <p className="muted">Click a song card to open full-screen stanza mode.</p>
        </div>
      </div>
      {isLoading && <p className="muted">Loading songs...</p>}
      {errorMessage && <p className="muted">{errorMessage}</p>}
      <div className="song-grid">
        {songList.map((song) => (
          <button
            key={song.id}
            type="button"
            className="song-card"
            onClick={() => navigate(`/songs/${song.id}`, { state: { song } })}
          >
            <span className="song-card-label">Song</span>
            <strong>{song.title}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
