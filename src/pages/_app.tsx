/* eslint-disable @typescript-eslint/naming-convention */
import { darkTheme, lightTheme, RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit'

import '@rainbow-me/rainbowkit/styles.css'
import '@ensdomains/thorin/dist/style.css'
import '@splidejs/react-splide/css'

import { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { ReactElement, ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { IntercomProvider } from 'react-use-intercom'
import { createGlobalStyle, keyframes, ThemeProvider } from 'styled-components'

import {
  Mode,
  darkTheme as thorinDarkTheme,
  lightTheme as thorinLightTheme,
  ThemeProvider as ThorinThemeProvider,
  useTheme,
} from '@ensdomains/thorin'

import { Notifications } from '@app/components/Notifications'
import { TestnetWarning } from '@app/components/TestnetWarning'
import { TransactionStoreProvider } from '@app/hooks/transactions/TransactionStoreContext'
import { Basic } from '@app/layouts/Basic'
import { TransactionFlowProvider } from '@app/transaction-flow/TransactionFlowProvider'
import { setupAnalytics } from '@app/utils/analytics'
import { BreakpointProvider } from '@app/utils/BreakpointProvider'
import { QueryProviders } from '@app/utils/query/providers'
import { SyncDroppedTransaction } from '@app/utils/SyncProvider/SyncDroppedTransaction'
import { SyncProvider } from '@app/utils/SyncProvider/SyncProvider'

import i18n from '../i18n'

import '../styles.css'

const INTERCOM_ID = process.env.NEXT_PUBLIC_INTERCOM_ID || 'eotmigir'

const anim = keyframes`
  0% {
    opacity: 1;
  }

  0%, 99% {
    pointer-events: auto;
  }

  100% {
    opacity: 0.5;
    pointer-events: none;
  }
`

const GlobalStyle = createGlobalStyle`
  html,
  body {
    padding: 0;
    margin: 0;
  }

  *,
  ::before,
  ::after {
    font-family: Satoshi,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      "Fira Sans",
      "Droid Sans",
      "Helvetica Neue",
      sans-serif;
  }

  body {
    background: radial-gradient(50% 50% at 50% 50%, rgba(82, 152, 255, 0.062) 0%, rgba(255, 255, 255, 0) 100%), #F7F7F7;
  }

  body, .min-safe {
    min-height: 100vh;
    /* stylelint-disable-next-line value-no-vendor-prefix */
    @supports (-webkit-touch-callout: none) {
      /* stylelint-disable-next-line value-no-vendor-prefix */
      min-height: -webkit-fill-available;
    }
  }

  [data-theme="dark"] body {
    background: rgb(20, 20, 22);
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  * {
    box-sizing: border-box;
    font-feature-settings: "ss01" on, "ss03" on;
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -moz-font-feature-settings: "ss01" on, "ss03" on;
  }

  .cacheable-component > div:last-of-type > div > * {
    transition: opacity 0.15s ease-in-out;
    opacity: 1;
  }

  .cacheable-component-cached > div:last-of-type > div > * {
    opacity: 0.5;
    pointer-events: none;
    animation: ${anim} 0.25s ease-in-out 0.5s backwards;

    &.transaction-loader {
      opacity: 1;
      pointer-events: auto;
      animation: none;
    }
  }
`

const breakpoints = {
  xs: '(min-width: 360px)',
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
}

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

setupAnalytics()

declare global {
  interface Window {
    __theme: Mode
    __setPreferredTheme: (theme: Mode) => void
    __onThemeChange: (theme: Mode) => void
  }
}

const AppWithThorin = ({ Component, pageProps }: Omit<AppPropsWithLayout, 'router'>) => {
  const getLayout = Component.getLayout ?? ((page) => page)
  const theme = useTheme()

  const baseRainbowKitTheme = theme.mode === 'dark' ? darkTheme : lightTheme

  const rainbowKitTheme: Theme = {
    ...baseRainbowKitTheme({
      accentColor: thorinLightTheme.colors.accent,
      borderRadius: 'medium',
    }),
    fonts: {
      body: 'Satoshi, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
    },
  }

  return (
    <RainbowKitProvider theme={rainbowKitTheme}>
      <TransactionStoreProvider>
        <ThemeProvider theme={theme.mode === 'dark' ? thorinDarkTheme : thorinLightTheme}>
          <BreakpointProvider queries={breakpoints}>
            <IntercomProvider appId={INTERCOM_ID}>
              <GlobalStyle />
              <SyncProvider>
                <TransactionFlowProvider>
                  <SyncDroppedTransaction>
                    <Notifications />
                    <TestnetWarning />
                    <Basic>{getLayout(<Component {...pageProps} />)}</Basic>
                  </SyncDroppedTransaction>
                </TransactionFlowProvider>
              </SyncProvider>
            </IntercomProvider>
          </BreakpointProvider>
        </ThemeProvider>
      </TransactionStoreProvider>
    </RainbowKitProvider>
  )
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const defaultMode = typeof window !== 'undefined' ? window.__theme : 'light'

  return (
    <I18nextProvider i18n={i18n}>
      <QueryProviders>
        <ThorinThemeProvider
          onThemeChange={(mode) => window.__setPreferredTheme(mode)}
          defaultMode={defaultMode}
        >
          <AppWithThorin {...{ Component, pageProps }} />
        </ThorinThemeProvider>
      </QueryProviders>
    </I18nextProvider>
  )
}

export default MyApp
