require "jekyll/page"

# permalink: path/to/page
# としたときに path/to/page/index.html でなく path/to/page.html を作るように
module Jekyll
  class Page
    def destination(dest)
      path = site.in_dest_dir(dest, URL.unescape_path(url))
      # path = File.join(path, "index") if url.end_with?("/")
      path = "#{path}.html" if url.end_with?("/")
      path << output_ext unless path.end_with? output_ext
      path
    end
  end
end
