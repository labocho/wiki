---
title: MuseScore tips
permalink: wiki/MuseScore_tips/
layout: wiki
---

## ショートカットキー

- 音符を選択時
  - <span class="mac-key">S</span>: スラーの追加
  - <span class="mac-key">⇧S</span>: スタカートのトグル
  - <span class="mac-key">⌘↑/⌘↓</span>: 8 度上/下に
- アーティキュレーション、テキストを選択時
  - <span class="mac-key">⌘↑/⌘↓/⌘→/⌘←</span>: 1sp 分移動


## 全休符が左寄りになっている

See: [左側にずれてしまった全休符を一括で中央に配置したい - MuseScore](https://musescore.org/ja/node/20447)

Logic の MusicXML インポートすると必ずなる?
<br>
全休符自体でなく、小節を選択して delete。


## アーティキュレーションまとめて選択 (削除も可)

範囲選択して、そのうちの 1 つのアーティキュレーションを右クリック - `選択` - `選択範囲内の全ての類似した要素`
<br>
削除も可能。


## rit. - - -

1. 線 - テキストライン (VII ─┐) を追加
2. インスペクタで線のスタイルを `Wide dashed` に
3. 線のプロパティで始点のテキストを `rit.` に、終点のフックをなくす。


## 複数の短前打音 (acciaccatura)

1. 音符を選択してパレットの短前打音を複数回ダブルクリック
2. 短前打音を選択して音価を変更 (音価ツールバーまたは数字キーで)
3. スラッシュを選択してインスペクタから `表示` のチェックはずす

スラーは下記の手順でつける必要がある。

1. 1 つめの短前打音を選択
2. S キー押下 (またはパレットのスラーをダブルクリック)
3. スラーを選択して <span class="mac-key">⇧→</span> を必要なだけ押して、右アンカーが短前打音がかかっている音符になるようにする


## 移調楽器の記譜

記譜された音と実音の差は "譜表のプロパティ" の "記譜されているピッチから移調する" で設定する。

メニューの `音符`-`合奏調（実音）` にチェックが入っている場合は実音で表示され、チェックをはずすと移調楽器として表示される (楽譜を PDF などで出力する場合はチェックをはずす)。

テンプレートから作成した場合、コントラバスはデフォルトで移調楽器として設定されている。


## solo / gli altri や div. で一時的に譜表を分ける

1. `編集`-`楽器` から譜表を分けたいパートの譜表を選んで `譜表の追加`
2. 楽譜上で、そのパートの一番上の譜表を右クリックして `譜表のプロパティ` を表示、`段が空でも非表示にしない` にチェック ※この操作は必須ではない
3. `スタイル`-`一般` で `スコア` セクションの `空の譜表を隠す` にチェック、`最初の段では空の譜表を非表示にしない` のチェックをはずす

これで `連続ビュー` では常にすべての譜表が表示され、ページビューでは音符がある譜表のみ表示される。

なお、 **1 つめの譜表が非表示になると 2 つめ以降の譜表が表示されていてもパート名が表示されない不具合がある** ので、1 つの譜表でよい部分は 1 つめの譜表に書くこと。

## ファイル形式

保存時 `非圧縮 MuseScore ファイル (*.mscx)` を選択すると、XML で保存される。

git 等で管理する場合はこのほうがよい (diff は大量になるが見えなくはない)。

テキストエディタ等でバッチ処理することも一応可能 (データを壊す危険はあるが)。


## できない?

下記はやりかたがわかってない、またはできないこと。

- rit. - - - のコピペ

