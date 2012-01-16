Raphael.fn.connection = function (obj1, obj2, line, bg) {
    var remove = function() {
      this.arrow.remove();
      this.line.remove();
      this.bg.remove();
    }

    if (obj1.line && obj1.from && obj1.to) {
        line = obj1;
        obj1 = line.from;
        obj2 = line.to;
    }
    var bb1 = obj1.getBBox(),
        bb2 = obj2.getBBox(),
        p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
        {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
        {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
        {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
        {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
        {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
        {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
        {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
        d = {}, dis = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy);
                d[dis[dis.length - 1]] = [i, j];
            }
        }
    }
    if (dis.length == 0) {
        var res = [0, 4];
    } else {
        res = d[Math.min.apply(Math, dis)];
    }
    var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y;
    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
    var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
    var data_x = (bb1.x + bb1.width);
      var angle = 0;
      if ( data_x > bb2.x && bb1.x < (bb2.x + bb2.width)) {
        if (bb1.y + (bb1.height/2) < bb2.y) {
          angle = 180;
        } else {
          angle = 0 ;
        }
      } else if (data_x > bb2.x) {
          angle = -90;
      } else {
          angle = 90;
      }

    if (line && line.line) {
        line.bg && line.bg.attr({path: path});
        line.line.attr({path: path});
        line.arrow.remove();
        line.arrow = this.arrow(x4, y4 - (5), 10);
        line.arrow.transform("");
        line.arrow.rotate(angle);
    } else {
        var color = typeof line == "string" ? line : "#000";
        arrow = this.arrow(x4, y4 - (5), 10);
        arrow.rotate(angle);
        return {
            bg: bg && bg.split && this.path(path).attr({stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 3}),
            line: this.path(path).attr({stroke: color, fill: "none"}),
            from: obj1,
            to: obj2,
            arrow : arrow,
            remove:remove
        };
    }
};

Raphael.fn.arrow = function(x, y, size) {
  var path = ["M", x, y];
  path = path.concat(["L", (x + size / 2), (y + size)]);
  path = path.concat(["L", (x - size / 2), (y + size)]);
  rpath = this.path(path.concat("z").join(" "));
  rpath.attr({fill: '#000', stroke: '#ddd', 'stroke-width': 1})
  return rpath;
};

var el;
var all_shapes = new Array();

/*
 * A controller to work with our small framework (wtf)
 *
 */
var raphael_controller = function(spec) {
  var that = {};
  var shapes = new Array();
  var connections = new Array();
  sr = ScaleRaphael("holder", 800, 640);

  /*
   * This must be outside of this but here it is xDDD
   */
  function resizePaper(){
    var win = $(this);
    sr.changeSize(win.width(), win.height(), true, false);
  }
  resizePaper();
  $(window).resize(resizePaper);   

  var create_group = function(paper, shape, text) {
          var group = paper.set();
          group.push(shape);
          var text = paper.text(shape.getBBox().x , shape.getBBox().y, text);
          text.attr({x: shape.attr('cx'), y: shape.attr('cy'), "fill": "red", "font-size": 10, "font-family": "Arial, Helvetica, sans-serif"});
          group.push(text);
          return group;
  }
  var dragger = function () {
      this.ox = this.type == "rect" ? this.attr("x") : this.attr("cx");
      this.oy = this.type == "rect" ? this.attr("y") : this.attr("cy");
      this.animate({"fill-opacity": 0.4}, 500);
  };
  var move = function (dx, dy) {
          var att = this.type == "rect" ? {x: this.ox + dx, y: this.oy + dy} : {cx: this.ox + dx, cy: this.oy + dy};
          that = this; 
          group_shape = all_shapes.filter(function(x){ return x[0]== that;})[0];
          group_shape.attr(att);
          group_shape.attr({x: this.ox + dx, y: this.oy + dy});
          for (var i = connections.length; i--;) {
              sr.connection(connections[i]);
          }
          sr.safari();
  };
  var up = function () {
          this.animate({"fill-opacity": 0.2}, 500);
  };

  /*
   * Remove the transformation and fix the x,y in the element
   */
  that.fix_transform = function (gr) {
      var x = gr[0].getBBox().x + gr[0].getBBox().width/2;
      var y = gr[0].getBBox().y + gr[0].getBBox().height/2; 
      gr.attr({cx: x, cy: y});
      gr.attr({x: x, y: y});
      gr.transform("M " + x + " " + y );
  };    

  var cl = function () {
      that = this; 
      group_shape = all_shapes.filter(function(x){ return x[0]== that;})[0];
      group_shape.animate({x: 400, y:320, cx:400, cy:320}, 200, function() {
        group_shape.transform("");
        group_shape.animate({'transform':  "s20 20"}, 400);
        all_shapes.forEach(function(x) {
            if (x[0] != that) {
              x.remove();
            }
        });
        connections.forEach(function(x) {
            x.remove();
        });
      });
      setTimeout(function() {
        $.fancybox({href:'list/', autoDimensions:false, scrolling:'yes', width:500, height:500});
      }, 500);
  };

  that.create_shape = function(text, center, element) {
    var radio = 60;
    var shape;
    if (center) {
      shape = sr.ellipse(600, 480, radio, radio);
    } else {
      shape = sr.ellipse(400, 320, radio, radio);
    }
    var color = Raphael.getColor();
    shape.attr({fill: color, stroke: color, "fill-opacity": 0.2, "stroke-width": 2, cursor: "move"});
    shape.drag(move, dragger, up);
    shape.dblclick(cl);
    group = create_group(sr, shape , text);
    if (center) {
      group.animate({transform: "R" + element + " 400 320"}, 4000, "bounce");
    }
    all_shapes.push(group);
    return group;
  }
  that.connect = function (from, to, color) {
    connections.push(sr.connection(from, to, "#fff", color));
  };
  return that;
}
window.onload = function () {
};
