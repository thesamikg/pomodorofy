import { Search, WandSparkles } from "lucide-react";
import { useDeferredValue, useState } from "react";

function Playlist({
  onPlaySelected,
  onRefresh,
  playlists,
  selectedPlaylistId,
  setSelectedPlaylistId,
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredPlaylists = playlists.filter((playlist) => {
    if (!normalizedQuery) {
      return true;
    }

    return (
      playlist.name.toLowerCase().includes(normalizedQuery) ||
      playlist.owner?.display_name?.toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <section className="glass-panel p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-brand/50">
            Playlists
          </p>
          <h2 className="mt-2 font-heading text-3xl text-brand">
            Pick the exact sound for this block
          </h2>
        </div>
        <button className="button-secondary w-full sm:w-auto" onClick={onRefresh} type="button">
          Refresh playlists
        </button>
      </div>

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand/35" />
        <input
          aria-label="Search playlists"
          className="input-shell w-full pl-11"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by playlist name or owner"
          value={query}
        />
      </div>

      <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1">
        {filteredPlaylists.length ? (
          filteredPlaylists.map((playlist) => (
            <button
              key={playlist.id}
              aria-pressed={selectedPlaylistId === playlist.id}
              className={`flex w-full items-start gap-4 rounded-[24px] border p-4 text-left transition sm:items-center ${
                selectedPlaylistId === playlist.id
                  ? "border-panel/30 bg-[rgba(75,128,144,0.08)] text-brand"
                  : "border-brand/10 bg-surface text-brand hover:border-panel/30"
              }`}
              onClick={() => setSelectedPlaylistId(playlist.id)}
              type="button"
            >
              {playlist.images?.[0]?.url ? (
                <img
                  alt={`${playlist.name} cover art`}
                  className="h-14 w-14 rounded-2xl object-cover"
                  src={playlist.images[0].url}
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/10 bg-[rgba(75,128,144,0.12)] text-brand/70">
                  SP
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-brand sm:truncate">{playlist.name}</p>
                <p className={`mt-1 text-sm leading-6 ${selectedPlaylistId === playlist.id ? "text-brand/60" : "text-brand/55"}`}>
                  {playlist.tracks?.total || 0} tracks by {playlist.owner?.display_name || "Spotify"}
                </p>
              </div>
            </button>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-panel/18 bg-[rgba(75,128,144,0.08)] p-6 text-center text-brand/70">
            <WandSparkles className="mx-auto h-5 w-5 text-panel" />
            <p className="mt-3">No playlists matched that search.</p>
          </div>
        )}
      </div>

      <button
        className="button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!playlists.length || !selectedPlaylistId}
        onClick={onPlaySelected}
        type="button"
      >
        Play selected playlist
      </button>
    </section>
  );
}

export default Playlist;
