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

複数人で使用することがわかっているなら、ディレクトリの所有グループを適切なものに設定し、--shared
オプションをつける。

``` {.bash}
$ git --bare init --shared
```

このリポジトリを追加して push する (name は origin など)

``` {.bash}
$ git remote add [name] ssh://[user]@[host]/~/git/[project].git
$ git push [name] master
```
