// ページが読み込まれたときに実行する初期化関数
const init = () => {
  // ナビゲーションのリンクをクリックしたときのイベントリスナーを設定
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
      link.addEventListener('click', event => {
          event.preventDefault(); // リンクのデフォルト動作を無効にする
          const pageId = link.getAttribute('href').substring(1); // リンクのhref属性からページIDを取得
          navigateToPage(pageId);
      });
  });

  // ページのハッシュ変更を監視して初期ページを設定
  window.addEventListener('hashchange', () => {
      const pageId = location.hash.slice(1);
      navigateToPage(pageId);
  });
  // 初期ページの読み込み
  navigateToPage(location.hash.slice(1));
};

// ページを表示する関数
const navigateToPage = pageId => {
  // スクリプト要素を削除
  const scripts = document.querySelectorAll('script[app-script]');
  scripts.forEach(script => {
      script.remove();
  });

  // スタイルシート要素を削除
  const styleSheet = document.getElementById('page-css');
  styleSheet.href = ''; // 空のhref属性を設定してスタイルシートを無効化

  // 対応するページのスクリプトを動的に追加
  const script = document.createElement('script');
  script.setAttribute('app-script', pageId);
  if(pageId === '') pageId = 'home';
  script.src = `pages/${pageId}.js`;
  script.onload = () => {
      // スクリプトがロードされたらコンテンツを表示
      displayContent(pageId);

      // 対応するページのCSSを動的に読み込む
      styleSheet.href = `styles/${pageId}.css`; // CSSファイルのパスを修正
  };
  document.body.appendChild(script);
};

// コンテンツを表示する関数
const displayContent = (pageId) => {
  // 対応するページのコンテンツを表示
  switch (pageId) {
      case 'home':
          renderHome();
          break;
      case 'about':
          renderAbout();
          break;
      default:
          break;
  }
}

// ページが読み込まれたときにinit関数を呼び出す
window.addEventListener('load', init);
