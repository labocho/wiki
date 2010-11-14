---
title: Rails tips
permalink: wiki/Rails_tips/
layout: wiki
---

render\_error
=============

404 とか 403 とかを render するメソッド。

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

``` {.ruby}
# 使い方
# render_error は false を返すので
# filter の返り値にそのまま使うとフィルターチェーンを中断できる
render_error 404
```
