import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { EmptyState, ErrorState, InlineLoading } from "../components/UiStates";
import { getCharities } from "../services/charityService";

import "./Home.css";

function FeaturedCharityCard({ charity }) {
  const [imageFailed, setImageFailed] = useState(false);
  return <article className="charity-card"><div className="charity-image">{charity.image_url && !imageFailed ? <img src={charity.image_url} alt={charity.name} onError={() => setImageFailed(true)} /> : <Heart size={42} aria-label="Charity" />}<div className="charity-heart"><Heart size={17} /></div></div><div className="charity-content"><h3>{charity.name}</h3><p>{charity.description || "Learn more about this Digital Heroes charity partner."}</p><Link to={`/charities/${charity.id}`} className="card-link">View charity <ArrowRight size={16} /></Link></div></article>;
}

function Home() {
  const [charities, setCharities] = useState([]);
  const [charitiesLoading, setCharitiesLoading] = useState(true);
  const [charitiesError, setCharitiesError] = useState("");
  const loadCharities = async () => {
    setCharitiesLoading(true); setCharitiesError("");
    try { const { data } = await getCharities({ featured: true, active: true }); setCharities(data.charities || []); }
    catch { setCharities([]); setCharitiesError("We couldn’t load featured charities right now."); }
    finally { setCharitiesLoading(false); }
  };
  useEffect(() => {
    loadCharities();
  }, []);
  return (
    <div className="home-page">
      <Navbar />

      {/* Hero */}
      <main>
        <section className="hero">
          <div className="hero-container">
            <div className="hero-content">
              <div className="eyebrow">
                <Sparkles size={15} />
                Play with purpose
              </div>

              <h1>
                Your game can
                <span> change lives.</span>
              </h1>

              <p className="hero-description">
                Digital Heroes brings golf, giving and rewards together.
                Subscribe, support a charity you care about and take part in
                our monthly draw.
              </p>

              <div className="hero-actions">
                <Link to="/register" className="primary-button">
                  Become a Digital Hero
                  <ArrowRight size={18} />
                </Link>

                <a href="#how-it-works" className="secondary-button">
                  See how it works
                </a>
              </div>

              <div className="hero-trust">
                <div className="trust-item">
                  <ShieldCheck size={18} />
                  <span>Secure membership</span>
                </div>

                <div className="trust-item">
                  <Heart size={18} />
                  <span>Charity-first</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image-card">
                <img
                  src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=85"
                  alt="Golfer on a golf course"
                />

                <div className="impact-card">
                  <div className="impact-icon">
                    <Heart size={18} fill="currentColor" />
                  </div>

                  <div>
                    <strong>Play. Give. Impact.</strong>
                    <span>Every subscription supports a cause.</span>
                  </div>
                </div>
              </div>

              <div className="floating-stat">
                <Trophy size={20} />

                <div>
                  <strong>Monthly rewards</strong>
                  <span>One draw. Real impact.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="how-section" id="how-it-works">
          <div className="section-container">
            <div className="section-heading centered">
              <span className="section-label">How it works</span>

              <h2>
                One subscription.
                <br />
                <span>Three ways to make an impact.</span>
              </h2>

              <p>
                Your membership connects your game with causes that matter,
                while giving you a chance to win every month.
              </p>
            </div>

            <div className="steps-grid">
              <article className="step-card">
                <div className="step-number">01</div>

                <div className="step-icon">
                  <Users size={23} />
                </div>

                <h3>Join the community</h3>

                <p>
                  Choose a monthly or yearly membership and become part of the
                  Digital Heroes community.
                </p>
              </article>

              <article className="step-card featured-step">
                <div className="step-number">02</div>

                <div className="step-icon">
                  <Heart size={23} />
                </div>

                <h3>Choose your cause</h3>

                <p>
                  Select a charity close to your heart. At least 10% of your
                  subscription goes towards your chosen cause.
                </p>
              </article>

              <article className="step-card">
                <div className="step-number">03</div>

                <div className="step-icon">
                  <Trophy size={23} />
                </div>

                <h3>Play for rewards</h3>

                <p>
                  Enter your golf scores and take part in the monthly draw for
                  a chance to win.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Charity section */}
        <section className="charity-section" id="charities">
          <div className="section-container">
            <div className="charity-heading">
              <div>
                <span className="section-label">Causes that matter</span>

                <h2>
                  Your game can
                  <br />
                  <span>do more.</span>
                </h2>
              </div>

              <Link to="/charities" className="text-link">
                Explore all charities
                <ArrowRight size={17} />
              </Link>
            </div>

            {charitiesLoading ? <div className="home-charity-state"><InlineLoading label="Loading featured charities…" /></div> : charitiesError ? <div className="home-charity-state"><ErrorState message={charitiesError} onRetry={loadCharities} /></div> : charities.length ? <div className="charity-grid">{charities.map((charity) => <FeaturedCharityCard charity={charity} key={charity.id} />)}</div> : <div className="home-charity-state"><EmptyState title="Featured charities will appear here." message="Open the charity directory to see the causes you can support today." /></div>}
          </div>
        </section>

        {/* Draw */}
        <section className="draw-section" id="draw">
          <div className="draw-container">
            <div className="draw-copy">
              <span className="section-label light-label">
                The monthly draw
              </span>

              <h2>
                Five numbers.
                <br />
                <span>One monthly chance.</span>
              </h2>

              <p>
                Active subscribers automatically become part of the monthly
                rewards experience. Match three, four or five numbers to
                unlock your share of the prize pool.
              </p>

              <Link to="/register" className="light-button">
                Join the draw
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="draw-visual">
              <div className="draw-label">Your numbers</div>

              <div className="number-row">
                {[7, 14, 23, 31, 42].map((number) => (
                  <div className="draw-number" key={number}>
                    {number}
                  </div>
                ))}
              </div>

              <div className="draw-result">
                <div className="result-dot" />

                <span>
                  Monthly draw • 5 / 4 / 3 number matches
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="final-cta">
          <div className="final-cta-inner">
            <div className="cta-icon">
              <Heart size={25} fill="currentColor" />
            </div>

            <span className="section-label">
              Make your next round count
            </span>

            <h2>
              Play the game you love.
              <br />
              <span>Support something you love.</span>
            </h2>

            <p>
              Join Digital Heroes and turn your membership into meaningful
              impact.
            </p>

            <Link to="/register" className="primary-button">
              Become a Digital Hero
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
