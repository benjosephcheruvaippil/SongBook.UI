import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

const starterAssets = [
  { id: 1, name: "Fixed Deposit", category: "Debt", value: 250000 },
  { id: 2, name: "Mutual Funds", category: "Equity", value: 420000 },
  { id: 3, name: "Non Convertible Debentures", category: "Debt", value: 110000 },
  { id: 4, name: "Gold", category: "Commodity", value: 185000 },
  { id: 5, name: "Real Estate", category: "Property", value: 585000 },
];

const PAGE_SIZE = 5;
const songs = [
  {
    id: "song-of-hope",
    title: "എൻപേർക്കായ് ജീവൻ വയ്ക്കും",
    stanzas: [
      "എൻപേർക്കായ് ജീവൻ വയ്ക്കും പ്രഭോ! നിന്നെ-എന്നുമീ ദാസനോർക്കും",
      "നിൻ കൃപയേറിയ വാക്കിൻ പ്രകാരമിങ്ങത്യന്ത താഴ്മയോടെ എന്റെവൻകടം തീർപ്പാൻ മരിക്കും പ്രഭോ! നിന്നെ എന്നുമീ ദാസനോർക്കും",
      "എന്നുടെ പേർക്കായ് നുറുങ്ങിയ നിന്നുടൽ സ്വർഭോജ്യമത്രേ മമ നിന്റെ പൊന്നുനിയമത്തിൻ പാത്രമെടുത്തിപ്പോൾ നിന്നെ ഞാനോർക്കുന്നിതാ",
      "ഗത്സമനേയിടം ഞാൻ മറന്നിടുമോ നിൻവ്യഥയൊക്കെയെയും നിന്റെ സങ്കടം രക്തവിയർപ്പെന്നിവയൊരു നാളും മറക്കുമോ ഞാൻ"
    ],
  },
  {
    id: "river-road",
    title: "River Road",
    stanzas: [
      "Down the river road we roam,\nClouds above and dust below.\nEvery mile feels close to home,\nWhere old familiar breezes blow.",
      "Lantern skies and silver rain,\nStories shared beside the fire.\nThough we lose and love again,\nStill we walk and never tire.",
      "If the night becomes too wide,\nHold this song and hear it clear.\nStep by step and side by side,\nMorning always meets us here.",
    ],
  },
  {
    id: "new-day",
    title: "New Day",
    stanzas: [
      "Open windows, call the sun,\nToday begins, the race is run.\nLeave behind what weighs you down,\nLift your eyes above the town.",
      "Plant a word, a dream, a seed,\nGive your hands to those in need.\nSmall and steady, bright and true,\nA better world begins with you.",
      "When the evening paints the sky,\nCount the wins that passed you by.\nRest your mind and softly say,\nThank you life for one more day.",
    ],
  },
];

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function HomePage() {
  const navigate = useNavigate();

  return (
    <section className="page">
      <div className="panel hero">
        <div>
          <p className="eyebrow">Song Collection</p>
          <h1>Select a song</h1>
          <p className="muted">Click a song card to open full-screen stanza mode.</p>
        </div>
      </div>
      <div className="song-grid">
        {songs.map((song) => (
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

function SongViewerPage() {
  const { songId } = useParams();
  const navigate = useNavigate();
  const [stanzaIndex, setStanzaIndex] = useState(0);
  const song = songs.find((item) => item.id === songId);

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

      if (event.key === "ArrowDown") {
        setStanzaIndex((previous) => Math.min(song.stanzas.length - 1, previous + 1));
      } else if (event.key === "ArrowUp") {
        setStanzaIndex((previous) => Math.max(0, previous - 1));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [song]);

  if (!song) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="song-viewer">
      <button type="button" className="btn-ghost song-close" onClick={() => navigate("/")}>
        Back
      </button>
      <p className="song-progress">
        {stanzaIndex + 1} / {song.stanzas.length}
      </p>
      {/* <h1>{song.title}</h1> */}
      <p className="song-stanza">{song.stanzas[stanzaIndex]}</p>
      <div className="song-controls">
        <button
          type="button"
          className="arrow-btn"
          onClick={() => setStanzaIndex((previous) => Math.max(0, previous - 1))}
          disabled={stanzaIndex === 0}
          aria-label="Previous stanza"
        >
          ↑
        </button>
        <button
          type="button"
          className="arrow-btn"
          onClick={() =>
            setStanzaIndex((previous) => Math.min(song.stanzas.length - 1, previous + 1))
          }
          disabled={stanzaIndex === song.stanzas.length - 1}
          aria-label="Next stanza"
        >
          ↓
        </button>
      </div>
    </section>
  );
}

function AssetsPage({ assets, onAddAsset, onSaveAsset, onDeleteAsset }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
  const filterAnchorRef = useRef(null);
  const [draftFilter, setDraftFilter] = useState({
    name: "All",
    category: "All",
    value: "",
  });
  const [appliedFilter, setAppliedFilter] = useState({
    name: "All",
    category: "All",
    value: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    value: "",
  });

  const availableNames = useMemo(
    () => ["All", ...new Set(assets.map((asset) => asset.name).filter(Boolean))],
    [assets]
  );

  const availableCategories = useMemo(
    () => ["All", ...new Set(assets.map((asset) => asset.category).filter(Boolean))],
    [assets]
  );

  const filteredAssets = useMemo(() => {
    const valueQuery = appliedFilter.value.trim();
    return assets.filter((asset) => {
      const matchesName = appliedFilter.name === "All" || asset.name === appliedFilter.name;
      const matchesCategory =
        appliedFilter.category === "All" || asset.category === appliedFilter.category;
      const matchesValue = valueQuery.length === 0 || String(asset.value).includes(valueQuery);
      return matchesName && matchesCategory && matchesValue;
    });
  }, [assets, appliedFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedAssets = filteredAssets.slice(startIndex, startIndex + PAGE_SIZE);

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
    setAppliedFilter(draftFilter);
    setCurrentPage(1);
  };

  const resetFilter = () => {
    const initialFilter = { name: "All", category: "All", value: "" };
    setDraftFilter(initialFilter);
    setAppliedFilter(initialFilter);
    setCurrentPage(1);
  };

  const submitAsset = (event) => {
    event.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedCategory = formData.category.trim();
    const numericValue = Number(formData.value);

    if (!trimmedName || !trimmedCategory || Number.isNaN(numericValue) || numericValue <= 0) {
      return;
    }

    if (editingAssetId === null) {
      onAddAsset({
        id: Date.now(),
        name: trimmedName,
        category: trimmedCategory,
        value: numericValue,
      });
      setCurrentPage(Math.ceil((assets.length + 1) / PAGE_SIZE));
    } else {
      onSaveAsset({
        id: editingAssetId,
        name: trimmedName,
        category: trimmedCategory,
        value: numericValue,
      });
    }

    setFormData({ name: "", category: "", value: "" });
    setEditingAssetId(null);
    setModalOpen(false);
  };

  const openAddModal = () => {
    setFormData({ name: "", category: "", value: "" });
    setEditingAssetId(null);
    setModalOpen(true);
  };

  const openEditModal = (asset) => {
    setFormData({
      name: asset.name,
      category: asset.category,
      value: String(asset.value),
    });
    setEditingAssetId(asset.id);
    setModalOpen(true);
  };

  const closeAssetModal = () => {
    setModalOpen(false);
    setEditingAssetId(null);
    setFormData({ name: "", category: "", value: "" });
  };

  return (
    <section className="page">
      <div className="panel asset-header">
        <div>
          <p className="eyebrow">Songs</p>
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
              aria-controls="assetsFilterPanel"
            >
              Filter
            </button>

            {isFilterPanelOpen ? (
              <form
                id="assetsFilterPanel"
                className="filter-popover"
                onSubmit={(event) => event.preventDefault()}
              >
                <label htmlFor="filterName">Name</label>
                <select
                  id="filterName"
                  name="name"
                  value={draftFilter.name}
                  onChange={handleFilterChange}
                >
                  {availableNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>

                <label htmlFor="filterCategory">Category</label>
                <select
                  id="filterCategory"
                  name="category"
                  value={draftFilter.category}
                  onChange={handleFilterChange}
                >
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <label htmlFor="filterValue">Value</label>
                <input
                  id="filterValue"
                  name="value"
                  type="text"
                  placeholder="Enter value"
                  value={draftFilter.value}
                  onChange={handleFilterChange}
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
            <span>Song Name</span>
            <span>Category</span>
            <span>Value</span>
            <span>Action</span>
          </div>
          {paginatedAssets.map((asset) => (
            <div className="table-row" key={asset.id}>
              <span>{asset.name}</span>
              <span>{asset.category}</span>
              <strong>{formatINR(asset.value)}</strong>
              <div className="action-group">
                <button
                  type="button"
                  className="btn-primary action-btn"
                >
                  Present
                </button>
                <div className="action-row">
                  <button
                    type="button"
                    className="btn-ghost action-btn"
                    onClick={() => openEditModal(asset)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-danger action-btn"
                    onClick={() => setAssetToDelete(asset)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {paginatedAssets.length === 0 ? (
            <div className="table-empty">No assets match the current filters.</div>
          ) : null}
        </div>
        <div className="pagination">
          <button
            type="button"
            className="btn-ghost page-btn"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  type="button"
                  key={pageNumber}
                  className={`page-number ${currentPage === pageNumber ? "active" : ""}`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="btn-ghost page-btn"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal" onSubmit={submitAsset}>
            <h2>{editingAssetId === null ? "Add New Song" : "Edit Song"}</h2>
            <label htmlFor="name">Song Name</label>
            <input
              id="name"
              name="name"
              placeholder="e.g. Sovereign Gold Bond"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label htmlFor="category">Category</label>
            <input
              id="category"
              name="category"
              placeholder="e.g. Commodity"
              value={formData.category}
              onChange={handleChange}
              required
            />

            <label htmlFor="value">Value (INR)</label>
            <input
              id="value"
              name="value"
              type="number"
              min="1"
              placeholder="e.g. 50000"
              value={formData.value}
              onChange={handleChange}
              required
            />

            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={closeAssetModal}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingAssetId === null ? "Save Song" : "Update Song"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {assetToDelete ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h2>Delete Asset</h2>
            <p>
              Are you sure you want to delete <strong>{assetToDelete.name}</strong>?
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={() => setAssetToDelete(null)}>
                No
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  onDeleteAsset(assetToDelete.id);
                  setAssetToDelete(null);
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
function IncomeExpensePage() {

    return (
      <section className="page">
        <h2>Income & Expense Page</h2>
      </section>
    );

}

function SectionStubPage({ title, description }) {
  return (
    <section className="page">
      <div className="panel">
        <p className="eyebrow">Assets</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
    </section>
  );
}

function AppLayout({ isNavOpen, setNavOpen, isNavCollapsed, setNavCollapsed }) {
  const location = useLocation();
  const inAssetsSection = location.pathname.startsWith("/assets");
  const inIncomeExpenseSection = location.pathname.startsWith("/income-expense");
  const [isIncomeExpenseExpanded, setIncomeExpenseExpanded] = useState(
    inIncomeExpenseSection
  );
  const [isAssetsExpanded, setAssetsExpanded] = useState(
    inAssetsSection
  );

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname, setNavOpen]);

  useEffect(() => {
    if (inIncomeExpenseSection) {
      setIncomeExpenseExpanded(true);
    }
  }, [inIncomeExpenseSection]);

  useEffect(() => {
    if (inAssetsSection) {
      setAssetsExpanded(true);
    }
  }, [inAssetsSection]);

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
            <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              Home
            </NavLink>

            <NavLink to="/songList" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              Song List
            </NavLink>

            {/* <div
              className="nav-group"
            >
              <button
                type="button"
                className="nav-item"
                aria-expanded={isIncomeExpenseExpanded}
                onClick={() => setIncomeExpenseExpanded((expanded) => !expanded)}
              >
                Income & Expense
              </button>

              {isIncomeExpenseExpanded ? (
                <div className="nav-submenu">
                  <NavLink
                    to="/income-expense/reports"
                    className={({ isActive }) => `nav-item nav-subitem ${isActive ? "active" : ""}`}
                  >
                    Reports
                  </NavLink>
                  <NavLink
                    to="/income-expense/expense"
                    className={({ isActive }) => `nav-item nav-subitem ${isActive ? "active" : ""}`}
                  >
                    Expense
                  </NavLink>
                  <NavLink
                    to="/income-expense/income"
                    className={({ isActive }) => `nav-item nav-subitem ${isActive ? "active" : ""}`}
                  >
                    Income
                  </NavLink>
                </div>
              ) : null}
            </div> */}

            {/* <div
              className="nav-group"
            >
              <button
                type="button"
                className="nav-item"
                aria-expanded={isAssetsExpanded}
                onClick={() => setAssetsExpanded((expanded) => !expanded)}
              >
                Assets
              </button>

              {isAssetsExpanded ? (
                <div className="nav-submenu">
                  <NavLink
                    to="/assets"
                    end
                    className={({ isActive }) => `nav-item nav-subitem ${isActive ? "active" : ""}`}
                  >
                    Assets
                  </NavLink>
                  <NavLink
                    to="/assets/reports"
                    className={({ isActive }) => `nav-item nav-subitem ${isActive ? "active" : ""}`}
                  >
                    Reports
                  </NavLink>
                </div>
              ) : null}
            </div> */}

          </nav>
        ) : null}
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const [isNavOpen, setNavOpen] = useState(false);
  const [isNavCollapsed, setNavCollapsed] = useState(false);
  const [assets, setAssets] = useState(starterAssets);

  const addAsset = (asset) => {
    setAssets((previous) => [...previous, asset]);
  };

  const saveAsset = (updatedAsset) => {
    setAssets((previous) =>
      previous.map((asset) => (asset.id === updatedAsset.id ? updatedAsset : asset))
    );
  };

  const deleteAsset = (assetId) => {
    setAssets((previous) => previous.filter((asset) => asset.id !== assetId));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/songs/:songId" element={<SongViewerPage />} />
        <Route
          path="/"
          element={
            <AppLayout
              isNavOpen={isNavOpen}
              setNavOpen={setNavOpen}
              isNavCollapsed={isNavCollapsed}
              setNavCollapsed={setNavCollapsed}
            />
          }
        >
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="songList" element={<AssetsPage assets={assets}
                onAddAsset={addAsset}
                onSaveAsset={saveAsset}
                onDeleteAsset={deleteAsset}/>} />
          <Route path="income-expense" element={<IncomeExpensePage />} />
          <Route
            path="income-expense/reports"
            element={
              <SectionStubPage
                title="Reports"
                description="Income & Expense reports to analyze your cash flow patterns and identify areas for optimization."
              />
            }
          />
          <Route
            path="income-expense/expense"
            element={
              <SectionStubPage
                title="Expense"
                description="Track and review expense entries to control spending and improve budgeting."
              />
            }
          />
          <Route
            path="income-expense/income"
            element={
              <SectionStubPage
                title="Income"
                description="Track and review income entries to understand cash inflows and growth trends."
              />
            }
          />
          <Route
            path="assets"
            element={
              <AssetsPage
                assets={assets}
                onAddAsset={addAsset}
                onSaveAsset={saveAsset}
                onDeleteAsset={deleteAsset}
              />
            }
          />
          <Route
            path="assets/reports"
            element={
              <SectionStubPage
                title="Reports"
                description="Generate and review reports for your asset portfolio performance."
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
