---
title: Ruby tips
permalink: wiki/Ruby_tips/
layout: wiki
---

明示してなければたぶん 1.8.7 / 1.9.2 で動作するはず。

Rails については [Rails tips](/wiki/Rails tips "wikilink") 参照。

多重代入で一部の要素を捨てる
============================

``` {.ruby}
# 通常の多重代入
first, second, third = [1, 2, 3]

# 先頭の要素を捨てる
*, second, third = [1, 2, 3]
*, third = [1, 2, 3]

# 末尾の要素を捨てる
first, second, * = [1, 2, 3]
first, * = [1, 2, 3]

# 中間の要素を捨てる
first, *, third = [1, 2, 3]
```

正規表現でキャプチャした部分を取得する
======================================

\$\~ あるいは Regexp.last\_match は、次に match
を呼ぶと上書きされ、また、\$1 や \$\~[1]
は可読性も悪いので、即座に変数に移してしまったほうがよい。\$\~.to\_a
だと、最初の要素はマッチした文字列全体なので、多くの場合不要。\$\~.captures
を使うとキャプチャした部分のみの配列が得られる。。

``` {.ruby}
# encoding: UTF-8
"2011年10月9日" =~ /(\d+)年(\d+)月(\d+)日/
year, month, day = $~.captures
```

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

相対パスで require するイディオム
=================================

``` {.ruby}
# 同じディレクトリの foo.rb を require
# __FILE__ はソースのパスなので #{__FILE__}/../ でソースがあるディレクトリを示す相対パスになる
require File.expand_path "../foo", __FILE__
```

定数の探索
==========

モジュール / クラス内の定数 (もちろんモジュール / クラスも含む)
を、外側のモジュール / クラス名::定数名 で参照できる。クラスの定義 /
オープン時にもこの記法は使えるが、素朴に module / class
文をネストした場合と定数の探索範囲が異なる。

モジュールを名前空間として使う場合、同じ名前空間内のクラスを参照するときに名前空間名を省略したいので、module
/ class 文のネストに統一したほうがよさそう。

``` {.ruby}
# モジュールで定数を定義
module M
  MODULE_CONSTANT = "MODULE_CONSTANT"
end

# ネストして記述した場合、外側のモジュール / クラスの定数が探索される
module M
  class C
    puts MODULE_CONSTANT # MODULE_CONSTANT
  end
end

# ::で記述した場合、外側のモジュール / クラスの定数が探索されない
class M::C
  puts MODULE_CONSTANT # NameError: uninitialized constant M::C::MODULE_CONSTANT
end
```

Ruby
リファレンスマニュアルの記述を参照すると、定数の探索は次の順で行われる。

1.  そのモジュール / クラス
2.  ネストしていれば外側のモジュール / クラス
3.  継承元のクラスを近い方から

トップレベルで定義した定数は Object クラスに属するので、3
の最後に探索される。 2
の「ネストしていれば」は、定数を参照するときのコンテキストが module /
class 文でネストしていれば、の意味。定数の定義時は module / class
文でネストしていようが、:: を使っていようが関係ない。

instance\_eval と class\_eval (module\_eval)
============================================

`Object#instance_eval` とは別に `Module#class_eval`
が定義されている。クラス /
モジュールをレシーバとする場合の挙動の違いをみる。

なお、`Module#class_eval` は `Module#module_eval`
のエイリアスだが、ここでは個人的な好みで `class_eval` で統一する。

まず `instance_eval`、`class_eval` ともに `self` はクラス自身を指す。

``` {.ruby}
String.instance_eval do
  p self # => String
end

String.class_eval do
  p self # => String
end
```

違いは `def` でメソッドを定義したときの挙動。

``` {.ruby}
# instance_eval ではクラスの特異メソッドが定義される
# (class << String ... end と同様)
String.instance_eval do
  def foo
    puts "foo"
  end
end
String.foo # => foo

# class_eval ではインスタンスメソッドが定義される
# (class String ... end と同様)
String.class_eval do
  def bar
    puts "bar"
  end
end
String.new.bar # => bar
```

なお、`define_method` は `Class` のインスタンスメソッドなので `self`
に依存する。 `self`
は同じなので、どちらもインスタンスメソッドが定義される

``` {.ruby}
String.instance_eval do
  define_method :baz do
    puts "baz"
  end
end
String.new.baz # => baz

String.class_eval do
  define_method :foobar do
    puts "foobar"
  end
end
String.new.foobar # => foobar
```

`class ... end` 文と同じように扱えるので、普通は `class_eval`
を使った方がわかりやすい。

instance\_exec と class\_exec (module\_exec)
============================================

`Object#instance_exec` と `Module#class_exec` はそれぞれ
`instance_eval`、`class_eval`
と同じように動作するが、引数をとり、実行するブロックに渡すことができる。

クラスの利用者からブロック / `Proc`
を受け取って、しかるべき時にインスタンス /
クラスのコンテキストで評価する、というようなケースで引数を渡せるので便利。

なお、例によって `Module#class_exec` は `Module#module_exec`
のエイリアス。

``` {.ruby}
class Person
  attr_accessor :name
  
  def self.register_greeting_proc(&block)
    @block = block
  end
  
  def self.block
    @block
  end
  
  def greeting(message)
    instance_exec(message, &self.class.block)
  end
end

Person.register_greeting_proc do |message|
  # instance_exec により self が Person のインスタンスになるので name を呼べる
  # また instance_exec の引数を仮引数 message で受け取れる
  puts "#{message}, my name is #{name}"
end

john = Person.new
john.name = "John"
john.greeting "Hello" # => Hello, my name is John
```

false をとりうる変数と nil ゲートに関する注意
=============================================

a ||= b や a = b if b のような、nil
ゲートはよく使うイディオムだが、false
をとりうる変数について使用する際には注意が必要。

``` {.ruby}
class Unexpected1
  attr_writer :flag

  def flag
    return @flag ||= true
  end
end

u = Unexpected1.new
u.flag # => true
u.flag = false
u.flag # => true
```

ここでは @flag が設定されていなければ (nil なら) true
をセットして返すことを想定しているが、flag= で false を代入しても、@flag
は falsy であるため、再度 true をセットして返してしまう。

``` {.ruby}
return @flag.nil? ? (@flag = true) : @flag
```

のように明確に nil かどうかをみる必要がある。

``` {.ruby}
class Unexpected2
  attr_accessor :flag
    
  def initialize
    @flag = true
  end

  def set(hash)
    @flag = hash[:flag] if hash[:flag]
  end
end

u = Unexpected2.new
u.flag # => true
u.set(:flag => false)
u.flag # => true
```

ここでは、hash[:flag] があれば (nil でなければ) @flag
にセットしているが、hash[:flag] が false なら if
節は成立しないため、@flag に false がセットされることはない。

``` {.ruby}
@flag = hash[:flag] if hash.has_key?(:flag)
```

のように、明確にそのキーの値があるかを調べた方がよい (この方法なら nil
が指定されていても調べられる)。

YAML や JSON のような構造のオブジェクトに対して再帰的に処理を加えるイディオム
=============================================================================

``` {.ruby}
def foo(obj)
  case obj
  when Array
    obj.map{|e| foo(e)}
  when Hash
    hash = {}
    obj.each do |k, v|
      hash[k] = foo(v)
    end
    hash
  else
    # なんらかの処理
    obj
  end
end
```

YAML から XML への変換
======================

active\_support/core\_ext で Hash\#to\_xml
が追加されるので、それを使う。

``` {.ruby}
require "active_support/core_ext"
require "yaml"

puts YAML.load_file(ARGV.shift).to_xml
```

Time\#strftime
==============

よく使う例

|規格|フォーマット|例|
|----|------------|---|
|ISO8601|%Y-%m-%dT%H:%M:%S%z|2011-11-07T14:10:02+0900|

一覧 (分類別にソート)

|分類|表記|意味|
|----|----|----|
|世紀|%C|世紀 (2009年であれば 20)|
|年|%Y|西暦を表す数|
|年|%y|西暦の下2桁(00-99)|
|月|%B|月の名称(January, February ... )|
|月|%b|月の省略名(Jan, Feb ... )|
|月|%h|%b と同等|
|月|%m|月を表す数字(01-12)|
|週|%U|週を表す数。最初の日曜日が第1週の始まり(00-53)|
|週|%V|ISO 8601形式の暦週 (01..53)|
|週|%W|週を表す数。最初の月曜日が第1週の始まり(00-53)|
|日|%d|日(01-31)|
|日|%e|日。一桁の場合、半角空白で埋める ( 1..31)|
|曜日|%A|曜日の名称(Sunday, Monday ... )|
|曜日|%a|曜日の省略名(Sun, Mon ... )|
|曜日|%u|月曜日を1とした、曜日の数値表現 (1..7)|
|曜日|%w|曜日を表す数。日曜日が0(0-6)|
|午前・午後|%P|午前または午後(am,pm)|
|午前・午後|%p|午前または午後(AM,PM)|
|時|%H|24時間制の時(00-23)|
|時|%I|12時間制の時(01-12)|
|時|%k|24時間制の時。一桁の場合、半角空白で埋める ( 0..23)|
|時|%l|12時間制の時。一桁の場合、半角空白で埋める ( 0..12)|
|分|%M|分(00-59)|
|秒|%S|秒(00-60) (60はうるう秒)|
|秒未満|%L|ミリ秒 (000.999)|
|秒未満|%N|秒の小数点以下。桁の指定がない場合は9桁 (ナノ秒)、%6N: マイクロ秒 (6桁)、%3N: ミリ秒 (3桁)|
|タイムゾーン|%Z|タイムゾーン|
|タイムゾーン|%z|タイムゾーン。UTCからのオフセット (例 +0900)|
|通算日|%j|年中の通算日(001-366)|
|通算秒|%s|1970-01-01 00:00:00 UTC からの経過秒|
|エスケープ|%n|改行 (\\n)|
|エスケープ|%t|タブ文字 (\\t)|
|エスケープ|%%|%自身|
|組み合わせ|%c|日付と時刻|
|組み合わせ|%D|日付 (%m/%d/%y)|
|組み合わせ|%F|%Y-%m-%d と同等 (ISO 8601の日付フォーマット)|
|組み合わせ|%R|24時間制の時刻。%H:%M と同等。|
|組み合わせ|%r|12時間制の時刻。%I:%M:%S %p と同等。|
|組み合わせ|%T|24時間制の時刻。%H:%M:%S と同等。|
|組み合わせ|%v|VMS形式の日付 (%e-%b-%Y)|
|組み合わせ|%X|時刻|
|組み合わせ|%x|日付|

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
