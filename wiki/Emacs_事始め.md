---
title: Emacs 事始め
permalink: wiki/Emacs_事始め/
layout: wiki
---

あこがれのエディタ emacs を使いはじめてみたのでメモ。

目標
====

Mac / Windows それぞれ複数の端末で同じように使いたい。Textmate
のかわりに Rails アプリケーションの開発に使いたい。

インストール
============

Windows
-------

[GNU Emacs - GNU Project - Free Software Foundation
(FSF)](http://www.gnu.org/software/emacs/) からリンクをたどって
[emacs-23.2-bin-i386.zip](ftp://ftp.ring.gr.jp/pub/GNU/emacs/windows/emacs-23.2-bin-i386.zip)
をダウンロード。
とくにインストーラなどはなく、`[展開したフォルダ]/bin/runemacs.exe`
で起動できる。

Mac OS X
--------

[GNU Emacs For Mac OS X](http://emacsformacosx.com/) から
[Emacs-23.2-universal-10.6.3.dmg](http://emacsformacosx.com/emacs-builds/Emacs-23.2-universal-10.6.3.dmg)
をダウンロード。ダウンロードした dmg を開いて Emacs アイコンを
Application フォルダにドラッグ&ドロップすればインストール完了。

設定ファイル
============

emacs は起動時に \~/.emacs、\~/.emacs.el、\~/.emacs.d/init.el
を読みにいく。どれに起動時実行スクリプトを書いても良いが、.emacs.d
にまとめたほうが楽なので、\~/.emacs.d/init.el にする。

\~/ のパスは下記の通り。

|Windows XP|C:\\Documents and Settings\\[ユーザー名]\\Application Data|
|----------|----------------------------------------------------------|
|Windows Vista|C:\\Users\\[ユーザー名]\\AppData\\Roaming|
|Mac OS X|/Users/[ユーザー名]|
|Linux|/home/[ユーザー名]|

Dropbox を使った共有
--------------------

既存の .emacs.d を Dropbox にコピーし、シンボリックリンク /
ジャンクションをはる。

    # Mac OS X で操作
    cp -r ~/.emacs.d ~/Dropbox/Application/emacs.d
    mv ~/.emacs.d ~/.emacs.d.bak
    ln -s ~/Dropbox/Application/emacs.d ~/.emacs.d

Windows XP では [リンク作成シェル拡張for Windows
2000/XP](http://www.vector.co.jp/soft/winnt/util/se184746.html)
を使い、Dropbox 上の emacs.d フォルダを右ボタンドラッグ、 C:\\Documents
and Settings\\[ユーザー名]\\Application Data
下でドロップして「リンクを作る」。あとはコマンドプロンプトで emacs.d
を.emacs.d に変更。

キー
====

|Emacs|Windows 等|Mac|
|-----|----------|---|
|C|Ctrl|control|
|M|Alt|option|
|RET|Enter|return|

チュートリアル
==============

起動すると Emacs Tutorial
と書かれたリンクがあるのでクリックする(か、TABでカーソル移動してRET)。
わかりやすいチュートリアルなので、ちょっと長いけど全部読む。

GNU Emacs for Mac OS X
では、英語のチュートリアルになってしまうので、メニューから Help -\>
Emacs Tutorial (choose language)... を実行。「Japanese」と入力して RET。

設定のための準備
================

参考にしたページ。

-   [Emacs ビギナーに贈る、これからバリバリ使い隊!!人のための設定講座
    その1。 -
    日々、とんは語る。](http://d.hatena.ne.jp/tomoya/20090121/1232536106)
-   [Emacs(中略)設定講座 その2「elisp のインストールと設定編」。 -
    日々、とんは語る。](http://d.hatena.ne.jp/tomoya/20090124/1232822594)
-   [Emacs設定講座 その3「scratch バッファと eval(評価)」。 -
    日々、とんは語る。](http://d.hatena.ne.jp/tomoya/20090215/1234692209)
-   [もう初心者なんて言わせない、Anything で始まる Emacs 道。 -
    日々、とんは語る。](http://d.hatena.ne.jp/tomoya/20090423/1240456834)

elisp
=====

color-theme
-----------

[<http://download.savannah.gnu.org/releases/color-theme/color-theme.el.gz>](http://download.savannah.gnu.org/releases/color-theme/color-theme.el.gz)

    (require 'color-theme)
    (color-theme-dark-laptop)

背景の透明度変更
----------------

    ;; 背景のアルファ値を90%に
    (modify-all-frames-parameters
     (list (cons 'alpha '(90 90 90 90))))

ruby-electric
-------------

    ;; Ruby 補完
    (require 'ruby-electric)

ido
---

    ;; ファイル名補完
    ;; Interactively Do Things (highly recommended, but not strictly required)
    (require 'ido)
    (ido-mode t)

rinari
------

Rails 関係のコマンド。

    cd ~/.emacs.d/elisp
    git clone git://github.com/eschulte/rinari.git
    cd rinari
    git submodule init
    git submodule update

    ;; Rinari
    (add-to-list 'load-path "~/.emacs.d/elisp/rinari")
    (require 'rinari)

rhtml-mode
----------

RHTML のメジャーモード。

    cd ~/.emacs.d/elisp
    git clone git://github.com/eschulte/rhtml.git

    ;; rhtml-mode
    (add-to-list 'load-path "~/.emacs.d/elisp/rhtml")
    (require 'rhtml-mode)
    (add-hook 'rhtml-mode-hook
        (lambda () (rinari-launch)))

yasnippet
---------

スニペット。

    cd ~
    curl -O http://yasnippet.googlecode.com/files/yasnippet-bundle-0.6.1c.el.tgz
    tar zxvf yasnippet-bundle-0.6.1c.el.tgz
    mv yasnippet-bundle.el ~/.emacs.d/elisp/yasnippet-bundle.el

Rails 用のスニペット集。

    cd ~/.emacs.d/elisp
    git clone git://github.com/eschulte/yasnippets-rails.git

    ;; yasnippet-bundle
    (require 'yasnippet-bundle)
    (yas/initialize)
    (yas/load-directory "~/.emacs.d/elisp/yasnippets-rails/rails-snippets")

参考ページ
==========

-   [Emacs 初心者向け記事へのリンク集 - (rubikitch loves (Emacs Ruby CUI
    Books))](http://d.hatena.ne.jp/rubikitch/20090127/emacsnewbies)
-   [emacsとRinariで快適Rails開発！ -
    おもしろWEBサービス開発日記](http://d.hatena.ne.jp/willnet/20090110/1231595231)

