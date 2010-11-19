---
title: Ruby tips
permalink: wiki/Ruby_tips/
layout: wiki
---

明示してなければたぶん 1.8.7 / 1.9.2 で動作するはず。

Rails については [Rails tips](/wiki/Rails tips "wikilink") 参照。

String\#inspect で16進数表記を返す
==================================

バイナリを扱うプログラムの開発時などに。16バイト毎に改行します。

``` {.ruby}
class String
  def inspect
    s, l = '', ''
    self.each_byte do |b|
      l << b.to_s(16).upcase.rjust(2, '0') + ' '
      if l.size >= 16 * 3
        s << l.strip + "\n"
        l = ''
      end
    end
    s << l.strip if l != ''
    s
  end
end
```

``` {.ruby}
# Usage
p 'labocho' #=> 6C 61 62 6F 63 68 6F
```

Base64 エンコード / デコード
============================

エンコード

``` {.ruby}
# Base64 Encoder
# Usage: ruby base64_encoder.rb binary_file
print [ARGF.binmode.read].pack("m").gsub(/[\r\n]/, '')
```

デコード

``` {.ruby}
# Base64 Decoder
# Usage: ruby base64_decoder.rb base64_file
STDOUT.binmode.print ARGF.binmode.read.unpack("m")[0]
```

IO\#binmode は Windows 環境で必要 (別の環境では無視される)。

本
==

<amazon locale="jp" id="4873113679">

%title%
-------

プログラマのための Ruby
入門。簡潔で正確。この本を読めばリファレンスマニュアルが理解できるようになり、かなりのことができるようになる。最初にこの本を読んでよかった。

[%url% %mediumimage%]

[%url% %title% / %author% 著. %publisher%, %publishedyear%, %pages%p.]
</amazon>

<amazon locale="jp" id="4048687158">

%title%
-------

マニアックに見えるが、Ruby をちゃんと使うためには必須と思える内容。Ruby
におけるクラス/モジュールとはどんなものなのか、特異メソッド/クラスとはなんなのか、Rails
の魔法はどのようにできているのかが理解できる。抽象的な概念も順を追ってやさしく解説してくれる。

[%url% %mediumimage%]

[%url% %title% / %author% 著. %publisher%, %publishedyear%, %pages%p.]
</amazon>
