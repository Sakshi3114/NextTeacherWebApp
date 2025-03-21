import classes from './MainNavigation.module.css';
import Link from 'next/link';
import { NotebookPen } from 'lucide-react';
function MainNavigation() {

  return (
    <header className={classes.header}>
      <div className={classes.logo}>
        <Link href= '/'>
        <NotebookPen className={classes.icon} />
        </Link>
        Teacher Schedule Check 
        </div>
      <nav>
        <ul>
          <li>
            <Link href='/login'>Admin Panel</Link>
          </li>
          <li>
            <Link href='/student'>Student Panel</Link>
          </li>
          <li>
            <Link href='/admin/auth-forms'>Teacher Panel</Link>
          </li>
          <li>
            <Link href='/notices'>Check Notice</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default MainNavigation;
