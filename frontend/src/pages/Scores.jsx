import { useEffect, useState } from "react";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmationDialog, EmptyState, ErrorState, InlineLoading } from "../components/UiStates";
import { createScore, deleteScore, getScores, updateScore } from "../services/scoreService";
import { apiMessage, formatDate } from "./memberUtils";
import "./MemberPages.css";

const emptyForm = { score_date: "", stableford_score: "" };
const validate = ({ score_date, stableford_score }) => {
  const score = Number(stableford_score);
  if (!score_date) return "Please choose the score date.";
  if (!Number.isInteger(score) || score < 1 || score > 45) return "Stableford score must be a whole number between 1 and 45.";
  return "";
};

export default function Scores() {
  const [scores, setScores] = useState([]), [loading, setLoading] = useState(true), [loadError, setLoadError] = useState("");
  const [form, setForm] = useState(emptyForm), [editing, setEditing] = useState(null), [submitting, setSubmitting] = useState(false), [formError, setFormError] = useState(""), [success, setSuccess] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null), [deleting, setDeleting] = useState(false);
  const loadScores = async () => { setLoading(true); setLoadError(""); try { const { data } = await getScores(); setScores(data.scores || []); } catch (error) { setLoadError(apiMessage(error, "We couldn’t load your golf scores.")); } finally { setLoading(false); } };
  useEffect(() => { loadScores(); }, []);
  const resetForm = () => { setEditing(null); setForm(emptyForm); setFormError(""); };
  const submit = async (event) => { event.preventDefault(); setFormError(""); setSuccess(""); const issue = validate(form); if (issue) return setFormError(issue); setSubmitting(true); try { const payload = { score_date: form.score_date, stableford_score: Number(form.stableford_score) }; const response = editing ? await updateScore(editing.id, payload) : await createScore(payload); setSuccess(response.data.message || (editing ? "Score updated." : "Score added.")); resetForm(); await loadScores(); } catch (error) { setFormError(apiMessage(error, "We couldn’t save this score.")); } finally { setSubmitting(false); } };
  const startEdit = (score) => { setEditing(score); setForm({ score_date: String(score.score_date).slice(0, 10), stableford_score: String(score.stableford_score) }); setFormError(""); setSuccess(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const confirmDelete = async () => { if (!deleteTarget) return; setDeleting(true); try { await deleteScore(deleteTarget.id); setSuccess("Score deleted."); setDeleteTarget(null); await loadScores(); } catch (error) { setFormError(apiMessage(error, "We couldn’t delete this score.")); setDeleteTarget(null); } finally { setDeleting(false); } };
  return <section className="member-page"><header className="member-header"><div><p className="page-eyebrow">Golf activity</p><h1>Your Stableford scores.</h1><p>Keep your recent scores up to date for your Digital Heroes subscription.</p></div></header>
    <div className="member-card form-card"><div className="card-heading"><h2>{editing ? "Edit score" : "Add score"}</h2><CalendarDays size={21} /></div><p className="notice">Your five most recent scores are kept here, with the newest first.</p>{formError && <div className="form-error">{formError}</div>}{success && <div className="form-success">{success}</div>}<form onSubmit={submit}><div className="field-grid"><label className="form-field">Score date<input type="date" required value={form.score_date} onChange={(e) => setForm({ ...form, score_date: e.target.value })} /></label><label className="form-field">Stableford score<input type="number" required min="1" max="45" step="1" value={form.stableford_score} onChange={(e) => setForm({ ...form, stableford_score: e.target.value })} /><span className="field-help">Whole number from 1 to 45.</span></label></div><div className="form-actions"><button className="action-button" disabled={submitting}>{submitting ? <InlineLoading label="Saving…" /> : <><Plus size={16} />{editing ? "Save changes" : "Add score"}</>}</button>{editing && <button type="button" className="quiet-button" onClick={resetForm} disabled={submitting}>Cancel</button>}</div></form></div>
    <div className="member-card form-card"><div className="card-heading"><h2>Recent scores</h2><span className="status-badge">{scores.length} {scores.length === 1 ? "score" : "scores"}</span></div>{loading ? <InlineLoading label="Loading your scores…" /> : loadError ? <ErrorState message={loadError} onRetry={loadScores} /> : scores.length === 0 ? <EmptyState title="No golf scores yet." message="Add your first score so your golf activity stays up to date." /> : <div className="scores-table"><table><thead><tr><th>Date</th><th>Stableford score</th><th aria-label="Actions" /></tr></thead><tbody>{scores.map((score) => <tr key={score.id}><td>{formatDate(score.score_date)}</td><td className="score-cell">{score.stableford_score}</td><td><div className="row-actions"><button className="text-action" onClick={() => startEdit(score)}><Pencil size={15} /> Edit score</button><button className="text-action danger-action" onClick={() => setDeleteTarget(score)}><Trash2 size={15} /> Delete score</button></div></td></tr>)}</tbody></table></div>}</div>
    <ConfirmationDialog open={Boolean(deleteTarget)} title="Delete this score?" message={deleteTarget ? `Your ${formatDate(deleteTarget.score_date)} score will be removed.` : ""} confirmLabel={deleting ? "Deleting…" : "Delete score"} onConfirm={confirmDelete} onCancel={() => !deleting && setDeleteTarget(null)} />
  </section>;
}
