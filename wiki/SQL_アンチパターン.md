---
title: SQL アンチパターン
permalink: wiki/SQL_アンチパターン/
layout: wiki
---

[Bill Karwin "SQL Antipatterns: Avoiding the Pitfalls of Database
Programming"](http://pragprog.com/book/bksqla/sql-antipatterns)
の読書メモ。

Jaywalking
==========

目的
----

ある属性について、複数の値を持たせる。

アンチパターン : カンマ区切りリスト
-----------------------------------

カンマ区切りで複数の値を 1 つの列に納める。

例では、特定の製品についての担当者を複数設定するのにカンマ区切りで、担当者のアカウントIDを記述している。

``` {.sql}
create table products (
  product_id integer,
  product_name varchar(1000),
  acount_id varchar(100), -- comma separated list
  -- ...
);
insert into products (product_id, product_name, account_id)
  values (DEFAULT, 'Product #1', '12,34')
```

-   特定のアカウントが担当している製品を取得しづらい
-   特定の製品を担当してるアカウントを取得しづらい
-   集合演算 (COUNT, SUM, AVG など) が難しい
-   特定の製品の担当者の更新が難しい
-   不正なアカウントIDの検証ができない
-   区切り文字の統一を強制できない
-   関連レコードの数がIDの長さと列の長さに制限され、予測もしにくい

アンチパターンが有効な場合
--------------------------

-   パフォーマンス向上のための非正規化
    (この場合でも正規化された状態から行うべき)
-   カンマ区切りする個々の内容をデータベースで扱うことがない場合
    (そのまま保持、出力するだけなど)

解決策 : 関連テーブルの作成
---------------------------

多対多の関連を実現する関連テーブル (intersection table) を作成する

``` {.sql}
create table contacts (
  product_id bigint unsigned not null,
  account_id bigint unsigned not null,
  primary key (product_id, account_id),
  foreign key (product_id) references products(product_id),
  foreign key (account_id) references accounts(account_id),  
);
insert into contacts (product_id, account_id)
  values (123, 12), (123, 34), (345, 23);
```

``` {.sql}
-- 特定のアカウントが担当している製品の取得
select p.* from products as p join contacts as c on (p.product_id = c.product_id ) where c.acount_id = 123;

-- 特定の製品を担当してるアカウントの取得
select a.* from accounts as a join contacts as c on (a.account_id = c.account_id) where c.product_id = 123;

-- 集合演算
select product_id, count(*) as accounts_per_product from contacts group by product_id;

-- 特定の製品の担当者の更新
insert into contacts (product_id, account_id) values (123, 45);
delete from contacts where product_id = 123 and account_id = 45;

-- 不正なアカウントIDの検証
-- 型、NOT NULL 制約、外部キー制約により検証できる。

-- 区切り文字の統一
-- 区切り文字は使用しない。

-- 関連レコードの数の制限
-- テーブルあたりの行数、ID長にのみ制限を受ける。

-- パフォーマンス向上
-- index がきくので、パフォーマンスが向上する。
```

Naive Trees
===========

目的
----

ツリー構造の保存と取得。組織図、コメントスレッド。

-   ツリー構造では、それぞれの要素を node と呼び、1つの親 node
    と複数の子 node を持つ。
-   最上位階層の node は親を持たず root と呼び、最下位階層の node
    は子を持たず leaf と呼ぶ。中間の node は nonleaf node と呼ぶ。

アンチパターン : 常に親に依存する
---------------------------------

同じテーブルの別のレコードの ID を親レコードの ID として持つ (root
の場合 NULL)。この構造は adjacency list と呼ぶ。
ここでは、あるバグについてのコメントスレッドを実現するものとする。

``` {.sql}
create table comments (
  comment_id serial primary key,
  parent_id bigint unsigned,
  bug_id bigint unsigned not null,
  author bigint unsigned not null,
  comment_date datetime not null,
  comment text not null,
  foreign key (parent_id) references comments(comment_id),
  foreign key (bug_id) references bugs(bug_id),
  foreign key (author) references accounts(account_id)  
)
```

-   直接の子、親を得るのは簡単
-   あるバグについてのすべてのコメントを得ることは可能だが、数が多すぎる場合がある
-   特定のレコードの子孫すべて (subtree)、先祖すべてを得るのが難しい (1
    階層ごとに JOIN が必要)
-   subtree の集合演算が難しい
-   leaf の追加、subtree の移動は簡単
-   nonleaf node
    の削除は難しい。素朴な方法では末端から順に削除していかなければならない
    (ON DELETE CASCADE で自動化はできる)。
-   nonleaf node の削除時、子 node を移動する場合、複数の文が必要

アンチパターンが有効な場合
--------------------------

-   直接の子、親を得られる、追加が簡単、という要件だけでよれけば問題ない
-   SQL99 では WITH キーワードでこの構造をサポートし (psql \>= 8.4
    など)、完全な子孫ノード・先祖ノードの取得ができる

解決策 1 : パス列挙 (Path enumeration)
--------------------------------------

先祖ノードと自身の ID
をファイルシステムのパスのように区切り文字で区切って保持する。

``` {.sql}
create table comments (
  comment_id serial primary key,
  path varchar(1000),
  bug_id bigint unsigned not null,
  author bigint unsigned not null,
  comment_date datetime not null,
  comment text not null,
  foreign key (bug_id) references bugs(bug_id),
  foreign key (author) references accounts(account_id)  
);
insert into comments (path, ...) values ('1/4/6/7/');
```

先祖ノード、子孫ノードは、path の前方・後方一致で得られる

``` {.sql}
-- id = 7 のノードの先祖ノードを取得 (パスが 1/4/6/7/ に含まれるノード)
-- path が 1/, 1/4/, 1/4/6/, 1/4/6/7/ のレコードがヒット
select * from comments where '1/4/6/7/' like path || '%';
-- id = 4 のノードの子孫ノードを取得 (1/4/ がパスに含まれるノード)
-- path が 1/4/, 1/4/6/, 1/4/6/7/ ... のレコードがヒット
select * from comments where path like '1/4/' || '%';
-- subtree が完全なかたちで得られるので集合演算も可能
```

-   node の追加は leaf か non leaf かに関わらず、親の path に自身の id
    を加えるだけでよい
-   ただし ID が自動生成の場合、INSERT 後に UPDATE する必要がある
-   前項の Jaywalking と同じデメリットを持つ

解決策 2 : 入れ子のセット (Nested set)
--------------------------------------

個々のノードが「左側の座標」「右側の座標」を持ち、親ノードはすべての子ノードを包含する座標を持つ。

    1---------------(1)---------------14
     2--(2)--5 6--------(5)---------13  
      3-(3)-4   7-(4)-8 9---(6)---12
                         10-(7)-11 

``` {.sql}
create table comments (
  comment_id serial primary key,
  nsleft integer not null,
  nsright integer not null,
  bug_id bigint unsigned not null,
  author bigint unsigned not null,
  comment_date datetime not null,
  comment text not null,
  foreign key (bug_id) references bugs(bug_id),
  foreign key (author) references accounts(account_id)  
);
insert into comments (nsleft, nsright, ...) values (2, 7, ...);
```

``` {.sql}
-- comment_id = 4 と子孫ノードを取得 (左座標が comment_id = 4 の範囲に含まれるノード)
select c2.* from comments as c1
  join comments as c2 on c2.nsleft between c1.nsleft and c1.nsright
  where c1.comment_id = 4;

-- comment_id = 6 と先祖ノードを取得 (comment_id = 6 の左座標を範囲に含むノード)
select c2.* from comments as c1
  join comments as c2 on c1.nsleft between c2.nsleft and c2.nsright
  where c1.comment_id = 6;
```

-   nonleaf node
    を削除すると、それだけで子ノードは新たな親ノードに所属する
-   親ノード、子ノードだけを得るのは難しい
-   追加、移動はかなり面倒、座標の割り当てがまずいと、大量のノードを更新する必要がある

subtree を得るのが速く、簡単、path enumeration
と比べ、数の制限がなく、型の制約は行える。ただし、更新が大変。

解決策 3 : Closure Table
------------------------

ノード自身を含む、すべてのノードの関係を別のテーブルに保持する。

``` {.sql}
create table comments (
  comment_id serial primary key,
  bug_id bigint unsigned not null,
  author bigint unsigned not null,
  comment_date datetime not null,
  comment text not null,
  foreign key (bug_id) references bugs(bug_id),
  foreign key (author) references accounts(account_id)  
);

create table tree_paths (
  ancestor bigint unsigned not null,
  descendant bigint unsigned not null,
  primary key (ancestor, descendant),
  foreign key (ancestor) references comments(commment_id),
  foreign key (descendant) references comments(commment_id),   
);
```

      1
     / \
    2   4
    |  / \
    3 5   6
          |
          7

``` {.sql}
insert into tree_paths (ancestor, descendant) values
  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7),
  (2, 2), (2, 3),
  (3, 3),
  (4, 4), (4, 5), (4, 6), (4, 7),
  (5, 5),
  (6, 6), (6, 7),
  (7, 7);
```

``` {.sql}
-- comment_id = 4 の子孫ノードを取得
-- ancestor が 4 の tree_paths.descendant
select c.* from comments join tree_paths as t
  on c.comment_id = t.descendant
  where t.ancestor = 4;

-- comment_id = 6 の先祖ノードを取得
-- descendant が 6 の tree_paths.ancestor
select c.* from comments join tree_paths as t
  on c.comment_id = t.ancestor
  where t.descendant = 6;

-- ノードを追加する場合は、自身を ancestor, descendant 両方にもつ tree_paths レコードを追加し
-- 親レコードを descendant にもつレコードをすべてコピーし descendant を自身の id にする
-- 下記は comment_id = 5 の子として comment_id = 8 のノードを追加した場合
insert into tree_paths (ancestor, descendant)
  select 8, 8
  union
  select t.ancestor, 8 from tree_paths as t where t.descendant = 5;

-- leaf node である comment_id = 7 のパスの削除
delete from tree_paths where descendant = 7;

-- comment_id = 4 の子孫ノードのパス削除
-- ancestor が 4 である descendant を descendant に持つパスを削除
delete from tree_paths where descendant in (select descendant from tree_paths where ancestor = 4);
```

-   パスを削除してもノード自体は削除されない。個々のノードが独立しており、関係だけを別のテーブルで管理していると考えられる。
-   外部キー制約があるので、参照整合性も担保できる。
-   単純なツリーだけでなく、複数の root に属することもできる
    (逆に言えば単純なツリーに限定できず、複雑なネットワークになってしまう可能性がある)。
-   個々のノードの距離を示す (自己参照は 0、親子は 1 ...)
    tree\_paths.path\_length を追加すれば、親や子、任意の深さの subtree
    を得ることもできる。
-   極端にレコードが増える可能性がある。

ID Required
===========

目的 : 主キーを設定する
-----------------------

すべてのテーブルに主キーを設定する。

アンチパターン : One size fits all (1 つのサイズをすべてに合わせる)
-------------------------------------------------------------------

本やフレームワークでは、よく下記のような主キーがすべてのテーブルで使用される。

-   列名は id
-   型は 32 / 64 bit の整数
-   自動で unique な値を生成

が、問題がある場合がある。

-   自然主キーになりうる列がある (しばしば UNIQUE 制約がある)
-   主キーがあるからといって、本来 UNIQUE にすべき列 (または複数の列) を
    UNIQUE にせず重複レコードを許してしまう (UNIQUE
    制約があるのならそれを主キーにできるので id は必要ない)
-   意味が不明瞭 id より bug\_id や account\_id としたほうがよい
-   1 つ上に書いた命名規則に従っていると、関連するキーの名前が同じになり
    USING が使える

``` {.sql}
-- この 2 文は等価
select * from bugs join bug_products on bugs.bug_id = bug_products.bug_id;
select * from bugs join bug_products using (bug_id);
```

-   複合キーが適切なケース

アンチパターンが有効な場合
--------------------------

-   フレームワークの規約 (ただし ActiveRecord
    を含め、たいてい回避策が用意されている)
-   自然主キーとなりうる列の値が大きく、インデックスにコストがかかりすぎる
    (長い文字列など)

解決策 : Taillored to fit (フィットするよう仕立てる)
----------------------------------------------------

-   自然な場合、主キーと外部キーの名前が同じようにする (account\_id
    を参照する外部キー名を reported\_by など、自然な名前を使ってもよい)
-   自然キー、自然複合キーを使う

Keyless Entry
=============

目的 : データベース構造の簡素化
-------------------------------

列、複数列の外部キーに外部キー制約をつける。

アンチパターン : 制約をかけない
-------------------------------

-   追加時に親レコードがあるかを調べるクエリが必要
-   削除時に子レコードがあるかを調べるクエリが必要
-   上のようなチェックを入れても追加・削除の前に状態が変わってしまうかもしれない
-   不整合データがないかをチェックするスクリプトが必要になったり
-   アプリケーションにバグがなくても直接 SQL 発行して不整合になるかも
-   制約をかけると、削除時に子レコードの削除が必要、更新は不可能?
    (Catch-22) これはあとでみる

アンチパターンが有効な場合
--------------------------

-   外部キー制約が使えない DB を使わざるを得ない場合
    (この場合整合性を維持するスクリプトが必要になる)
-   柔軟性のために外部キー制約を使えない場合 (これは
    Entity-Attribute-Value や Polymorphic Associations
    など他のアンチパターンを使っている可能性がある)

解決策 : 制約をかける
---------------------

-   制約をかけることで整合性をたもつためのコードを大幅に削減できる
-   ON UPDATE, ON DELETE で更新・削除時の処理を自動化できる (CASCADE,
    RESTRICT, SET DEFAULT など)
-   オーバーヘッドはない、というか整合性チェックのためのクエリが削減できるため、結果的にパフォーマンスは向上する

Entity-Attribute-Value
======================

目的
----

レコードによって異なる属性を持たせる。 例では Bug と FeatureRequest
を扱いたい。これらは共通する属性 (Issue としての属性)
を持ち、またそれぞれ固有の属性を持つ。

アンチパターン : 汎用属性テーブル
---------------------------------

下記の 3 つの列をもつテーブルを作成する。この構造は
Entity-Attribute-Value (EAV), open schema, schemaless, name-value pairs
などと呼ばれる。

-   Entity : 親テーブルを参照する外部キー
-   Attribute : 属性名
-   Value : 値

``` {.sql}
create table issues (
  issue_id serial primary key
);
insert into issues (issue_id) values (1234);

create table issue_attributes (
  issue_id bigint unsigned not null,
  attr_name varchar(100) not null,
  attr_value varchar(100),
  primary key (issue_id, attr_name),
  foreign key (issue_id) references issues(issue_id)
);
insert into issue_attributes (issue_id, attr_name, attr_value) values
  (1234, 'product', '1'),
  (1234, 'status', 'NEW'), ...
```

-   列の数が非常に少なくてすむ
-   属性の数が限定されない
-   不要な列がない

-   特定の属性を取り出すクエリが通常のテーブルよりややこしい
-   通常の列 x 行のかたちで取り出すクエリがかなりややこしい
-   整合性を担保できない
    -   必須の属性を定義できない
    -   型を指定できない
        (通常、文字列型だが、文字列以外のものを正しく扱う仕組みがない /
        型の数だけ列を増やすのはクエリをさらにややこしくする)
    -   外部キー制約をつけられない
    -   属性名を限定できない

アンチパターンが有効な場合
--------------------------

本当に EAV
が必要になるケースは少ない。リスクを理解して使用する場合でも、極力抑制して使用する。それでも短期間のうちに
EAV テーブルは扱いにくくなる。
リレーショナルでない柔軟なデータを扱う必要があるなら、NoSQL
データベースを使うべき。が、この場合でも上に挙げたうちいくつかの弱点をもつ。

解決策 1 : 単一テーブル継承 (Single Table Inheritance)
------------------------------------------------------

subtype
が必要とするすべての列と、レコードタイプを保持する列をもつテーブルを作成する。

``` {.sql}
create table issues (
  issue_id serial primary key,
  reported_by bigint unsigned not null,
  product_id bigint unsigned,
  priority varchar(20),
  version_resolved varchar(20),
  status varchar(20),
  issue_type varchar(20), -- BUG または FEATURE
  severity varchar(20), -- bug 用
  version_affected varchar(20), -- bug 用
  sponser varchar(20), -- feature 用
  foreign key (reported_by) references accounts(account_id),
  foreign key (product_id) references products(product_id)
);
```

-   どの属性がどの subtype に関連しているかを指定する方法はない
-   subtype 固有の属性が少ない場合は便利
-   ActiveRecord では type 列と継承で簡単に実現できる

解決策 2 : 具象的テーブル継承 (Concrete Table Inheritance)
----------------------------------------------------------

subtype
ごとにテーブルを作る。個々のテーブルに含まれる属性はのいくつかは共通しているが無関係。

``` {.sql}
create table bugs (
  issue_id serial primary key,
  reported_by bigint unsigned not null,
  product_id bigint unsigned,
  priority varchar(20),
  version_resolved varchar(20),
  status varchar(20),
  severity varchar(20), -- bug 用
  version_affected varchar(20), -- bug 用
  foreign key (reported_by) references accounts(account_id),
  foreign key (product_id) references products(product_id)
);

create table feature_requests (
  issue_id serial primary key,
  reported_by bigint unsigned not null,
  product_id bigint unsigned,
  priority varchar(20),
  version_resolved varchar(20),
  status varchar(20),
  sponser varchar(20), -- feature 用
  foreign key (reported_by) references accounts(account_id),
  foreign key (product_id) references products(product_id)
);
```

-   subtype 名を保持する列や、別の subtype 固有の列が必要ない
-   subtype 固有の列に制約をかけられる
-   共通属性と subtype 固有属性を区別できない
-   共通属性を追加する場合、すべての subtype テーブルで行う必要がある
-   subtype
    のテーブルを見ても、似ているだけなのか、継承関係にあるのかわからない
-   basetype として扱う場合は UNION を使う (VIEW を定義すると便利)

``` {.sql}
create view issues as
  select bugs.*, 'bug' as issue_type from bugs
  union all
  select feature_requests.*, 'feature' as issue_type from feature_requests;
```

basetype として扱うことが少ない場合に有効。

解決策 3 : クラステーブル継承 (Class Table Inheritance)
-------------------------------------------------------

-   basetype のテーブルと、個々のsubtype のテーブルを持つ
-   共通する属性は basetype テーブルに、固有の属性は subtype
    テーブルに持つ
-   subtype は basetype テーブルを参照している

``` {.sql}
create table issues (
  issue_id serial primary key,
  reported_by bigint unsigned not null,
  product_id bigint unsigned,
  priority varchar(20),
  version_resolved varchar(20),
  status varchar(20),
  foreign key (reported_by) references accounts(account_id),
  foreign key (product_id) references products(product_id)
);

create table bugs (
  issue_id bigint unsigned primary key,
  severity varchar(20),
  version_affected varchar(20),
  foreign key (issue_id) references issues(issue_id)
);

create table feature_requests (
  issue_id bigint unsigned primary key,
  sponser varchar(20),
  foreign key (issue_id) references issues(issue_id)
);
```

-   basetype として扱う場合は、いくつ subtype があっても basetype
    テーブルだけを見ればよい
-   すべての subtype を left join すれば単一テーブル継承と同様に扱える
    (VIEW にしておくと便利)

basetype として扱うことが多いときに有効。

解決策 4 : 準構造化データ (Semistructed Data)
---------------------------------------------

subtype の属性を、BLOB な列に XML や JSON
などでシリアライズしたデータを保持する。Serialized LOB とも。

``` {.sql}
create table issues (
  issue_id serial primary key,
  reported_by bigint unsigned not null,
  product_id bigint unsigned,
  priority varchar(20),
  version_resolved varchar(20),
  status varchar(20),
  issue_type varchar(20), -- BUG または FEATURE
  attributes text not null, -- シリアライズしたデータ
  foreign key (reported_by) references accounts(account_id),
  foreign key (product_id) references products(product_id)
);
```

-   完全に自由な形式のデータを扱える
-   SQL
    でデータの内容を扱うことはほとんどできず、アプリケーションコードで扱う必要がある

subtype を限定できず、柔軟にデータを保持する必要がある場合に有効。

解決策 5 : 後処理 (Post-Processing)
-----------------------------------

すでに EAV
で保持しているデータを扱う場合は、単一の行を取得するのではなく、1 つの
entity に結びついたすべての行を取得し、アプリケーションコードで処理する
(どんな属性の行があるか予想できないため)。

Polymorphic Associations
========================

目的
----

複数の親テーブルを参照する。

アンチパターン
--------------

親テーブルの種類と、親レコードの ID を保持する。

``` {.sql}
create table Contents (
  comment_id serial primary key,
  issue_type varchar(20), -- "Bugs" or "FeatureRequests"
  issue_id bigint unsigned not null,
  author bigint unsigned not null,
  comment_date datetime,
  comment text,
  foreign key (author) references Accouts(account_id)
);
```

適切な利用
----------

参照整合性をアプリケーションコードに依存しているので、回避しなければならない。

解決策 1 : 関連テーブルつくる
-----------------------------

``` {.sql}
create table BugsContents (
    issue_id bigint unsigned not null,
    comment_id bigint unsigned not null,
    primary key (issue_id, comment_id),
    foreign key (issue_id) references Bugs(issue_id),
    foreign key (comment_id) references Comments(issue_id),
);

create table FeatureRequestsContents (
    issue_id bigint unsigned not null,
    comment_id bigint unsigned not null,
    primary key (issue_id, comment_id),
    foreign key (issue_id) references FeatureRequests(issue_id),
    foreign key (comment_id) references Comments(issue_id),
);
```

-   issue\_type カラムを持つ必要がない
-   このままだと 1 つのコメントが複数の親レコードに結びつく。comment\_id
    に UNIQUE
    制約をつけると制限できるが、両方の親テーブルには結びつきうる。

``` {.sql}
-- 子レコードの取得
select *
from BugsComments as b
  join Comments as c using (comment_id)
where b.issue_id = 1234;

-- 親レコードの取得
select *
from Comments as 
  left outer join (BugsComments join Bugs as b using (issue_id)) using (comment_id)
  left outer join (FeaturesComments join FeatureComments as b using (issue_id)) using (comment_id)
where c.comment_id = 1234;
```

解決策 2 : Common Super-Table つくる
------------------------------------

親テーブルのスーパークラスのようなテーブルを作成し、子レコードはこれに関連づける。

``` {.sql}
create table Issues (
  issue_id serial primary key
);

create table Bugs (
  issue_id bigint unsigned primary key,
  foreign key (issue_id) references Issues(issue_id),
  ...
);

create table FeatureRequests (
  issue_id bigint unsigned primary key,
  foreign key (issue_id) references Issues(issue_id),
  ...
);

create table Comments (
  commeny_id serial primary key,
  issue_id bigint unsigned not null,
  …
  foreign key (issue_id) references Issues(issue_id)
);
```

``` {.sql}
-- 親レコードの取得
select *
from Comments as c
  left outer join Bugs as b using  (issue_id)
  left outer join FeatureRequests as f using (issue_id)
where c.comment_id = 1234;

-- 子レコードの取得
select *
from Bugs as b
  join Comments as c using (issue_id)
where b.issue_id = 1234;
```

-   完全な参照整合性がある

Multicolumn Attributes
======================

目的
----

複数の値をもつ属性を保存する。

アンチパターン : 1 つの属性に複数の列をつくる
---------------------------------------------

必要な数、あるいは余裕を持たせて、1 つの属性について複数の列を用意する。

``` {.sql}
create table bugs (
  bug_id serial primary key,
  description varchar(1000),
  tag1 varchar(20),
  tag2 varchar(20),
  tag3 varchar(20)
);
```

-   検索時に複数の列を OR しなければならない (値 IN (列1, 列2, 列3)
    のような書き方もできる)
-   値の追加・削除時に他の値をチェックしなければならず、多分にアプリケーションコードに依存する
-   別の列に重複した値を挿入できてしまう
-   許容する値の数を増やす (列を追加する)
    ときに、クエリも変更する必要がある

アンチパターンが有効な場合
--------------------------

似たような値を保持する属性でも、その意味が別のものならば、列を分ける必要がある。

たとえば bugs テーブルに accounts テーブルを参照する外部キーが 2
つあるとして、一方がバグの報告者、もう一方がバグ修正の担当者なら、これらはそれぞれの列に保存すべき。

関連テーブルを作成し、それぞれのレコードに役割を示す列をつくることもできるが、これは
EAV アンチパターンに陥る。

解決策 : 依存テーブルの作成
---------------------------

``` {.sql}
create table tags (
  bug_id bigint unsigned not null,
  tag varchar(20),
  primary key (bug_id, tag),
  foreign key (bug_id) references bugs(bug_id)
);
```

``` {.sql}
-- 複数の列を指定する必要はない
select * from bugs join tags using (bug_id)
  where tag = "performance";

-- 2 つのタグがあるバグ
select * from bugs
  join tags as t1 using (bug_id)
  join tags as t2 using (bug_id)
  where t1.tag = "printing" and t2.tag = "performance";
```

-   追加・削除は単にレコードを追加・削除するだけ
-   primary key 制約により、重複した値が挿入されることはない
-   値の数に制限はない

Metadata Tribbles
=================

目的 : スケーラビリティ
-----------------------

大量のレコードがあっても、パフォーマンスを確保したい。

アンチパターン
--------------

テーブルを年度などごとに分割する。しばしばテーブル名に年が含まれる。

``` {.sql}
create table bugs_2008 (…);
create table bugs_2009 (…);
create table bugs_2010 (…);
```

-   レコード追加時には日付に基づいて、適切なテーブルを指定しなければならない。これに失敗すると、検索や集計に支障をきたす。
-   CHECK
    による制約で、不適切なレコードの追加を防ぐこともできる。ただし、毎年、新しいテーブルを追加するたびに、忘れずに制約を追加しなければならない。
-   日付を変更したら UPDATE でなく DELETE / INSERT
    で別のテーブルに移さなければならない。
-   分割したテーブルで UNIQUE
    制約をかけることはできない。主キーが重複しうる。
-   複数年度分を集計する場合、UNION
    を使う必要がある。新しいテーブルを作ったらおそらく修正する必要がある。
-   列を追加したら、すべてのテーブルで追加しなければならない。
-   分割した複数のテーブルを参照する外部キー制約はかけられない。
-   JOIN するときもすべてのテーブルを指定しなければならない。

下記のように新しい列を追加していく場合も似たような問題がおこる。

``` {.sql}
create table project_history (
  bug_fixed_2008 integer,
  bug_fixed_2009 integer,
  bug_fixed_2010 integer  
);
```

アンチパターンが有効な場合
--------------------------

アーカイブのために古いレコードを別のテーブルに移すのはいい使い方。これにより新しいレコードを納めるテーブルのサイズは小さく抑えられ、パフォーマンスは維持される。

解決策 1 : 水平パーティショニング (シャーディング)
--------------------------------------------------

物理的には分割されるが、1 つの論理的なテーブルとして扱える。

``` {.sql}
-- date_reported の年ごとに分割する
create table bugs (
  bug_id serial primary key,
  …
  date_reported date
) partition by hash (year(date_reported)) partitions 4;
```

-   間違って別の年のテーブルに挿入することはない
-   日付の変更も UPDATE で OK
-   複数年度にまたがるクエリでも複数のテーブルを指定する必要はない
-   上例では 4 つに分割しているが、5
    年目もいづれかのテーブルに割り振られる
    (テーブルを追加する必要はない)。
-   外部キー制約や JOIN も問題なし

解決策 2 : 垂直パーティショニング
---------------------------------

TEXT や BLOB など、データ量の大きな列を別のテーブルに移す。

``` {.sql}
create table product_installers (
  product_id bigint unsigned primary key,
  installer_image blob,
  foreign key (product_id) references products(product_id)
);
```

-   SELECT でワイルドカード ( \* )
    指定時に、無駄に大きな列を取得しないですむ。
-   (必要な列だけ SELECT
    する場合にもメリットがあるかは、本文からはわからなかった。)

解決策 3 : カラム分割の修正
---------------------------

アンチパターンの説明で、年度ごとに列を追加していたケースは、依存テーブルを作成すべき。

``` {.sql}
create table project_history (
  product_id bigint,
  year smallint,
  bugs_fixed int,
  primary_key (product_id, year),
  foreign key (product_id) refereces projects(project_id)
);
```

product ごと 1 レコードだったのを、product と year ごとに 1
レコードにしている。追加簡単。
