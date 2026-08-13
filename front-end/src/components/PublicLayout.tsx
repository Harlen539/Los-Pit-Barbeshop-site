import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Preloader } from './Preloader';

export function PublicLayout() {
  return <><Preloader /><Header /><Outlet /></>;
}
