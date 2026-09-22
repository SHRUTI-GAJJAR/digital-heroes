import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, CircleDollarSign, Gift, Hash, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorState, InlineLoading } from "../components/UiStates";
import NumberSet from "../components/NumberSet";
import { getDraws } from "../services/drawService";
import { apiMessage, currencyValue, formatDate, formatDrawMonth, statusLabel } from "./memberUtils";
import "./MemberPages.css";
import "./DrawPages.css";


export default function Draws() {
  const [draws, setDraws] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const load = async () => { setLoading(true); setError(""); try { const { data } = await getDraws(); setDraws(data.draws || []); } catch (requestError) { setError(apiMessage(requestError, "We couldn’t load the monthly draws.")); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  if (loading) return <section className="member-page"><div className="member-card"><InlineLoading label="Loading monthly draws…" /></div></section>;
  return <section className="member-page"><header className="member-header"><div><p className="page-eyebrow">Monthly rewards</p><h1>Explore monthly draws.</h1><p>See the current draw schedule, published winning numbers, and recorded prize information.</p></div></header>{error && <div className="page-error"><ErrorState message={error} onRetry={load} /></div>}
    {error ? <div className="member-card"><ErrorState message={error} onRetry={load} /></div> : draws.length ? <div className="draw-grid">{draws.map((draw) => <article className="member-card draw-card" key={draw.id}><div className="draw-card-top"><span className={`status-badge ${draw.status}`}>{statusLabel(draw.status)}</span>{draw.draw_type && <span className="draw-type"><Hash size={13} /> {statusLabel(draw.draw_type)}</span>}</div><h2>{draw.draw_name || "Monthly draw"}</h2>{draw.draw_month && <p className="draw-date"><CalendarDays size={16} /> {formatDrawMonth(draw.draw_month)}</p>}{draw.winning_numbers && <div className="numbers-section"><span>Winning numbers</span><NumberSet numbers={draw.winning_numbers} /></div>}{draw.total_prize_pool !== null && draw.total_prize_pool !== undefined && <p className="draw-prize"><CircleDollarSign size={17} /> Prize pool <strong>{currencyValue(draw.total_prize_pool, draw.currency)}</strong></p>}{draw.published_at && <p className="draw-published">Published {formatDate(draw.published_at)}</p>}<Link className="text-action draw-link" to={`/draws/${draw.id}`}>View draw details <ArrowRight size={16} /></Link></article>)}</div> : <div className="member-card"><EmptyState title="No draws are available right now." message="When a monthly draw is added, its details will appear here." /></div>}</section>;
}
