---
title: Rails tips
permalink: wiki/Rails_tips/
layout: wiki
---

明示してなければ 2.3.8。

Ruby については [Ruby tips](/wiki/Ruby tips "wikilink") 参照。

コントローラからファイルを返す
==============================

render のかわりに send\_file / send\_data を使う。

-   send\_file
    にはファイルパスを渡す。ファイルが実際にある場合はこちらが楽
-   send\_data にはバイナリデータを (String オブジェクトで)
    渡す。ファイルがなくてもよい。

いづれも :disposition
オプションで、インラインで表示させるか、ダウンロードダイアログを表示させるか選べる。(正確には、Content-Disposition
ヘッダを設定する。)

``` {.ruby}
send_file png_image_file_path, :type => 'image/png', :disposition => 'inline' #=> インラインで表示させたり、ブラウザ上で画像を表示させる場合
send_file png_image_file_path, :type => 'image/png' #=> こっちはダウンロードのダイアログが出る
```

-   [send\_file (ActionController::Streaming) -
    APIdock](http://apidock.com/rails/ActionController/Streaming/send_file)
-   [send\_data (ActionController::Streaming) -
    APIdock](http://apidock.com/rails/ActionController/Streaming/send_data)

-   [RFC 1806 - Internet Engineering Task
    Force](http://www.ietf.org/rfc/rfc1806.txt) Content-Disposition
    ヘッダについて
-   [RFC 1806: The Content-Disposition
    Header](http://lab.moyo.biz/translations/rfc/rfc1806-ja.xsp)
    同日本語訳

file\_column 保存時に MIME タイプを取得
=======================================

file\_column の仕組みについては [file\_column プラグイン内部構造 - Rails
で行こう！](http://d.hatena.ne.jp/elm200/20070730/1185776933)
がわかりやすい。

``` {.ruby}
# ActiveRecord::Base のサブクラス内
file_column :file

alias :old_file= :file=
def file=(file)
  self.mime = file.content_type #=> 'image/png' とか
  old_file = file
end
```

404 とか 403 とかを render するメソッド
=======================================

render\_error 404 などとすると、public/404.html を探してステータスコード
404 をつけて render し、false を返す。

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

by メソッド
===========

Restful Authentication や Devise を使ったアプリケーションで、functional
test を書く際に、下記のような表記を可能にする。 どちらも認証に使う Model
を User と決め打ちしているので、必要に応じて修正する必要がある。

``` {.ruby}
# test/fixtures/users.yml
fixture_user_name:
  email: ...

# ブロック中を users(:fixture_user_name) からのリクエストとしてテスト
by :fixture_user_name do
  get :index
  assert_response :success
end

# lambda を users(:fixture_user_name) からのリクエストとしてテスト
get_index = lambda {
  get :index
  assert_response :success
}
by :fixture_user_name, get_index
```

Restful Authentication 用
-------------------------

``` {.ruby}
# test/test_helper.rb
class ActiveSupport::TestCase
  def by(fixture_key, proc = nil)
    if fixture_key
      @request.session[:user_id] = users(fixture_key).id
      user_name = fixture_key.to_s.humanize
    else
      user_name = "Anonymous user"
    end

    if proc
      proc.call(user_name)
    else
      yield(user_name)
    end

    @request.session.delete :user_id
  end
end
```

Devise 用
---------

``` {.ruby}
# test/test_helper.rb
class ActiveSupport::TestCase
  def by(fixture_key, proc = nil)
    if fixture_key
      sign_in :user, users(fixture_key)
      user_name = fixture_key.to_s.humanize
    else
      user_name = "Anonymous user"
    end

    if proc
      proc.call(user_name)
    else
      yield(user_name)
    end

    sign_out users(fixture_key)
  end
end

# もちろん下記も必要
class ActionController::TestCase
  include Devise::TestHelpers
end
```

environment.rb
==============

gem 名とライブラリ名が異なる場合
--------------------------------

gem 名とライブラリ名が異なる場合、config.gem に :lib
オプションでライブラリ名を指定しなければならない。これをしていないとサーバ起動時に
Missing these required gems: などと怒られる。典型的には gem
名がハイフン入りで、ライブラリ名がスラッシュ入りになるもの。

``` {.ruby}
# config/environment.rb
config.gem "diff-lcs", :lib => "diff/lcs"
```

database.yml
============

Access denied for user 'root'@'localhost' (using password: YES)
---------------------------------------------------------------

rake db:migrate 時などに、上記のエラーが出た場合、database.yml
をチェック。MySQL の場合、**user** ではなく **username**
とするのが正しいみたい。user になってると無視されて、root
としてアクセスしようとする。

    production:
      adapter: mysql
      database: database_name
      username: database_user
      password: database_password
