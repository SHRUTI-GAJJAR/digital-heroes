import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, HeartHandshake } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ErrorState, InlineLoading } from "../components/UiStates";
import { getCharity } from "../services/charityService";
import { apiMessage } from "./memberUtils";
import "./CharityPages.css";

function CharityDetails() {
  const { id } = useParams(); const [charity, setCharity] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState(""), [imageFailed, setImageFailed] = useState(false);
  const loadCharity = async () => { setLoading(true); setError(""); setImageFailed(false); try { const { data } = await getCharity(id); setCharity(data.charity || null); } catch (requestError) { setError(apiMessage(requestError, "We couldn’t load this charity right now. Please try again.")); } finally { setLoading(false); } };
  useEffect(() => { loadCharity(); }, [id]);
  return <><Navbar /><main className="charity-page"><Link className="charity-detail-back" to="/charities"><ArrowLeft size={17} /> Back to charities</Link>{loading ? <div className="charity-state"><InlineLoading label="Loading charity details…" /></div> : error || !charity ? <div className="charity-state"><ErrorState message={error || "This charity is no longer available."} onRetry={loadCharity} /></div> : <article className="charity-hero"><div className="charity-detail-copy"><p className="page-eyebrow">Charity profile</p><div className="charity-detail-meta">{charity.is_featured && <span className="charity-tag">Featured charity</span>}{charity.is_active === false && <span className="charity-tag inactive">Inactive</span>}</div><h1>{charity.name}</h1>{charity.description && <p>{charity.description}</p>}{charity.website_url && <a className="website-button" href={charity.website_url} target="_blank" rel="noreferrer">Visit charity website <ExternalLink size={16} /></a>}</div><div className="charity-detail-image">{charity.image_url && !imageFailed ? <img src={charity.image_url} alt={charity.name} onError={() => setImageFailed(true)} /> : <HeartHandshake size={58} aria-label="Charity" />}</div></article>}</main><Footer /></>;
}
export default CharityDetails;
