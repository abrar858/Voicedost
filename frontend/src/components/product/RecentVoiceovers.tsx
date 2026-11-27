"use client";

import { useEffect, useMemo, useState } from "react";
import { listHistory, removeHistory, updateHistory, type HistoryItem } from "@/lib/history";
import { formatMinutes } from "@/components/account/MinutesMeter";
import { ShareActions } from "./ShareActions";

function Item({ item, onDelete }: { item: HistoryItem; onDelete: () => void }) {
  const { url, srtUrl } = useMemo(() => ({
    url: URL.createObjectURL(item.audio),
    srtUrl: URL.createObjectURL(new Blob([item.srt], { type: "application/x-subrip" })),
  }), [item]);
  useEffect(() => () => { URL.revokeObjectURL(url); URL.revokeObjectURL(srtUrl); }, [url, srtUrl]);
  const when = new Date(item.created).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return (
    <li className="recent-item">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
        <strong>{item.voiceName}</strong>
        <span className="muted">{when} · {formatMinutes(item.seconds / 60)}</span>
      </div>
      <p className="recent-excerpt" dir="auto">{item.excerpt}</p>
      {url && <audio controls preload="none" src={url} style={{ width: "100%" }} />}
      <div className="share-row">
        {url && <a className="btn btn-outline btn-small" href={url} download={`voicedost-${item.voice}.${item.format}`}>Download {item.format.toUpperCase()}</a>}
        {srtUrl && item.srt && <a className="btn btn-outline btn-small" href={srtUrl} download={`voicedost-${item.voice}.srt`}>Subtitles</a>}
        <button type="button" className="btn btn-outline btn-small" onClick={onDelete}>Delete</button>
      </div>
      {item.shareId && <ShareActions shareId={item.shareId} />}
    </li>
  );
}

/** The last 10 voiceovers made in this browser. */
export function RecentVoiceovers({ version }: { version: number }) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => {
    let alive = true;
    listHistory().then((i) => { if (alive) setItems(i); });
    return () => { alive = false; };
  }, [version]);
  if (!items.length) return null;
  return (
    <section className="panel stack" aria-labelledby="recent-heading" style={{ gridColumn: "1 / -1" }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2 id="recent-heading" style={{ fontSize: 24 }}>My recent voiceovers</h2>
        <span className="muted">Saved on this device only</span>
      </div>
      <ul className="recent-list">
        {items.map((it) => (
          <Item key={it.id} item={it} onDelete={async () => {
            await removeHistory(it.id);
            setItems((xs) => xs.filter((x) => x.id !== it.id));
          }} />
        ))}
      </ul>
    </section>
  );
}

export { updateHistory };
