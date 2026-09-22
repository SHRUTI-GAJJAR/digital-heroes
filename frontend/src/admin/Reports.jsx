import { useEffect, useState } from "react";
import { BarChart3, CircleDollarSign, Gift, HeartHandshake, Medal, RefreshCw, Trophy, Users } from "lucide-react";
import { EmptyState, ErrorState, InlineLoading } from "../components/UiStates";
import NumberSet from "../components/NumberSet";
import { getCharityReport, getDashboardReport, getDrawReport, getSubscriptionReport, getWinnerReport } from "../services/adminService";
import { apiMessage, currencyValue, formatDate, formatDrawMonth, statusLabel } from "../pages/memberUtils";
import "./AdminPages.css";
import "./AdminReports.css";

const initialState = { dashboard: null, subscriptions: [], winners: [], charities: [], draws: [] };
const initialLoading = { dashboard: true, subscriptions: true, winners: true, charities: true, draws: true };
const initialErrors = { dashboard: "", subscriptions: "", winners: "", charities: "", draws: "" };

function ReportSection({ title, icon: Icon, loading, error, onRetry, children, emptyTitle, emptyMessage, isEmpty }) {
  return <section className="admin-card report-section"><div className="card-heading"><div><p className="report-kicker">Reporting</p><h2>{title}</h2></div><Icon size={21} /></div>{loading ? <InlineLoading label={`Loading ${title.toLowerCase()}…`} /> : error ? <ErrorState message={error} onRetry={onRetry} /> : isEmpty ? <EmptyState title={emptyTitle} message={emptyMessage} /> : children}</section>;
}

export default function Reports() {
  const [reports, setReports] = useState(initialState);
  const [loading, setLoading] = useState(initialLoading);
  const [errors, setErrors] = useState(initialErrors);
  const [subscriptionSearch, setSubscriptionSearch] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");

  const requests = {
    dashboard: getDashboardReport,
    subscriptions: getSubscriptionReport,
    winners: getWinnerReport,
    charities: getCharityReport,
    draws: getDrawReport,
  };
  const loadReport = async (key) => {
    setLoading((current) => ({ ...current, [key]: true }));
    setErrors((current) => ({ ...current, [key]: "" }));
    try {
      const { data } = await requests[key]();
      const value = key === "dashboard" ? data.dashboard || null : data[key] || [];
      setReports((current) => ({ ...current, [key]: value }));
    } catch (error) {
      setErrors((current) => ({ ...current, [key]: apiMessage(error, `We couldn’t load the ${key} report.`) }));
    } finally {
      setLoading((current) => ({ ...current, [key]: false }));
    }
  };
  useEffect(() => { Object.keys(requests).forEach(loadReport); }, []);

  const dashboard = reports.dashboard;
  const metrics = dashboard ? [
    ["Members", dashboard.users?.total, Users],
    ["Active subscriptions", dashboard.subscriptions?.active, HeartHandshake],
    ["Charities", dashboard.charities?.total, HeartHandshake],
    ["Draws", dashboard.draws?.total, Gift],
    ["Winners", dashboard.winners?.total, Medal],
    ["Donations", currencyValue(dashboard.donations?.total_amount), CircleDollarSign],
    ["Prize pool", currencyValue(dashboard.prize_pool?.total_amount), Trophy],
  ] : [];
  const searchedSubscriptions = reports.subscriptions.filter((subscription) => {
    const term = subscriptionSearch.trim().toLowerCase();
    const searchable = [subscription.users?.name, subscription.users?.email, subscription.charities?.name, subscription.plan_type, subscription.status].filter(Boolean).join(" ").toLowerCase();
    return (!term || searchable.includes(term)) && (!subscriptionStatus || subscription.status === subscriptionStatus);
  });
  const subscriptionStatuses = [...new Set(reports.subscriptions.map((item) => item.status).filter(Boolean))];

  return <section className="admin-page reports-page"><header className="admin-header"><div><p className="page-eyebrow">Administration</p><h1>Reports and records.</h1><p>Review current membership, draw, winner and charity-giving records in one place.</p></div><button className="quiet-button report-refresh" onClick={() => Object.keys(requests).forEach(loadReport)}><RefreshCw size={16} /> Refresh reports</button></header>
    <ReportSection title="Overview" icon={BarChart3} loading={loading.dashboard} error={errors.dashboard} onRetry={() => loadReport("dashboard")} isEmpty={!dashboard} emptyTitle="Overview unavailable." emptyMessage="Try refreshing the report to load the latest records.">
      <div className="admin-metric-grid report-metric-grid">{metrics.map(([label, value, Icon]) => <article className="admin-metric report-metric" key={label}><Icon size={21} /><span>{label}</span><strong>{value ?? "Unavailable"}</strong></article>)}</div>
      <div className="report-overview-notes"><span>Completed draws <strong>{dashboard?.draws?.completed ?? "Unavailable"}</strong></span><span>Winners awaiting review <strong>{dashboard?.winners?.pending ?? "Unavailable"}</strong></span><span>Winners marked paid <strong>{dashboard?.winners?.paid ?? "Unavailable"}</strong></span></div>
    </ReportSection>
    <ReportSection title="Subscription report" icon={HeartHandshake} loading={loading.subscriptions} error={errors.subscriptions} onRetry={() => loadReport("subscriptions")} isEmpty={!reports.subscriptions.length} emptyTitle="No subscriptions recorded." emptyMessage="Subscription records will appear here when members join.">
      <div className="report-filters"><input aria-label="Search subscriptions" value={subscriptionSearch} onChange={(event) => setSubscriptionSearch(event.target.value)} placeholder="Search member, email or charity" /><select aria-label="Filter subscription status" value={subscriptionStatus} onChange={(event) => setSubscriptionStatus(event.target.value)}><option value="">All statuses</option>{subscriptionStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></div>
      {searchedSubscriptions.length ? <div className="report-list subscription-report-list">{searchedSubscriptions.map((subscription) => <article className="report-record" key={subscription.id}><div className="report-record-title"><strong>{subscription.users?.name || "Member unavailable"}</strong><span>{subscription.users?.email || "Email unavailable"}</span></div><div><span>Charity</span><strong>{subscription.charities?.name || "Unavailable"}</strong></div><div><span>Plan</span><strong>{statusLabel(subscription.plan_type)}</strong></div><div><span>Amount</span><strong>{currencyValue(subscription.amount, subscription.currency) || "Unavailable"}</strong></div><div className="report-record-status"><span className={`status-badge ${subscription.status}`}>{statusLabel(subscription.status)}</span><small>{formatDate(subscription.start_date || subscription.created_at) || "Date unavailable"}</small></div></article>)}</div> : <EmptyState title="No matching subscriptions." message="Try another search term or status." />}
    </ReportSection>
    <div className="reports-pair">
      <ReportSection title="Winner report" icon={Medal} loading={loading.winners} error={errors.winners} onRetry={() => loadReport("winners")} isEmpty={!reports.winners.length} emptyTitle="No winner records." emptyMessage="Completed draw results will appear here.">
        <div className="report-list">{reports.winners.map((winner) => <article className="winner-report-card" key={winner.id}><div><strong>{winner.users?.name || "Member unavailable"}</strong><span>{winner.users?.email || "Email unavailable"}</span><p>{winner.draws?.draw_name || "Draw unavailable"}{winner.draws?.draw_month && ` · ${formatDrawMonth(winner.draws.draw_month)}`}</p></div><div className="winner-report-details"><span>{winner.match_type ? `${statusLabel(winner.match_type)} match` : "Match unavailable"}</span><strong>{currencyValue(winner.prize_amount, winner.currency) || "Prize unavailable"}</strong><small>{formatDate(winner.created_at) || "Date unavailable"}</small></div><div className="status-stack"><span className={`status-badge ${winner.verification_status}`}>{statusLabel(winner.verification_status)}</span><span className={`status-badge ${winner.payout_status}`}>{statusLabel(winner.payout_status)}</span></div></article>)}</div>
      </ReportSection>
      <ReportSection title="Charity impact" icon={HeartHandshake} loading={loading.charities} error={errors.charities} onRetry={() => loadReport("charities")} isEmpty={!reports.charities.length} emptyTitle="No charity donations recorded." emptyMessage="Charity totals will appear once donations are recorded.">
        <div className="report-list charity-report-list">{reports.charities.map((charity) => <article className="charity-report-card" key={charity.charity_id}><div><strong>{charity.charity_name || "Charity unavailable"}</strong><span>{charity.donation_count} {charity.donation_count === 1 ? "donation" : "donations"}</span></div><strong>{currencyValue(charity.total_donations) || "Unavailable"}</strong></article>)}</div>
      </ReportSection>
    </div>
    <ReportSection title="Draw report" icon={Gift} loading={loading.draws} error={errors.draws} onRetry={() => loadReport("draws")} isEmpty={!reports.draws.length} emptyTitle="No draws recorded." emptyMessage="Draw records will appear here when they are created.">
      <div className="report-list draw-report-list">{reports.draws.map((draw) => <article className="draw-report-card" key={draw.id}><div><strong>{draw.draw_name || "Monthly draw"}</strong><span>{formatDrawMonth(draw.draw_month) || "Month unavailable"}</span></div><div>{Array.isArray(draw.winning_numbers) && draw.winning_numbers.length ? <NumberSet numbers={draw.winning_numbers} className="admin-numbers" /> : <span className="report-muted">Winning numbers pending</span>}</div><div className="draw-report-facts"><span className={`status-badge ${draw.status}`}>{statusLabel(draw.status)}</span><strong>{currencyValue(draw.total_prize_pool, draw.currency) || "Prize pool unavailable"}</strong><small>{draw.jackpot_rollover ? "Jackpot rollover" : "No jackpot rollover"}</small>{draw.published_at && <small>Published {formatDate(draw.published_at)}</small>}</div></article>)}</div>
    </ReportSection>
  </section>;
}
