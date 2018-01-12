module Jekyll
  module GithubHistoryURLFilter
    def github_history_url(input)
      "https://github.com/labocho/wiki/commits/master/wiki/" + ERB::Util.u(input.to_s.gsub(" ", "_")) + ".md"
    end
  end
end

Liquid::Template.register_filter(Jekyll::GithubHistoryURLFilter)
