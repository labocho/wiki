---
title: Rails tips
permalink: wiki/Rails_tips/
layout: wiki
---

コントローラからファイルを返す
==============================

render のかわりに send\_file / send\_data を使う。send\_data
使ったことない。 send\_file の :disposition =\> 'inline'
でインライン画像。このオプションなしだとダウンロードさせる。

-   [send\_file (ActionController::Streaming) -
    APIdock](http://apidock.com/rails/ActionController/Streaming/send_file)
-   [send\_data (ActionController::Streaming) -
    APIdock](http://apidock.com/rails/ActionController/Streaming/send_data)

file\_column 保存時に MIME タイプを取得
=======================================

file\_column の仕組みについては [file\_column プラグイン内部構造 - Rails
で行こう！](http://d.hatena.ne.jp/elm200/20070730/1185776933)
がわかりやすい。

``` {.ruby}
# ActiveRecord のサブクラス内
file_column :file

alias :old_file= :file=
def file=(file)
  mime = file.content_type #=> 'image/png' とか
  old_file = file
end
```

404 とか 403 とかを render するメソッド
=======================================

``` {.ruby}
# lib/render_error.rb
module RenderError
  def render_error(status_code)
    render :file => "public/#{status_code.to_s[0..2]}.html", :status => status_code
    return false
  end
end

class ActionController::Base
  include RenderError
end
```

使い方
------

``` {.ruby}
# render_error は false を返すので
# filter の返り値にそのまま使うとフィルターチェーンを中断できる
render_error 404
```
