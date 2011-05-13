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

def file_with_getting_content_type=(file)
  self.mime = file.content_type #=> 'image/png' とか
  self.file_without_getting_content_type = file
end
alias_method_chain :file=, :with_getting_content_type
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

Rails 3 の場合は下記の通り

``` {.ruby}
# Gemfile
gem "diff-lcs", :require => "diff/lcs"
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

関連と fixture
==============

fixture で外部キーの \_id を省略すると参照テーブルの fixture
ラベルを指定できる。

``` {.ruby}
class Entry < ActiveRecord::Base
  has_many :comments # 必ずしも必要でない
end

class Comment < ActiveRecord::Base
  belongs_to :entry
end
```

    #entries.yml
    about_me:
      title: About me
      body: foo bar

    #comments.yml
    for_about_me:
      entry: about_me
      body: baz

ここで `entry` と書いてるのは `belongs_to :entry`
と指定したからで、クラス名や外部キー名、テーブル名やフィクスチャのファイル名とは直接関係ない。

たとえば、

``` {.ruby}
class Person < ActiveRecord::Base
  belongs_to :parent, :class_name => 'Person', :foreign_key => :parent_user_id
end
```

とした場合、

    #people.yml
    anakin:
      name: Anakin Skywalker

    luke:
      name: Luke Skywalker
      parent: anakin

と書ける。

fixture で id を記述しなかった場合の id
---------------------------------------

fixture で id を記述しなかった場合、自動で id が割り振られるが、この id
は下記のコードで生成されている。

``` {.ruby}
# File activerecord/lib/active_record/fixtures.rb
MAX_ID = 2 ** 30 - 1

def self.identify(label)
  Zlib.crc32(label.to_s) % MAX_ID
end
```

引数の `label` はフィクスチャのラベル。`users(:labocho)` の `:labocho`
である。

`Zlib.crc32` は文字列から CRC
チェックサム値を生成するメソッドなので、`label` が同じなら同じ値が返る
(いちおう衝突の可能性もある)。

どんな id が割り振られるかは下記のコマンドで確認出来る。

    # rails 環境で
    ruby script/runner "puts Fixtures.identify(:labocho)" 

    # ruby だけで
    ruby -r zlib -e "puts Zlib.crc32('labocho') % (2 ** 30 - 1)"

file\_column のテスト時にはレコードの id
をディレクトリ名に使う必要があるが、この方法で割り振られる id
を確認しておけば、fixture に id を記述しなくともテストできる。

Rake と script/\* での environment の指定
=========================================

`rake` は `RAILS_ENV=''environment''`、`script/runner` は
`-e ''environment''`、`script/console` は `''environment''`。

    # rake
    rake db:create RAILS_ENV=production

    # script/runner
    ruby script/runner -e production "puts 'Hello, Rails!'"

    # script/console
    ruby script/console production

parallel\_tests
===============

parallel\_tests はマルチプロセスでテストを行う
gem。マルチコア環境では飛躍的にテストが高速化できる。

-   [grosser/parallel\_tests -
    GitHub](https://github.com/grosser/parallel_tests)

導入は上記ページにある Readme.md がわかりやすいのでそれを参照。
file\_column と組合わせる場合は、少し調整が必要。

HyperEstraier でノードが追加できない
====================================

Rails とは直接関係ないけど、ほかに書くとこないのでここに。

MacPorts でインストールした HyperEstraier を search\_do
を通して使っているときに、ノードの追加ができない現象が起こった。

Web インターフェイスでノードを追加しようとしても Some error occurred
と言われ、追加できない。ログを見ると `ERROR DB-ERROR: database problem`
というエラーが出ている。この後、ノードマスタを再起動しようとしても、最後に追加しようとしたノードを開けずに失敗する
(\_node にあるノードのディレクトリを 10 未満にすれば再起動できる)。一方
VM 上の CentOS では、問題なく 11 以上のノードが作成できた。

原因はファイルディスクリプタの上限に引っかかっていたため。MacOS X 10.6
では、デフォルトで上限が 256 である。

``` {.bash}
$ ulimit -n
256
```

これを適当な大きな値に設定したら、11
以上のノードを作成できるようになった。

``` {.bash}
$ ulimit -n 1024
1024
```

デプロイまでの手順例
====================

rails 3.0.7 / ruby 1.9.2 on rvm / capistrano / git / passenger 使用。

``` {.bash}
# local
$ capify .
```

config/deploy.rb を編集

``` {.ruby}
# http://rvm.beginrescueend.com/integration/capistrano/
$:.unshift(File.expand_path('./lib', ENV['rvm_path'])) # Add RVM's lib directory to the load path.
require "rvm/capistrano"                  # Load RVM's capistrano plugin.
set :rvm_ruby_string, '1.9.2'        # Or whatever env you want it to run in.

# http://d.hatena.ne.jp/kattton/20110121/1295571519
require 'bundler/capistrano'

#---
# Excerpted from "Agile Web Development with Rails, 3rd Ed.",
# published by The Pragmatic Bookshelf.
# Copyrights apply to this code. It may not be used to create training material, 
# courses, books, articles, and the like. Contact us if you are in doubt.
# We make no guarantees that this code is fit for any purpose. 
# Visit http://www.pragmaticprogrammer.com/titles/rails3 for more book information.
#---
# be sure to change these
set :user, '[user]'
set :domain, '[host]'
set :application, '[project]'
set :ssh_options, { :forward_agent => true }

# file paths
set :repository,  "#{user}@#{domain}:git/#{application}.git"
set :deploy_to, "/var/www/#{application}" 

# distribute your applications across servers (the instructions below put them
# all on the same server, defined above as 'domain', adjust as necessary)
role :app, domain
role :web, domain
role :db, domain, :primary => true

# you might need to set this if you aren't seeing password prompts
# default_run_options[:pty] = true

# As Capistrano executes in a non-interactive mode and therefore doesn't cause
# any of your shell profile scripts to be run, the following might be needed
# if (for example) you have locally installed gems or applications.  Note:
# this needs to contain the full values for the variables set, not simply
# the deltas.
# default_environment['PATH']='<your paths>:/usr/local/bin:/usr/bin:/bin'
# default_environment['GEM_PATH']='<your paths>:/usr/lib/ruby/gems/1.8'

# miscellaneous options
set :deploy_via, :remote_cache
set :scm, 'git'
set :branch, 'master'
set :scm_verbose, true
set :use_sudo, false

# task which causes Passenger to initiate a restart
namespace :deploy do
  task :restart do
    run "touch #{current_path}/tmp/restart.txt" 
  end
end

# optional task to reconfigure databases
after "deploy:update_code", :configure_database
desc "copy database.yml into the current release path"
task :configure_database, :roles => :app do
  db_config = "/home/[user]/[project]/config/database.yml"
  run "cp #{db_config} #{release_path}/config/database.yml"
end
```

ソースの置き場所と database.yml の用意。

``` {.bash}
# remote
$ sudo mkdir -p /var/www/[project]
$ sudo chown [user]:[group] /var/www/[project]
```

``` {.bash}
# remote
$ mkdir -p ~/[project]/config
# database.yml を記述
$ vi ~/[project]/config/database.yml
```

デプロイ。

``` {.bash}
# local
# 必要なディレクトリの作成 (初回のみ)
$ cap deploy:setup
# 正常に動作するかチェック
$ cap deploy:check
# デプロイ実行
$ cap deploy:migrations
```

Passenger の設定。

``` {.bash}
$ sudo vi /etc/httpd/conf/httpd.conf
```

    # メインで使う Ruby
    LoadModule passenger_module /home/[user]/.rvm/gems/ree-1.8.7-2010.02/gems/passenger-3.0.0.pre4/ext/apache2/mod_passenger.so
    PassengerRoot /home/[user]/.rvm/gems/ree-1.8.7-2010.02/gems/passenger-3.0.0.pre4
    PassengerRuby /home/[user]/.rvm/wrappers/ree-1.8.7-2010.02/ruby

    <VirtualHost *:80>
      ServerName [project].penguinlab.jp
      DocumentRoot /var/www/[project]/public
    </VirtualHost>

VHost で別の Ruby を使う場合

``` {.bash}
$ sudo vi /etc/httpd/conf/httpd.conf
```

    # http://blog.phusion.nl/2010/09/21/phusion-passenger-running-multiple-ruby-versions/
    <VirtualHost *:80>
      ServerName [project].penguinlab.jp
      DocumentRoot /var/www/[project]/current/public
      PassengerEnabled off
      ProxyPass / http://127.0.0.1:3000/
      ProxyPassReverse / http://127.0.0.1:3000/
    </VirtualHost>

``` {.bash}
# cd /var/www/[project]/current
# passenger start
# だと、Capistrano のバージョン管理に対応せず、restart.txt による再起動もできないので、下記のようにパスを指定する
$ passenger start /var/www/[project]/current -p 3000 -d -e production --pid-file /var/www/[project]/shared/pids/passenger.3000.pid --log-file /var/www/[project]/shared/log/passenger.3000.log
```

本
==

<amazon locale="jp" id="4274067858">

%title%
-------

なんだかんだでよくできてる1冊。環境構築、チュートリアル、主要部分の解説、デプロイまで、一通り網羅している。初学時はもちろん、慣れてきてからも、いろいろ発見がある。文章も読みやすい。

[%url% %mediumimage%]

[%url% %title% / %author% 著. %publisher%, %publishedyear%, %pages%p.]
</amazon>
