import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import './home.css';
import { renderLayout } from '../../components/layout.js';
import {
  createContentAreasSection,
  createFeaturedContentSection,
  createHeroSection,
  createValueSection,
} from './home-sections.js';

const homeContent = [
  createHeroSection(),
  createContentAreasSection(),
  createFeaturedContentSection(),
  createValueSection(),
].join('');

renderLayout({ activePath: '/', content: homeContent, mainClass: 'home-page' });
