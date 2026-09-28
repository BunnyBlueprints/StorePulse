import { ArrowRight, BarChart3, MapPin, Star, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div className="home-page animated">
    <section className="home-hero">
      <div className="home-hero-copy">
        <p className="eyebrow"><Store size={15} /> Store intelligence, made useful</p>
        <h1>Know the stores people love.</h1>
        <p className="home-lede">
          Explore local stores, share honest ratings, and turn customer feedback into a clearer picture of what is working.
        </p>
        <div className="home-actions">
          <Link to="/register" className="btn home-primary-action">Create your account <ArrowRight size={17} /></Link>
          <Link to="/login" className="home-text-action">Sign in <ArrowRight size={16} /></Link>
        </div>
      </div>

      <div className="home-signal-card" aria-label="StorePulse rating overview">
        <div className="signal-orbit signal-orbit-one" />
        <div className="signal-orbit signal-orbit-two" />
        <div className="signal-card-content">
          <div className="signal-card-label"><span className="signal-dot" /> Live store pulse</div>
          <div className="signal-score">4.8<span>/5</span></div>
          <div className="signal-stars" aria-hidden="true"><Star fill="currentColor" size={17} /><Star fill="currentColor" size={17} /><Star fill="currentColor" size={17} /><Star fill="currentColor" size={17} /><Star fill="currentColor" size={17} /></div>
          <p>Ratings that help people choose with confidence.</p>
        </div>
      </div>
    </section>

    <section className="home-benefits" aria-label="StorePulse benefits">
      <div className="home-benefit"><MapPin size={20} /><div><h2>Find nearby</h2><p>Search stores by name or address.</p></div></div>
      <div className="home-benefit"><Star size={20} /><div><h2>Rate honestly</h2><p>Leave feedback that stays useful.</p></div></div>
      <div className="home-benefit"><BarChart3 size={20} /><div><h2>See the signal</h2><p>Track ratings from one focused dashboard.</p></div></div>
    </section>
  </div>
);

export default Home;
