import type { ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import 'styles/globals.sass'
import Navbar from 'components/layouts/navbar'

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  if(Component.getLayout) {
    return Component.getLayout(<Component { ...pageProps } />);
  }

  return <Navbar><Component {...pageProps} /></Navbar>
}