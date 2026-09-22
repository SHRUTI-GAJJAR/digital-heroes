
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  FileCheck2,
  FileUp,
  Medal,
  ReceiptText,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import {
  EmptyState,
  ErrorState,
  InlineLoading,
} from "../components/UiStates";
import NumberSet from "../components/NumberSet";

import {
  getWinner,
  getWinnerProof,
  uploadWinnerProof,
} from "../services/winnerService";

import {
  apiMessage,
  currencyValue,
  formatDate,
  formatDrawMonth,
  statusLabel,
} from "./memberUtils";

import "./MemberPages.css";
import "./DrawPages.css";
import "./WinnerPages.css";

export default function WinnerVerification() {
  const { id } = useParams();

  const [winner, setWinner] = useState(null);
  const [proof, setProof] = useState(null);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [proofError, setProofError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    setProofError("");

    try {
      const { data } = await getWinner(id);

      setWinner(data.winner);

      try {
        const proofResponse = await getWinnerProof(id);

        setProof(proofResponse.data.proof || null);
      } catch (proofRequestError) {
        if (proofRequestError.response?.status === 404) {
          setProof(null);
        } else {
          setProofError(
            apiMessage(
              proofRequestError,
              "We couldn’t load your proof information."
            )
          );
        }
      }
    } catch (requestError) {
      setError(
        apiMessage(
          requestError,
          "We couldn’t load this winner record."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const chooseFile = (event) => {
    setSuccess("");
    setProofError("");

    const selected = event.target.files?.[0] || null;

    if (selected && selected.size > 5 * 1024 * 1024) {
      setFile(null);
      setProofError("Proof files must be 5 MB or smaller.");
      return;
    }

    setFile(selected);
  };

  const submitProof = async (event) => {
    event.preventDefault();

    if (!file) {
      return setProofError("Select a proof file before uploading.");
    }

    setUploading(true);
    setProofError("");
    setSuccess("");

    try {
      const formData = new FormData();

      formData.append("proof", file);

      const { data } = await uploadWinnerProof(id, formData);

      setProof(data.proof || null);
      setFile(null);

      setSuccess(
        data.message || "Winner proof uploaded successfully."
      );
    } catch (requestError) {
      setProofError(
        apiMessage(
          requestError,
          "We couldn’t upload your proof."
        )
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <section className="member-page">
        <div className="member-card">
          <InlineLoading label="Loading winner details…" />
        </div>
      </section>
    );
  }

  if (error || !winner) {
    return (
      <section className="member-page">
        <Link
          className="text-action back-link"
          to="/winners"
        >
          <ArrowLeft size={16} />
          All winners
        </Link>

        <div className="member-card">
          <ErrorState
            message={error || "Winner record not found."}
            onRetry={load}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="member-page">
      <Link
        className="text-action back-link"
        to="/winners"
      >
        <ArrowLeft size={16} />
        All winners
      </Link>

      <header className="member-header winner-detail-header">
        <div>
          <p className="page-eyebrow">Winner details</p>

          <h1>
            {winner.draws?.draw_name || "Monthly draw"}
          </h1>

          {winner.draws?.draw_month && (
            <p>
              <CalendarDays size={16} />
              {formatDrawMonth(winner.draws.draw_month)}
            </p>
          )}
        </div>

        <Medal
          className="winner-header-icon"
          size={42}
        />
      </header>

      {proofError && (
        <div className="form-error">
          {proofError}
        </div>
      )}

      {success && (
        <div className="form-success">
          {success}
        </div>
      )}

      <div className="winner-detail-grid">
        <article className="member-card">
          <div className="card-heading">
            <h2>Reward overview</h2>
            <Trophy size={21} />
          </div>

          <div className="detail-list">
            {winner.match_type && (
              <div className="detail-line">
                <span>Match tier</span>

                <strong>
                  {statusLabel(winner.match_type)} match
                </strong>
              </div>
            )}

            {winner.prize_amount !== null &&
              winner.prize_amount !== undefined && (
                <div className="detail-line">
                  <span>Prize amount</span>

                  <strong>
                    {currencyValue(
                      winner.prize_amount,
                      winner.currency
                    )}
                  </strong>
                </div>
              )}

            {winner.created_at && (
              <div className="detail-line">
                <span>Recorded</span>

                <strong>
                  {formatDate(winner.created_at)}
                </strong>
              </div>
            )}
          </div>
        </article>

        <article className="member-card">
          <div className="card-heading">
            <h2>Winning numbers</h2>
            <ReceiptText size={21} />
          </div>

          {Array.isArray(winner.draws?.winning_numbers) &&
          winner.draws.winning_numbers.length ? (
            <NumberSet
              numbers={winner.draws.winning_numbers}
              className="winning-numbers winner-number-set"
            />
          ) : (
            <EmptyState
              title="Winning numbers unavailable."
              message="This winner record does not include draw numbers."
            />
          )}
        </article>
      </div>

      <article className="member-card winner-status-card">
        <div className="card-heading">
          <h2>Verification and payout</h2>
          <ShieldCheck size={21} />
        </div>

        <div className="status-detail-grid">
          {winner.verification_status && (
            <div>
              <span>Verification</span>

              <strong
                className={`status-badge ${winner.verification_status}`}
              >
                {statusLabel(winner.verification_status)}
              </strong>
            </div>
          )}

          {winner.verified_at && (
            <div>
              <span>Verified</span>

              <strong>
                {formatDate(winner.verified_at)}
              </strong>
            </div>
          )}

          {winner.payout_status && (
            <div>
              <span>Payout</span>

              <strong
                className={`status-badge ${winner.payout_status}`}
              >
                {statusLabel(winner.payout_status)}
              </strong>
            </div>
          )}

          {winner.paid_at && (
            <div>
              <span>Paid</span>

              <strong>
                {formatDate(winner.paid_at)}
              </strong>
            </div>
          )}
        </div>
      </article>

      <article className="member-card proof-card">
        <div className="card-heading">
          <h2>Proof of eligibility</h2>
          <FileCheck2 size={21} />
        </div>

        {proof ? (
          <div className="proof-current">
            <p>
              <strong>
                {proof.file_name || "Proof file"}
              </strong>

              {proof.uploaded_at && (
                <span>
                  Uploaded {formatDate(proof.uploaded_at)}
                </span>
              )}
            </p>

            {proof.signed_url && (
              <a
                className="text-action"
                href={proof.signed_url}
                target="_blank"
                rel="noreferrer"
              >
                View submitted proof
              </a>
            )}

            {proof.reviewed_at && (
              <p>
                Reviewed {formatDate(proof.reviewed_at)}
              </p>
            )}

            {proof.review_notes && (
              <p className="proof-notes">
                {proof.review_notes}
              </p>
            )}
          </div>
        ) : (
          <EmptyState
            title="No proof submitted yet."
            message="Upload an accepted file to add proof to this winner record."
          />
        )}

        <form
          className="proof-upload-form"
          onSubmit={submitProof}
        >
          <label className="form-field">
            {proof
              ? "Replace or resubmit proof"
              : "Choose proof file"}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={chooseFile}
            />
          </label>

          <p className="field-help">
            JPG, PNG, WEBP, or PDF. Maximum file size: 5 MB.
          </p>

          {file && (
            <p className="selected-file">
              <FileUp size={16} />
              {file.name}
            </p>
          )}

          <div className="form-actions">
            <button
              className="action-button"
              disabled={uploading}
            >
              {uploading ? (
                <InlineLoading label="Uploading…" />
              ) : (
                <>
                  <FileUp size={17} />
                  Upload proof
                </>
              )}
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}