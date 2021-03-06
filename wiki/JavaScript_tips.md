---
title: JavaScript tips
permalink: wiki/JavaScript_tips/
layout: wiki
---

明示してなければ Firefox 3.6 で確認。

真偽値
======

false、undefined、null、0、NaN、空文字列 のみが falsy。 それ以外は [] も
{} も new Boolean(false) も truthy。

> undefined、null、0、NaN、または空文字列 ("")
> でない任意の値、および値が false である Boolean
> オブジェクトを含む任意のオブジェクトは、条件文に渡されたときに true
> と評価されます。
>
> [<https://developer.mozilla.org/ja/JavaScript/Reference/Statements/if>...else
> if...else - MDC]

正規表現中のメタ文字
====================

下記の文字はメタ文字なので、正規表現リテラル(等)の中で文字自体を示す際には
`\` (バックスラッシュ) でエスケープする必要がある。

-   `\^$*+?.()|{}[]`
-   `(?` に後続する `:=!`
-   `[]` 中の `-`

それぞれのメタ文字の意味については下記参照。

-   [RegExp - MDC Doc
    Center](https://developer.mozilla.org/ja/Core_JavaScript_1.5_Reference/Global_Objects/RegExp)

JavaScript URI / ブックマークレット
===================================

`javascript:` から始まる文字列を JavaScript URI と呼び、`a` 要素の
`href`
属性の値としたり、ブックマークレットとして使ったり、ロケーションバー
(アドレスバー) で実行したりできる。

> When a browser follows a javascript: URI, it evaluates the code in the
> URI and then replaces the contents of the page with the returned
> value, unless the returned value is undefined. The void operator can
> be used to return undefined.
>
> [void -
> MDC](https://developer.mozilla.org/en/JavaScript/Reference/Operators/Special_Operators/void_Operator)

コードを実行した結果、undefined
以外の返り値があると、ブラウザはその値を表示する。

たとえば

``` {.javascript}
javascript:1+1
```

とするとページ遷移して 2 が表示される。

返り値が undefined だとページ遷移しない。

``` {.javascript}
javascript:undefined // なにも起こらない
```

返り値が undefined となる (ページ遷移しない) 例
-----------------------------------------------

return しない function はつねに undefined を返す。2
行以上にわたるスクリプトならこれを使うのが簡単。

``` {.javascript}
(function(){})() === undefined; //true
```

void(expression) は expression を評価してつねに undefined を返す。

``` {.javascript}
void(1) === undefined; //true
```

alert() も undefined を返す。

``` {.javascript}
alert('alert') === undefined; //true
```

prompt
------

見た目は alert に似てる prompt() は、OK なら入力値、キャンセルなら null
を返すので、単体で JavaScript URI /
ブックマークレットに使うとページ遷移してしまう。void()
をかませるのが楽。

``` {.javascript}
void(prompt('Please copy.', 'Copy me!')) === undefined; //true
```

location.href
-------------

location.href に URL
を代入した場合は、コード全体の返り値にかかわらず、ページ遷移する。
(ちなみに、代入式は右辺を評価した結果を返すので location.href = 'url'
の返り値は 'url'となる)

``` {.javascript}
// 以下のいづれも http://penguinlab.jp/ に遷移する
javascript:location.href = 'http://penguinlab.jp/'
javascript:void(location.href = 'http://penguinlab.jp/')
javascript:(function(){location.href = 'http://penguinlab.jp/'; return false;})()
```

スクリプト中に画像を埋め込む
============================

(JavaScript に限らないけど)

`data:` から始まる文字列を data URI と呼び、Base64
エンコードしたデータを、`img` 要素の `src` 属性の値、`a` 要素の `href`
属性の値として使ったり、ロケーションバー (アドレスバー)
に入力して表示したりできる。

これを利用すれば、スクリプトや HTML ドキュメント、CSS
中に画像などのバイナリデータを埋め込むことができる。ユーザースクリプトやブックマークレットなどに。HTTP
リクエストをとにかく減らしたい時にも。

``` {.html4strict}
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAB3RJTUUH2AwJCy4XDsD1YwAAABd0RVh0U29mdHdhcmUAR0xEUE5HIHZlciAzLjRxhaThAAAACHRwTkdHTEQzAAAAAEqAKR8AAAAEZ0FNQQAAsY8L/GEFAAAABmJLR0QA/wD/AP+gvaeTAAAAy0lEQVR4nGNQWnKXJMRApga5nn341cEVgDSIpnYyMDDg0QOUAioAKkOxAS6EhtCMY8C0FI97sHg6yJsBDaEpYGIAgz8vHhosVwaitYsU0BBEHKgAopIBYiPQpP9vFYDo9ikU44FciDiQDXEYSENpDkgCSAJFgeT/HyvgCC4IUQB10kqFfeWNDGlxDJ31DF2NCgxfK+AIyAUKAqWACoDKoE6CuwriBjQEEYcHFAvEJywS8mccQQaUNzoxoAKIOFABwtNoQY6GqJT4iEcADHRd+HNHbvIAAAAASUVORK5CYII=" />
```

正確な書式は下記の通り。

> `
> dataurl    := "data:" [ mediatype ] [ ";base64" ] "," data<br/>
> mediatype  := [ type "/" subtype ] *( ";" parameter )<br/>
> data       := *urlchar<br/>
> parameter  := attribute "=" value<br/>
> ` - *[RFC2397: The "data" URL
> scheme](http://www.ietf.org/rfc/rfc2397.txt)*

まあだいたいこうなる。

    data:(MIMEタイプ);base64,(Base64 文字列)

-   [RFC2397: The "data" URL
    scheme](http://www.ietf.org/rfc/rfc2397.txt)
-   [data URI scheme - Wikipedia, the free
    encyclopedia](http://en.wikipedia.org/wiki/Data_URI_scheme)

組み込みオブジェクトの拡張
==========================

Math.randomInt(min, max)
------------------------

min 以上 max 以下の整数をランダムで返す。

``` {.javascript}
Math.randomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
```

``` {.javascript}
// 使い方
Math.randomInt(1, 10);
```

Array.prototype.compare(other)
------------------------------

配列を要素ごとに比較し、this が大きければ 1、同じなら 0、other
が大きければ -1 を返す。

より若いインデックスの要素を優先し、短絡する。要素数が異なる場合、少ない方に合わせる。

``` {.javascript}
Array.prototype.compare = function (other) {
  var i;
  for (i = 0; i < Math.min(this.length, other.length); i++) {
    if (this[i] < other[i]) {
      return -1;
    } else if (this[i] > other[i]) {
      return 1;
    }
  }
  return 0;
};
```

``` {.javascript}
// 使い方
[1, 1, 2].compare([1, 2, 1]); // -1 (引数に指定した配列のほうが大きい)
```

Array.prototype.shuffle()
-------------------------

配列の要素をランダムに並べ替える。this を返す。

上記の Math.randomInt を使用している。

``` {.javascript}
Array.prototype.shuffle = function () {
  var temp, count, i;
  temp = [];
  count = this.length;

  for (i = 0; i < count; i++) {
    temp[i] = this[i];
  }
  
  for (i = 0; i < count; i++) {
    this[i] = temp.splice(Math.randomInt(0, temp.length -1), 1)[0];
  }
  return this;
};
```

``` {.javascript}
// 使い方
[1, 2, 3].shuffle() //=> [2, 1, 3] など
```

文字列中の変数展開
==================

-   [404 Blog Not Found:javascript -
    Interpolatorで変数展開](http://blog.livedoor.jp/dankogai/archives/50665223.html)

`new Interpolator('#{', '}')` とすれば Ruby 風の表記も可能。とても便利。

script タグ中は HTML コメントに
===============================

HTML の script タグ中に JavaScript を記述する場合、HTML
コメント中に書く。大昔に、JavaScript
が有効でないブラウザで表示しないように、とか読んだけど、そういうわけではない。下記の例を見るとわかる。

``` {.html4strict}
<script>
<!--
  alert('</script>');
//-->
</script>
```

この例で、もしコメントがないと、alert の途中で script
タグが終わってしまう。ここまで極端な例はなくとも、スクリプト中に HTML
タグを直接書くケースは多く、HTML の構造を壊してしまう可能性がある。\<!--
--\> 内なら HTML パーサに影響を与える心配がない。

ただし、コメントの終わりをしめす --\>
だけはそのまま書けない。書くケースも思いつかないが、そのときは、文字列連結なりなんなりでお茶を濁そう。

XHTMLなら下記のほうが適切か。

``` {.xml}
<script>
<![CDATA[
  alert('</script>');
]]>
</script>
```

本
==

<amazon locale="jp" id="4873113911">

%title%
-------

歴史的経緯により、言語仕様も周辺の情報もカオスな
JavaScript。この本ではリテラルや文法など基本的な言語仕様をまず押さえ、そのうえで「良いパーツ」とそれを使ったプログラミングの方法が紹介される。JavaScript
に対する印象が一変した。

[%url% %mediumimage%]

[%url% %title% / %author% 著. %publisher%, %publishedyear%, %pages%p.]
</amazon>
