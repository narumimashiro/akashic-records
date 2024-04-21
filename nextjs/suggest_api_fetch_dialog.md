# API Fetch状態を表示するダイアログをライブラリ化のすゝめ

### ライブラリ化の提案のモチベーション

- ライブラリ化することで開発工数の削減

ダイアログコンポーネントを用いて、作成しスタイル調整等行っているが、ライブラリ化して表示するタイトルやBody文言をPropsとして渡すだけになれば、多少だが工数削減とメンテナンス性の向上が図れると思ったため

- ダイアログのOpenClose管理をAPIDialogに丸投げできる

現状APIのFetch状態を表示するダイアログはコンポーネントがFetchStateを監視して、useStateによるOpen状態の管理をしていると思うが、APIのStatus状態のダイアログを開く責務はコンポーネントが負う必要はなく、状態表示のダイアログ自身がFetch状態を監視して、自身で管理するという考え方も自然かと思ったため

また、自身に責務を負わせることで配置個所に柔軟性が生まれ、再利用性が圧倒的に高まるメリットがある

### サンプルコード

```ts
import { useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import Loading from '@/components/atom/loading'
import { API_STATUS, AptStatusType } from '@/hooks/useApiStatus'
import styles from './ApiFetchDialog.module.scss'

export type ApiFetchDialogProps = {
  apiStatus: AptStatusType // 監視したいAPIのFetchState
  colorTheme?: 'light' | 'dark'
  // ↓ 今まではダイアログから中身のPタグなど記述していたが、文言だけで良くなる ↓
  bodyLoading: {
    title?: string,
    bodyText: string[]
  }
  bodySuccess: {
    title?: string,
    bodyText: string[],
    buttonString?: string  // DefaultでOKのボタン
    onClick?: () => void // OK押下時のクリックイベントだが、基本的には閉じるだけを想定し、Undefinedを受け入れ
  }
  bodyFailed: {
    title?: string,
    bodyText: string[],
    buttonString?: string // DefaultでOKのボタン
    onClick?: () => void // OK押下時のクリックイベントだが、基本的には閉じるだけを想定し、Undefinedを受け入れ
  }
  resetApiState: () => void, // FetchStateをリセット(=Idle)にする関数を指定
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const ApiFetchDialog = ({
  colorTheme = 'light',
  apiStatus,
  bodyLoading,
  bodySuccess,
  bodyFailed,
  resetApiState,
  ...buttonProps
}: ApiFetchDialogProps) => {

  useEffect(() => {
    return () => resetApiState()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { t } = useTranslation()

  const displayDialog = apiStatus !== API_STATUS.IDLE ? 'dialog-visible' : 'dialog-hidden'

  const ariaLabelSuccess = bodySuccess.title ?? 'api_success_confirm_ok'
  const ariaLabelFailed = bodyFailed.title ?? 'api_failed_conform_ok'

  const successBtnStr = bodySuccess.buttonString ?? 'STRID_cmn_ok'
  const failedBtnStr = bodyFailed.buttonString ?? 'STRID_cmn_ok'

  const handlerConform = () => {
    if(apiStatus === API_STATUS.SUCCESS) {
      if(bodySuccess.onClick) bodySuccess.onClick()
    } else {
      // apiStatus === API_STATUS.FAILED
      if(bodyFailed.onClick) bodyFailed.onClick()
    }
    // Fetch reset function to close a dialog
    resetApiState()
  }

  return (
    <div className={styles[displayDialog]}>
      <div className={styles[`overlay-${colorTheme}`]}>
        <div className={`absolute-center ${styles[`dialog-${colorTheme}`]}`}>
          <div className={styles.containerWrap}>
            {
              apiStatus === API_STATUS.SUCCESS || apiStatus === API_STATUS.FAILED ? (
                <>
                  <div className={styles.contentsWrap}>
                    <h2 className={`text-2xl-bold ${styles.title}`}>
                      {apiStatus === API_STATUS.SUCCESS ? bodySuccess.title : bodyFailed.title}
                    </h2>
                    {
                      apiStatus === API_STATUS.SUCCESS ? (
                        bodySuccess.bodyText.map((sentence, index) => <p key={`{body-text-${index}}`}>{sentence}</p>)
                      ) : (
                        bodyFailed.bodyText.map((sentence, index) => <p key={`{body-text-${index}}`}>{sentence}</p>)
                      )
                    }
                  </div>
                  <div className={styles.bottomButton}>
                    <div className={styles[`horizon-${colorTheme}`]}></div>
                    <button
                      className={`text-xl-bold button-active-${colorTheme}`}
                      aria-label={apiStatus === API_STATUS.SUCCESS ? ariaLabelSuccess : ariaLabelFailed}
                      onClick={handlerConform}
                      {...buttonProps}
                    >
                      {apiStatus === API_STATUS.SUCCESS ? t(`${successBtnStr}`) : t(`${failedBtnStr}`)}
                    </button>
                  </div>
                </>
              ) : (
                // apiStatus === API_STATUS.LOADING
                <div className={styles.contentsWrap}>
                  <h2 className={`text-2xl-bold ${styles.title}`}>{bodyLoading.title}</h2>
                  {bodyLoading.bodyText.map((sentence, index) => <p key={`{body-text-${index}}`}>{sentence}</p>)}
                  <div className={styles.loading}>
                    <Loading />
                  </div>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}
```

```css
$border-radius-px: 5px;

.dialog-visible {
  display: block;
}

.dialog-hidden {
  display: none;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.overlay-light {
  @extend .overlay;
  background: rgba(0, 0, 0, 0.5);
}

.overlay-dark {
  @extend .overlay;
  background: rgba(0, 0, 0, 0.3);
}

.dialog-light {
  background: #FFFFFF;
  color: #000000;
  border-radius: $border-radius-px;
  transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  box-shadow: 0px 6px 9px -5px rgba(0,0,0,0.2), 0px 12px 17px 2px rgba(0,0,0,0.14), 0px 5px 25px 4px rgba(0,0,0,0.12);
}

.dialog-dark {
  background: #000000;
  color: #FFFFFF;
  border-radius: $border-radius-px;
  transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  box-shadow: 0px 6px 9px -5px rgba(255,255,255,0.5), 0px 12px 17px 2px rgba(255,255,255,0.34), 0px 5px 25px 4px rgba(255,255,255,0.32);
}

.horizon-light {
  border-top: 1px solid rgba(0, 0, 0, 0.5);
  width: 100%;
  margin: 0;
}

.horizon-dark {
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  width: 100%;
  margin: 0;
}

.contentsWrap {
  display: flex;
  flex-direction: column;
  padding: 20px;

  .title {
    margin: 0
  }
}

.button-radius {
  border-bottom-left-radius: $border-radius-px;
  border-bottom-right-radius: $border-radius-px;
}

.bottomButton {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 45px;
  @extend .button-radius;

  button {
    width: 100%;
    height: 100%;
    @extend .button-radius;
  }
}

.containerWrap {
  display: flex;
  flex-direction: column;
  width: 90vw;
  max-width: 390px;
  height: auto;
  min-height: 250px;
  max-height: 90svh;
}

.loading {
  margin-top: 25px;
}
```