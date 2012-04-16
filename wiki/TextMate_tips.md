---
title: TextMate tips
permalink: wiki/TextMate_tips/
layout: wiki
---

[TextMate](http://macromates.com/) についての tips。

よく使うショートカット
======================

|command + T|プロジェクト内のファイルを検索して開く|
|-----------|--------------------------------------|
|command + shift + F|プロジェクト内で検索・置換|
|command + R|実行 (Bundle 依存)|
|command + /|選択範囲をコメント / コメント解除 (Bundle 依存)|

日本語の表示・入力
==================

半角幅で日本語を表示できるフォントを導入
----------------------------------------

-   [TextMate で日本語をわりとまともに表示する -
    d.hetima](http://d.hatena.ne.jp/hetima/20061102/1162435711)

から ForMateKonaVe をダウンロード、インストール。
[TextMate]-[Preferences...]-[Font & Colors] で Font を ForMateKonaVe
に。

日本語入力プラグイン
--------------------

-   [TextMate stuff - hetima.com](http://hetima.com/textmate/index.html)

から CJK-Input.tmplugin をダウンロード。 \~/Library/Application
Support/TextMate/PlugIns/ にコピー。

プロジェクトで無視するファイル
==============================

[TextMate]-[Preferences]-[Advanced]-[Folder References] の File Pattern
でプロジェクトに追加するファイルのパターンを指定する。
デフォルトは下記の通り。

    !(/\.(?!htaccess)[^/]*|\.(tmproj|o|pyc)|/Icon\r|/svn-commit(\.[2-9])?\.tmp)$

ログファイルがプロジェクトに入ると、プロジェクト内検索時に邪魔なので、.log
を無視するようにする。

    !(/\.(?!htaccess)[^/]*|\.(tmproj|o|pyc|log)|/Icon\r|/svn-commit(\.[2-9])?\.tmp)$

Bundle の追加
=============

マニュアルでは svn リポジトリからとってくるよう書かれているが、github
に移行した模様。 公式の Bundle は [textmateのプロフィール -
GitHub](https://github.com/textmate) にある (.tmbundle
となっているもの)。

たとえば haskell.tmbundle を導入したい場合、[textmate/haskell.tmbundle -
GitHub](https://github.com/textmate/haskell.tmbundle) で [Git
読み込み専用] の URL を確認し
(git://github.com/textmate/haskell.tmbundle.git)、ターミナルで下記のようにコマンド実行
(要 git)。

    cd ~/Library/Application\ Support/TextMate/Bundles
    git clone git://github.com/textmate/haskell.tmbundle.git

Bundle の編集
=============

HTML 空タグ内での変換確定 return 無視
-------------------------------------

HTML で、空タグ内に日本語入力時、変換確定の return
押下時に、改行・インデントされるのを防ぐ。

[Bundles]-[Bundle Editor]-[Show Bundle Editor] を開き、[HTML]-[Special:
Return Inside Empty Open/Close Tags] を選択。

[Activation] の右の入力ボックスにフォーカスし、×ボタンをクリック。

Ruby のインデント調整
---------------------

デフォルトでは、Ruby
において、下記のようなコードのインデントがうまくいかない。

``` {.ruby}
hash = {
  :foo => {
    :name => "foo"
  },
  :bar => {
    :name => "bar"
  }
}

array = [{
  :foo => "foo"
}]
```

[Bundles]-[Bundle Editor]-[Show Bundle Editor] を開き、[Ruby]-[Indent]
を編集する。

    // 変更前
    decreaseIndentPattern = '^\s*([}\]]\s*$|(end|rescue|ensure|else|elsif|when)\b)';

    // 変更後
    decreaseIndentPattern = '^\s*([}\],]+\s*$|(end|rescue|ensure|else|elsif|when)\b)';

インデントレベルを上げる閉じ括弧類のパターンが、単独の } か ]
だけだったのを、}], のいづれかの 1 つ以上の連続に変更。

Git のエディタにする
====================

``` {.bash}
$ git config --global --unset-all core.editor
$ git config --global core.editor "mate -wl1"
```

ペースト時の自動インデントを無効化
==================================

YAML や HAML
などで、ペースト時に不要な自動インデントがされる場合、command + control
+ V で自動インデントなしでペーストできる。 これをデフォルトにしたいなら
Preferences -\> Text Editing -\> Re-indent pasted text
のチェックを外す。
