import { useCallback, useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import HomePage from "./pages/Home";
import Login from "./pages/Login";

const SONGS_API_URL = "/api/SongBook/songs";
const SAVE_SONG_API_URL = "/api/SongBook/saveSong";
const DELETE_SONG_API_URL = "/api/SongBook/deleteSong";
const DEFAULT_USER_NAME = "Ben Joseph";

const initialSongList = [];

function SongViewerPage({ songList }) {
  const { songId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [stanzaIndex, setStanzaIndex] = useState(0);
  const stateSong = location.state?.song;
  const song = stateSong ?? songList.find((item) => String(item.id) === songId);

  useEffect(() => {
    setStanzaIndex(0);
  }, [songId]);

  useEffect(() => {
    if (!song || !document.fullscreenEnabled) {
      return undefined;
    }

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [song]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!song) {
        return;
      }

      const stanzaCount = song.stanzas.length;
      if (stanzaCount === 0) {
        return;
      }

      if (event.key === "ArrowDown") {
        setStanzaIndex((previous) => (previous + 1) % stanzaCount);
      } else if (event.key === "ArrowUp") {
        setStanzaIndex((previous) => (previous - 1 + stanzaCount) % stanzaCount);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [song]);

  if (!song) {
    return <Navigate to="/" replace />;
  }

  const stanzaCount = song.stanzas.length;
  const goToPreviousStanza = () => {
    if (stanzaCount === 0) {
      return;
    }
    setStanzaIndex((previous) => (previous - 1 + stanzaCount) % stanzaCount);
  };

  const goToNextStanza = () => {
    if (stanzaCount === 0) {
      return;
    }
    setStanzaIndex((previous) => (previous + 1) % stanzaCount);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <section className="song-viewer">
      <button type="button" className="btn-ghost song-close" onClick={handleBack}>
        Back
      </button>
      <p className="song-progress">
        {stanzaIndex + 1} / {song.stanzas.length}
      </p>
      <p className="song-stanza">{song.stanzas[stanzaIndex]}</p>
      <div className="song-controls">
        <button
          type="button"
          className="arrow-btn"
          onClick={goToPreviousStanza}
          aria-label="Previous stanza"
        >
          ↑
        </button>
        <button
          type="button"
          className="arrow-btn"
          onClick={goToNextStanza}
          aria-label="Next stanza"
        >
          ↓
        </button>
      </div>
    </section>
  );
}

function SongListPage({
  songList,
  onSubmitSong,
  onDeleteSong,
  onFetchSongs,
  onSearchTextChange,
  searchText,
  totalPagesFromApi,
}) {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingSongId, setEditingSongId] = useState(null);
  const [songToDelete, setSongToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
  const filterAnchorRef = useRef(null);

  const [draftFilter, setDraftFilter] = useState({
    englishTitle: searchText ?? "",
  });

  const [formData, setFormData] = useState({
    title: "",
    englishTitle: "",
    category: "",
    stanzasText: "",
  });

  const totalPages = Math.max(1, totalPagesFromApi);
  const paginatedSongs = songList;

  useEffect(() => {
    const initialFilter = { englishTitle: "" };
    setDraftFilter(initialFilter);
    setCurrentPage(1);
    onSearchTextChange("");
    onFetchSongs(1, "");
  }, [onFetchSongs, onSearchTextChange]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!isFilterPanelOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (filterAnchorRef.current && !filterAnchorRef.current.contains(event.target)) {
        setFilterPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isFilterPanelOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setDraftFilter((previous) => ({ ...previous, [name]: value }));
  };

  const applyFilter = () => {
    const nextSearchText = draftFilter.englishTitle.trim();
    onSearchTextChange(nextSearchText);
    setCurrentPage(1);
  };

  const resetFilter = () => {
    const initialFilter = { englishTitle: "" };
    setDraftFilter(initialFilter);
    setCurrentPage(1);
    onSearchTextChange("");
  };

  const goToPage = (pageNumber) => {
    const targetPage = Math.max(1, Math.min(totalPages, pageNumber));
    setCurrentPage(targetPage);
    onFetchSongs(targetPage, searchText);
  };

  const maxVisiblePages = 3;
  const visiblePageStart = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const visiblePageEnd = Math.min(totalPages, visiblePageStart + maxVisiblePages - 1);
  const adjustedPageStart = Math.max(1, visiblePageEnd - maxVisiblePages + 1);
  const visiblePages = Array.from(
    { length: visiblePageEnd - adjustedPageStart + 1 },
    (_, index) => adjustedPageStart + index
  );
  const hasHiddenPagesBefore = adjustedPageStart > 1;
  const hasHiddenPagesAfter = visiblePageEnd < totalPages;

  const openAddModal = () => {
    setFormData({ title: "", englishTitle: "", category: "", stanzasText: "" });
    setEditingSongId(null);
    setModalOpen(true);
  };

  const openEditModal = (song) => {
    setFormData({
      title: song.title,
      englishTitle: song.englishTitle,
      category: song.category,
      stanzasText: song.stanzas.join("\n\n"),
    });
    setEditingSongId(song.id);
    setModalOpen(true);
  };

  const closeSongModal = () => {
    setModalOpen(false);
    setEditingSongId(null);
    setFormData({ title: "", englishTitle: "", category: "", stanzasText: "" });
  };

  const submitSong = async (event) => {
    event.preventDefault();
    const trimmedTitle = formData.title.trim();
    const trimmedEnglishTitle = formData.englishTitle.trim();
    const parsedStanzas = formData.stanzasText
      .split(/\n\s*\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!trimmedTitle || !trimmedEnglishTitle || parsedStanzas.length === 0) {
      return;
    }

    const existingSong =
      editingSongId === null ? null : songList.find((song) => song.id === editingSongId);
    const parsedSongId = Number(editingSongId);
    const payload = {
      songId: editingSongId === null ? 0 : Number.isNaN(parsedSongId) ? editingSongId : parsedSongId,
      title: trimmedTitle,
      englishTitle: trimmedEnglishTitle,
      stanzas: parsedStanzas,
      stanzaNos: parsedStanzas.length,
      createdBy: existingSong?.createdBy ?? DEFAULT_USER_NAME,
      updatedBy: DEFAULT_USER_NAME,
    };

    try {
      await onSubmitSong(payload);
      closeSongModal();
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to save song.", error);
    }
  };

  const handlePresentSong = (song) => {
    const stanzas = Array.isArray(song?.stanzas) ? song.stanzas : [];
    if (stanzas.length === 0) {
      alert("This song has no valid stanzas to present.");
      return;
    }

    navigate(`/songs/${song.id}`, { state: { song } });
  };

  return (
    <section className="page">
      <div className="panel asset-header">
        <div>
          <p className="eyebrow">Song Inventory</p>
          <h1>Your Songs</h1>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          Add New Song
        </button>
      </div>

      <div className="panel table-panel">
        <div className="table-tools">
          <div className="filter-anchor" ref={filterAnchorRef}>
            <button
              type="button"
              className="btn-ghost filter-toggle"
              onClick={() => setFilterPanelOpen((open) => !open)}
              aria-expanded={isFilterPanelOpen}
              aria-controls="songFilterPanel"
            >
              Filter
            </button>

            {isFilterPanelOpen ? (
              <form
                id="songFilterPanel"
                className="filter-popover"
                onSubmit={(event) => event.preventDefault()}
              >
                <label htmlFor="filterEnglishTitle">English Title</label>
                <input
                  id="filterEnglishTitle"
                  name="englishTitle"
                  type="text"
                  value={draftFilter.englishTitle}
                  onChange={handleFilterChange}
                  placeholder="Search by English title"
                />

                <div className="filter-actions">
                  <button type="button" className="btn-primary" onClick={applyFilter}>
                    Apply
                  </button>
                  <button type="button" className="btn-ghost" onClick={resetFilter}>
                    Reset
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>

        <div className="asset-table">
          <div className="table-head">
            <span>Title</span>
            <span>English Title</span>
            <span>Stanza Nos</span>
            <span>Action</span>
          </div>
          {paginatedSongs.map((song) => (
            <div className="table-row" key={song.id}>
              <span>{song.title}</span>
              <span>{song.englishTitle}</span>
              <strong>{song.stanzaNos ?? song.stanzas.length}</strong>
              <div className="action-group">
                <button
                  type="button"
                  className="btn-primary action-btn"
                  onClick={() => handlePresentSong(song)}
                >
                  Present
                </button>
                <div className="action-row">
                  <button
                    type="button"
                    className="btn-ghost action-btn"
                    onClick={() => openEditModal(song)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-danger action-btn"
                    onClick={() => setSongToDelete(song)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {paginatedSongs.length === 0 ? (
            <div className="table-empty">No songs match the current filters.</div>
          ) : null}
        </div>

        <div className="pagination">
          <button
            type="button"
            className="btn-ghost page-btn"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
          >
            First
          </button>
          <button
            type="button"
            className="btn-ghost page-btn"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className="page-numbers">
            {hasHiddenPagesBefore ? <span className="page-ellipsis">…</span> : null}
            {visiblePages.map((pageNumber) => (
              <button
                type="button"
                key={pageNumber}
                className={`page-number ${currentPage === pageNumber ? "active" : ""}`}
                onClick={() => goToPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            {hasHiddenPagesAfter ? <span className="page-ellipsis">…</span> : null}
          </div>
          <button
            type="button"
            className="btn-ghost page-btn"
            onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
          <button
            type="button"
            className="btn-ghost page-btn"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </button>
        </div>
      </div>

      {isModalOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal" onSubmit={submitSong}>
            <h2>{editingSongId === null ? "Add New Song" : "Edit Song"}</h2>

            <label htmlFor="title">Song Name</label>
            <input
              id="title"
              name="title"
              placeholder="e.g. Amazing Grace"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <label htmlFor="englishTitle">English Title</label>
            <input
              id="englishTitle"
              name="englishTitle"
              placeholder="e.g. Amazing Grace"
              value={formData.englishTitle}
              onChange={handleChange}
              required
            />

            <label htmlFor="stanzasText">Stanzas</label>
            <textarea
              id="stanzasText"
              name="stanzasText"
              placeholder="Enter stanzas. Keep a blank line between stanzas."
              value={formData.stanzasText}
              onChange={handleChange}
              rows={8}
              required
            />

            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={closeSongModal}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingSongId === null ? "Save Song" : "Update Song"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {songToDelete ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h2>Delete Song</h2>
            <p>
              Are you sure you want to delete <strong>{songToDelete.title}</strong>?
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={() => setSongToDelete(null)}>
                No
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={async () => {
                  await onDeleteSong(songToDelete.id);
                  setSongToDelete(null);
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function AppLayout({
  isNavOpen,
  setNavOpen,
  isNavCollapsed,
  setNavCollapsed,
  onSongsModuleClick,
  isLoading,
}) {
  const location = useLocation();

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname, setNavOpen]);

  return (
    <div className={`app-shell ${isNavCollapsed ? "collapsed" : ""}`}>
      <button type="button" className="menu-button" onClick={() => setNavOpen((open) => !open)}>
        {isNavOpen ? "Close" : "Menu"}
      </button>
      {isNavOpen ? (
        <button type="button" className="nav-backdrop" onClick={() => setNavOpen(false)} />
      ) : null}
      <aside className={`side-nav ${isNavOpen ? "open" : ""} ${isNavCollapsed ? "collapsed" : ""}`}>
        <div className="side-nav-header">
          {!isNavCollapsed ? <h2>Song Book</h2> : null}
          <button
            type="button"
            className="collapse-button"
            onClick={() => setNavCollapsed((collapsed) => !collapsed)}
            aria-label={isNavCollapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {isNavCollapsed ? "\u2630" : "\u2715"}
          </button>
        </div>
        {!isNavCollapsed ? (
          <nav>
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={onSongsModuleClick}
            >
              Home
            </NavLink>
            <NavLink
              to="/songList"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={onSongsModuleClick}
            >
              Song List
            </NavLink>
          </nav>
        ) : null}
      </aside>
      <main className="content">
        <Outlet />
      </main>
      {isLoading ? (
        <div className="app-loader" role="status" aria-live="polite" aria-label="Loading">
          <div className="spinner" />
        </div>
      ) : null}
    </div>
  );
}

function AppContainer() {
  const navigate = useNavigate();
  const [isNavOpen, setNavOpen] = useState(false);
  const [isNavCollapsed, setNavCollapsed] = useState(false);
  const [songList, setSongList] = useState(initialSongList);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSearchText, setCurrentSearchText] = useState("");
  const [pendingRequests, setPendingRequests] = useState(0);

  const startRequest = useCallback(() => {
    setPendingRequests((count) => count + 1);
  }, []);

  const endRequest = useCallback(() => {
    setPendingRequests((count) => Math.max(0, count - 1));
  }, []);

  const fetchSongs = useCallback(async (pageNo = 1, searchText = "") => {
    startRequest();
    try {
      const params = new URLSearchParams({
        pageNo: String(pageNo),
        searchText,
      });
      const loginToken = localStorage.getItem("loginToken");
      const response = await fetch(`${SONGS_API_URL}?${params.toString()}`, {
        headers: loginToken ? { Authorization: `Bearer ${loginToken}` } : undefined,
      });
      if (response.status === 401) {
        // setSongList([]);
        // setTotalPages(1);
        navigate("/login", { replace: true });
        return;
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch songs. Status: ${response.status}`);
      }

      const data = await response.json();
      const songs = Array.isArray(data?.songs) ? data.songs : Array.isArray(data) ? data : [];
      const totalPagesRaw = Number(data?.totalPages ?? data?.TotalPages);
      const mappedTotalPages =
        Number.isNaN(totalPagesRaw) || totalPagesRaw < 1 ? 1 : Math.floor(totalPagesRaw);

      const mappedSongs = songs.map((song) => {
          const songId = song.songId ?? song.SongId;
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
      setTotalPages(mappedTotalPages);
    } catch (error) {
      console.error("Failed to fetch songs from API.", error);
      setSongList([]);
      setTotalPages(1);
    } finally {
      endRequest();
    }
  }, [endRequest, navigate, startRequest]);

  useEffect(() => {
    fetchSongs(1, currentSearchText);
  }, [fetchSongs, currentSearchText]);

  const saveSong = async (payload) => {
    startRequest();
    const loginToken = localStorage.getItem("loginToken");
    const response = await fetch(SAVE_SONG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(loginToken ? { Authorization: `Bearer ${loginToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      endRequest();
      throw new Error(`Failed to save song. Status: ${response.status}`);
    }

    await fetchSongs(1, currentSearchText);
    endRequest();
  };

  const deleteSong = async (songId) => {
    startRequest();
    const loginToken = localStorage.getItem("loginToken");
    const response = await fetch(`${DELETE_SONG_API_URL}?songId=${encodeURIComponent(songId)}`, {
      method: "DELETE",
      headers: loginToken ? { Authorization: `Bearer ${loginToken}` } : undefined,
    });
    if (!response.ok) {
      endRequest();
      throw new Error(`Failed to delete song. Status: ${response.status}`);
    }

    await fetchSongs(1, currentSearchText);
    endRequest();
  };

  return (
    <Routes>
      <Route path="/songs/:songId" element={<SongViewerPage songList={songList} />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <AppLayout
            isNavOpen={isNavOpen}
            setNavOpen={setNavOpen}
            isNavCollapsed={isNavCollapsed}
            setNavCollapsed={setNavCollapsed}
            onSongsModuleClick={() => fetchSongs(1, currentSearchText)}
            isLoading={pendingRequests > 0}
          />
        }
      >
        <Route index element={<HomePage />} />
        <Route path="home" element={<HomePage />} />
        <Route
          path="songList"
          element={
            <SongListPage
              songList={songList}
              onSubmitSong={saveSong}
              onDeleteSong={deleteSong}
              onFetchSongs={fetchSongs}
              onSearchTextChange={setCurrentSearchText}
              searchText={currentSearchText}
              totalPagesFromApi={totalPages}
            />
          }
        />
        <Route path="assets" element={<Navigate to="/songList" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContainer />
    </BrowserRouter>
  );
}

