import classes from './MainNavigation.module.css';
import Link from 'next/link';
import { NotebookPen } from 'lucide-react';
function MainNavigation() {

  return (
    <header className={classes.header}>
      <div className={classes.logo}>
        <NotebookPen className={classes.icon} />
        Teacher Schedule Check 
        </div>
      <nav>
        <ul>
          <li>
            <Link href='/admin'>Admin Panel</Link>
          </li>
          <li>
            <Link href='/student'>Student Panel</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default MainNavigation;
