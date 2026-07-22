import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import './home.css';
import { renderLayout } from '../../components/layout.js';

const homeContent = `
  <section class="home-hero py-5 py-lg-6">
    <div class="container py-4">
      <div class="row align-items-center g-4">
        <div class="col-lg-8">
          <span class="badge text-bg-success-subtle text-success-emphasis mb-3">Healthy living, made practical</span>
          <h1 class="display-4 fw-bold mb-3">Small choices for a longer, healthier life.</h1>
          <p class="lead text-body-secondary mb-4">
            More Than 100 brings together simple ideas for wellbeing, movement, mindful living and everyday energy.
          </p>
          <a class="btn btn-success btn-lg" href="/dashboard">Open dashboard</a>
        </div>
      </div>
    </div>
  </section>
`;

renderLayout({ activePath: '/', content: homeContent });
