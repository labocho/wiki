(function () {
  window.changeRectColor = function () {
    /**
    * HSV to RGB color conversion
    *
    * H runs from 0 to 360 degrees
    * S and V run from 0 to 100
    *
    * Ported from the excellent java algorithm by Eugene Vishnevsky at:
    * http://www.cs.rit.edu/~ncs/color/t_convert.html
    */
    function hsvToRgb(h, s, v) {
      var r, g, b,
        i,
        f, p, q, t;

      // Make sure our arguments stay in-range
      h = Math.max(0, Math.min(360, h));
      s = Math.max(0, Math.min(100, s));
      v = Math.max(0, Math.min(100, v));

      // We accept saturation and value arguments from 0 to 100 because that's
      // how Photoshop represents those values. Internally, however, the
      // saturation and value are calculated from a range of 0 to 1. We make
      // That conversion here.
      s /= 100;
      v /= 100;

      if (s === 0) {
        // Achromatic (grey)
        r = g = b = v;
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
      }

      h /= 60; // sector 0 to 5
      i = Math.floor(h);
      f = h - i; // factorial part of h
      p = v * (1 - s);
      q = v * (1 - s * f);
      t = v * (1 - s * (1 - f));

      switch (i) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      default: // case 5:
        r = v;
        g = p;
        b = q;
      }
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function toHex(r, g, b) {
      var rs, gs, bs;
      rs = r.toString(16);
      rs = (rs.length === 1) ? '0' + rs : rs;
      gs = g.toString(16);
      gs = (gs.length === 1) ? '0' + gs : gs;
      bs = b.toString(16);
      bs = (bs.length === 1) ? '0' + bs : bs;
      return '#' + rs + gs + bs;
    }

    function retry(object, retry_count) {
      if (retry_count === 0) return;
      window.setTimeout(function () { try_change_color(object, retry_count - 1); }, 50);
    }

    function try_change_color(object, retry_count){
      var rect, color, svg, box;
      try {
        svg = object.getSVGDocument() || object.contentDocument;
      } catch (e) {
        return retry(object, retry_count);
      }
      if (svg) {
        box = svg.getElementById('box');
      }
      if (!box) { return retry(object, retry_count); }

      rect = box.getElementsByTagName('rect')[0];
      color = hsvToRgb(Math.random() * 360, 100, 90);
      rect.setAttribute('fill', toHex(color[0], color[1], color[2]));
    }

    $('.logo').each(function(){
      try_change_color(this, 10);
    });
  };
}());

$(function(){
  changeRectColor();
});
