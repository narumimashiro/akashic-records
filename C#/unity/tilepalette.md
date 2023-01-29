# **Unity~Map作成~**

## **Unityで簡単にMap作成する**

マリオメーカーのように素材をステージに貼り付けていき、作成することが可能です。

## **その方法とは**

- 1．ステージを作成するためにまず初めにSceneの作成を行います。
- 2．次にSceneに2DObjectの**TitleMap**を配置します。(そうするとGridの画面がシーン上に出来上がります。)
- 3．Mapを埋めていく素材を表示するためにUnityのWindowタブから2D→**TilePalette**を選択します。(TilePaletteがないときはpackage managerから探してInstall)

## **物理演算を付与する**

AddComponentからTilemapCollider2DとCompositeCollider2Dを付与。
それぞれ何をするものかと言うと、TileMapCollider2DはMapTipひとつひとつに物理判定などを付与するものです。が、一つ一つに物理判定を付与するとPlayerが引っかかってしまうなどの不便さが起きたり、処理が重くなったりするので、CompositeCollider2Dを使い、Maptip単位ではなく、Maptipの塊単位で見てくれるようにします。

また、Rigidbody2Dが一緒に追加されると思いますが、そこのBodyTypeをDynamicからStaticに変更します。これは動的コンポーネントではなく、静的コンポーネントであることを明示して処理軽減に繋げています。