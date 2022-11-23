import Link from "next/link";
import { ReactNode } from "react";
import style from 'styles/Navbar.module.sass'

interface Props {
  children: ReactNode;
}

const Navbar = ({ children }: Props) => {
  return (
    <>
      <nav className={style.container}>
        <ul>
          <li><Link href="/">Top</Link></li>
          <li><Link href="/main/profile">Profile</Link></li>
          <li><Link href="https://pjsekai.sega.jp/" target="_blank">prsk</Link></li>
          <li><Link href="https://genshin.hoyoverse.com/ja" target="_blank">Genshin</Link></li>
          <li><Link href="https://playvalorant.com/ja-jp/?utm_source=riotbar&utm_medium=productcard%2Bplayvalorant.com&utm_campaign=val&utm_content=ep5act1" target="_blank">Valorant</Link></li>
        </ul>
      </nav>
      { children }
    </>
  )
}
export default Navbar;