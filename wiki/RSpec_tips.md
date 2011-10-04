---
title: RSpec tips
permalink: wiki/RSpec_tips/
layout: wiki
---

[The RSpec Book](http://pragprog.com/book/achbd/the-rspec-book)
を読んで、知らなかった部分のメモが主。

describe / context
==================

describe は example group をつくる。example group は 1 つのクラス
(RSpec::ExampleGroup::...) として表される。ネストした describe
は、外側の example group のサブクラスになる。

``` {.ruby}
describe "root" do
  it "print ancestors" do
    p self.class.ancestors # => [RSpec::Core::ExampleGroup::Nested_1]
  end
  describe "nested" do
    it "print ancestors" do
      p self.class.ancestors # => [RSpec::Core::ExampleGroup::Nested_1::Nested_1, RSpec::Core::ExampleGroup::Nested_1]
    end
  end
end
```

サブクラスなので、include や def
で定義したインスタンスメソッド、インスタンス変数、などが共有される。before
/ after / around フックも共有され、before は外側から順に、after
は内側から順に適用される

context は describe の alias なので、まったく同じように動作する。

pending の使い方
================

-   ブロックなしの it

単純に pending であることが示される。まだなにも example
を書いていないが、忘れないために書く。

-   it ブロック中の pending (ブロックなし)

pending が書かれた時点で example の評価を止める。適切な example
を書いていない状態。

-   it ブロック中の pending (ブロックあり)

pending に渡すブロックが失敗すれば pending、成功すれば failure
になる。すぐに成功させる必要のない example
に。コードを修正し、成功すれば pending ブロックを削除する。

before / after / around
=======================

after は before や example 中でエラーが起こったり failure
しても実行される。around の yield 以降は同じ状況では実行されない (begin
... ensure 文が必要)。可読性に劣るので通常は before / after を使う
(around を定義するクラスメソッドをつくるなどはありうる)。

``` {.ruby}
# around の書き方
around do |example|
  foo
  example.run
  bar
end

around do
  foo
  yield
  bar
end
```

ヘルパーメソッド
================

describe ブロック中 で def したメソッドは it ブロック中で呼び出しできる
(describe で生成されるクラスのインスタンスメソッド呼び出し)。

``` {.ruby}
describe Foo do
  def new_foo
    Foo.new
  end  
  it "should create" do
    new_foo.should be_a(Foo)
  end
end
```

複数の example group で使用するなら module に抽出して、describe 中で
include する。

``` {.ruby}
module FooHelper
  def new_foo
    Foo.new
  end
end

describe Foo do
  include FooHelper
  it "should create" do
    new_foo.should be_a(Foo)
  end
end
```

さらに多くの example group で使うなら、下記のコードでモジュールを
include する。

``` {.ruby}
RSpec.configure do |config|
  config.include(FooHelper)
end
```

shared\_example\_for
====================

複数のコンテキストで同じ example group を使う場合 shared\_example\_for
でまとめ、it\_behaves\_like で使える。

shared\_example\_for ブロック内では before / after なども使える。

マクロのほうが柔軟だけど、意図が明確になる。

``` {.ruby}
shared_example_for "collection" do
  it "should be respond to each" do
    @collection.should be_respond_to(:each)
  end
end

describe Array do
  before(:each) do
    @collection = []
  end
  it_behaves_like "collection"
end

describe Hash do
  before(:each) do
    @collection = {}
  end
  it_behaves_like "collection"
end
```

Matcher
=======

Matcher の仕組みと作り方
------------------------

`should`、`should_not` のあとに続く (文法的には引数になる) 部分を
`matcher` と呼ぶ。`matcher` は下記のメソッドに応答するオブジェクト。

-   matches(actual) - should / should\_not
    のレシーバを引数にして呼ばれ、期待したものなら true / 異なれば false
    を返す。
-   failure\_message - should
    が失敗したときに呼ばれるメソッド。表示するメッセージを文字列で返す。
-   negative\_failure\_message - should\_not
    が失敗したときに呼ばれるメソッド。表示するメッセージを文字列で返す。

たとえば、ある数と一致することを期待する matcher は以下のようになる

``` {.ruby}
class IntegerMatcher
  def initialize(number)
    @expect = number.to_i
  end
  def matches?(actual)
    @actual = actual.to_i # メッセージで使うため、インスタンス変数に保存しておく
    @actual == @expect
  end
  def failure_message
    "#{@expect} expected, but was #{@actual}"
  end
  def negative_failure_message
    "Except #{@expect} expected, but was #{@actual}"
  end
end
```

使い方は下記の通り。

``` {.ruby}
describe "number" do
  it "1 equals 1" do
    1.should IntegerMatcher.new(1)
  end
  it "1 does not equal 2" do
    1.should_not IntegerMatcher.new(2)
  end
  it "1 equals 2" do
    1.should IntegerMatcher.new(2) # 2 expected, but was 1
  end
  it "1 does not equals 1" do
    1.should_not IntegerMatcher.new(1) # Except 1 expected, but was 1
  end
end
```

これをより DSL 的にする。

``` {.ruby}
describe "number" do
  def equal_integer(expected)
    IntegerMatcher.new(expected)
  end
  
  it "1 equals 1" do
    1.should equal_integer(1)
  end
  it "1 does not equal 2" do
    1.should_not equal_integer(2)
  end
  it "1 equals 2" do
    1.should equal_integer(2)
  end
  it "1 does not equals 1" do
    1.should_not equal_integer(1)
  end
end
```

この、クラスの定義とオブジェクト生成メソッドの定義を簡単に行うための仕組みがある。

``` {.ruby}
RSpec::Matchers.define :equal_integer do |expected|
  @expected = expected.to_i

  match do |actual|
    @actual = actual.to_i
    actual == expected
  end
  failure_message_for_should do |actual|
    "#{@expected} expected, but was #{@actual}"
  end
  failure_message_for_should_not do |actual|
    "Except #{@expected} expected, but was #{@actual}"
  end
  description do
    # Some description for this matcher
  end
end
```

これですべての Example Group で使えるので、通常はこの方法で定義する。
