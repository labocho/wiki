jQuery(function(){
  function buildHTML(date) {
    return '<div class="alert alert-warning">' +
           '<strong>この記事は ' + date.getFullYear().toString() + ' 年に書かれたものです。</strong>' +
           '<p>情報が古い、あるいは著者の現在の考えと大きく異なる場合があります。</p>' +
           '</div>';
  }

  function isTooOld(date) {
    var now = new Date();
    var lifetime_in_ms = 1000 * 60 * 60 * 24 * 365 * 3; // 3 years in ms
    return (now.getTime() - date.getTime()) > lifetime_in_ms;
  }

  var date_value, date;

  $(".post").each(function(){
    date_value = Date.parse($("time", $(this).closest("article")).attr("datetime"));
    if (isNaN(date_value)) return;
    date = new Date(date_value);
    if (isTooOld(date)) {
      $(this).prepend(buildHTML(date));
    }
  });
});
