---
title: SQL アンチパターン
permalink: wiki/SQL_アンチパターン/
layout: wiki
---

[Bill Karwin "SQL Antipatterns: Avoiding the Pitfalls of Database
Programming"](http://pragprog.com/book/bksqla/sql-antipatterns)
の読書メモ。

Jaywalking / 信号無視
=====================

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
