import { Front } from "./front";
import { Koi } from "./koi";
import "./plain.css";

/*
  The front page: one narrow column with a row of tabs at the top (front.tsx),
  over a pond of ASCII koi (koi.tsx). Near-black, one face at one size.
*/
export default function Home() {
  return (
    <div className="plain">
      <Koi avoid=".plain > main" />
      <Front />
    </div>
  );
}
