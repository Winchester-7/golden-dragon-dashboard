import { useApp } from '../app/store';
import emblem from '../assets/gd-emblem.png';

/** Эмблема отеля (без фона) и название. */
export default function Brand() {
  const { go } = useApp();
  return (
    <button type="button" className="brand" onClick={() => go('dashboard')} aria-label="Golden Dragon, на главную">
      <img className="brand-mark brand-img" src={emblem} alt="" />
      <span className="brand-name">Golden Dragon</span>
    </button>
  );
}
