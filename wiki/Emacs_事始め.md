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

設定ファイル
============

emacs は起動時に \~/.emacs または \~/.emacs.el
を読みにいく。また、\~/.emacs.d が作成される。

\~/ のパスは下記の通り。

|Windows XP|C:\\Documents and Settings\\[ユーザー名]|
|----------|----------------------------------------|
|Windows Vista|C:\\Users\\[ユーザー名]\\AppData\\Roaming|
|Mac OS X|/Users/[ユーザー名]|
|Linux|/home/[ユーザー名]|

チュートリアル
==============

起動すると Emacs Tutorial
と書かれたリンクがあるのでクリックする(か、TABでカーソル移動してRET)。
わかりやすいチュートリアルなので、ちょっと長いけど全部読む。

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

参考ページ
==========

[Emacs 初心者向け記事へのリンク集 - (rubikitch loves (Emacs Ruby CUI
Books))](http://d.hatena.ne.jp/rubikitch/20090127/emacsnewbies)
