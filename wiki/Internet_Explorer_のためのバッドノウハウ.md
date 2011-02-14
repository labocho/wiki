---
title: Internet Explorer のためのバッドノウハウ
permalink: wiki/Internet_Explorer_のためのバッドノウハウ/
layout: wiki
---

Web 開発者 / デザイナーなら、無視したくてもできない、世界トップシェアの
Web ブラウザ、Internet Explorer
のためのバッドノウハウ集。まったく網羅的でも代表的でもありません。

画像送信時の Content-type
=========================

普通、フォームの <input type="file" /> で送信される JPEG
フォーマットのデータの Content-type は image/jpeg、PNG なら image/png
になるが、IEでは image/pjpeg、image/x-png で送信されるので、これらの
Content-type に対応しなければならない。8.0で確認。

HTTP エラーページの表示
=======================

404
などのHTTPエラーをサーバが返した場合、レスポンスボディを表示するのが普通だが、IEではデフォルトでは、レスポンスボディが512バイト以下なら、ブラウザが用意したエラーページを表示する。未確認。

-   [「ページが見つかりません」 -
    IEのHTTPエラーメッセージの簡易表示をサーバー側で無効化する方法](http://neta.ywcafe.net/000558.html)

ブックマーク (レット) の文字数制限
==================================

ブックマーク / ブックマークレットの URL に文字数制限がある。 [Rules for
Bookmarklets](http://subsimple.com/bookmarklets/rules.asp) より引用。

|ブラウザ|最大文字数|
|--------|----------|
|Netscape|\> 2000|
|Firefox|\> 2000|
|Opera|\> 2000|
|IE 4|2084|
|IE 5|2084|
|IE 6|508|
|IE 6 SP 2|488|
|IE 7 beta 2|2084|

DOCTYPE 宣言による挙動の変化
============================

これは IE に限らない。下記ページが詳しく、網羅的。

[hxxk.jp - DOCTYPE スイッチについてのまとめと一覧表 (HTML 5 や IE 8 Beta
2 のモードスイッチなどの情報も含んだ 2008 年版
)](http://hxxk.jp/2008/09/29/0118)

条件分岐コメント
================

`&lt;!--[if IE]&gt;(任意のHTML)&lt;![end if]--&gt;`
などの記法で、IEのみ、IEの特定のバージョンのみに適用する HTML
を記述できる。他のブラウザでは単にコメントとして無視される。

[About Conditional
Comments](http://msdn.microsoft.com/en-us/library/ms537512(v=vs.85).aspx)
