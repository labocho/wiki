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
ブックマークレットに使うとページ遷移してしまう。void をかませるのが楽。

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

(JavaScript tips というより HTML tips だけど。)

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

    dataurl    := "data:" [ mediatype ] [ ";base64" ] "," data
    mediatype  := [ type "/" subtype ] *( ";" parameter )
    data       := *urlchar
    parameter  := attribute "=" value

まあだいたいこうなる。

    data:(MIMEタイプ);base64,(Base64 文字列)

-   [RFC2397: The "data" URL
    scheme](http://www.ietf.org/rfc/rfc2397.txt)
-   [data URI scheme - Wikipedia, the free
    encyclopedia](http://en.wikipedia.org/wiki/Data_URI_scheme)

