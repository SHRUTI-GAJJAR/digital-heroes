import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, CircleDollarSign, Medal, ShieldCheck, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorState, InlineLoading } from "../components/UiStates";
import NumberSet from "../components/NumberSet";
import { getWinners } from "../services/winnerService";
import { apiMessage, currencyValue, formatDate, formatDrawMonth, statusLabel } from "./memberUtils";
import "./MemberPages.css";
import "./DrawPages.css";
import "./WinnerPages.css";


export default function Winners() {
  const [winners, setWinners] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const load = async () => { setLoading(true); setError(""); try { const { data } = await getWinners(); setWinners(data.winners || []); } catch (requestError) { setError(apiMessage(requestError, "We couldn’t load your winner records.")); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  if (loading) return <section className="member-page"><div className="member-card"><InlineLoading label="Loading your winner records…" /></div></section>;
  return <section className="member-page"><header className="member-header"><div><p className="page-eyebrow">Rewards</p><h1>Your winning records.</h1><p>View your confirmed draw results, verification progress, and payout status.</p></div></header>
    {error ? <div className="member-card"><ErrorState message={error} onRetry={load} /></div> : winners.length ? <div className="winner-list">{winners.map((winner) => <article className="member-card winner-card" key={winner.id}><div className="winner-card-main"><div className="winner-icon"><Medal size={22} /></div><div><p className="winner-kicker">{winner.draws?.draw_month && formatDrawMonth(winner.draws.draw_month)}</p><h2>{winner.draws?.draw_name || "Monthly draw"}</h2>{winner.match_type && <p className="winner-match"><Trophy size={15} /> {statusLabel(winner.match_type)} match</p>}</div></div><div className="winner-card-numbers">{winner.draws?.winning_numbers && <><span>Winning numbers</span><NumberSet numbers={winner.draws.winning_numbers} className="winning-numbers winner-number-set" /></>}</div><div className="winner-card-status"><div>{winner.prize_amount !== null && winner.prize_amount !== undefined && <><span>Prize amount</span><strong>{currencyValue(winner.prize_amount, winner.currency)}</strong></>}</div><div className="status-stack">{winner.verification_status && <span className={`status-badge ${winner.verification_status}`}>{statusLabel(winner.verification_status)}</span>}{winner.payout_status && <span className={`status-badge ${winner.payout_status}`}>{statusLabel(winner.payout_status)}</span>}</div></div>{winner.created_at && <p className="winner-date"><CalendarDays size={14} /> Recorded {formatDate(winner.created_at)}</p>}<Link className="text-action winner-link" to={`/winners/${winner.id}`}>View winner details <ArrowRight size={16} /></Link></article>)}</div> : <div className="member-card"><EmptyState title="No winner records yet." message="If one of your draw entries is recorded as a winner, it will appear here." /></div>}</section>;
}
