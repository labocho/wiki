---
title: Ruby tips
permalink: wiki/Ruby_tips/
layout: wiki
---

String\#inspect で16進数表記を返す
==================================

バイナリを扱うプログラムの開発時などに。

``` {.ruby}
class String
  def inspect
    s, l = '', ''
    self.each_byte do |b|
      l << b.to_s(16).upcase.rjust(2, '0') + ' '
      if l.size >= 16 * 3
        s << l.strip + "\n"
        l = ''
      end
    end
    s << l.strip if l != ''
    s
  end
end
```

``` {.ruby}
# usage
p 'labocho' #=> 6C 61 62 6F 63 68 6F
```