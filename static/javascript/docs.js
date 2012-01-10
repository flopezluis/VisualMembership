var doc_controller = function(spec) {
  var that = {};
  that.add_document = function(data) {
      html = ' <li><span class="commentnumber"> #4</span>';
      html +=' <p><cite>Nick:</cite></p>';
      html +=' <p class="time">February 8th, 2009 at 5:38 am</p>';
      html +=' <p>d</p>';
      html +=' </li>';
      $("#commentlist").append(html);
  }
  return that;
}
