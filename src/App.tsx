import { Pet } from './components/Pet';
import { Settings } from './components/Settings';

export default function App() {
  return new URLSearchParams(window.location.search).get('mode') === 'settings' ? (
    <Settings />
  ) : (
    <Pet />
  );
}
