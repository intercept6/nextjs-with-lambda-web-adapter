import Link from "next/link";

export default function Home() {
  return (
    <div>
      <ul>
        <li>
          <Link href="/todos">Todos</Link>
        </li>
      </ul>
    </div>
  );
}
