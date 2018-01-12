# jekyll serve で .html 省略可能に
require "webrick"
WEBrick::HTTPServlet::FileHandler.class_eval do
  def search_file(req, res, basename)
    langs = @options[:AcceptableLanguages]
    path = res.filename + basename
    if File.file?(path)
      return basename
    elsif langs.size > 0
      req.accept_language.each{|lang|
        path_with_lang = path + ".#{lang}"
        if langs.member?(lang) && File.file?(path_with_lang)
          return basename + ".#{lang}"
        end
      }
      (langs - req.accept_language).each{|lang|
        path_with_lang = path + ".#{lang}"
        if File.file?(path_with_lang)
          return basename + ".#{lang}"
        end
      }
    # ここから追加
    elsif File.file?("#{path}.html")
      return "#{basename}.html"
    # ここまで追加
    end
    return nil
  end
end
