import { redirect } from 'next/navigation';

// El middleware envía a cada usuario a su área; esto es solo el respaldo.
export default function Home() {
  redirect('/login');
}
