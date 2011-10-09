---
title: Git メモ
permalink: wiki/Git_メモ/
layout: wiki
---

リモートサーバにリポジトリをつくる
==================================

``` {.bash}
$ mkdir -p ~/git/[project].git
$ cd ~/git/[project].git
$ git --bare init
```

このリポジトリを追加して push する (name は origin など)

``` {.bash}
$ git remote add [name] ssh://[user]@[host]/~/git/[project].git
$ git push [name] master
```
