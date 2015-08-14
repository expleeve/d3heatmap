HTMLWidgets.widget({

  name: 'd3heatmap',

  type: 'output',

  initialize: function(el, width, height) {

    return {
      lastTheme: null,
      lastValue: null
    };

  },
  
  renderValue: function(el, x, instance) {
    this.doRenderValue(el, x, instance);
  },

  // Need dedicated helper function that can be called by both renderValue
  // and resize. resize can't call this.renderValue because that will be
  // routed to the Shiny wrapper method from htmlwidgets, which expects the
  // wrapper data object, not x.
  doRenderValue: function(el, x, instance) {
    var self = this;
    
    instance.lastValue = x;
    
    if (instance.lastTheme && instance.lastTheme != x.theme) {
      d3.select(document.body).classed("theme-" + instance.lastTheme, false);
    }
    if (x.theme) {
      d3.select(document.body).classed("theme-" + x.theme, true);
    }

    el.innerHTML = "";
	
	var img = new Image(x.matrix.dim[0], x.matrix.dim[1]);
    img.onload = function() {
      // Save size
      w = x.matrix.dim[0];
      h = x.matrix.dim[1];
      
      var merged = [];
      for (var i = 0; i < x.matrix.data.length; i++) {
        var r = 0;
        var g = 0;
        var b = 255;
        var a = parseInt(x.matrix.data[i]) / 2 + 100;
        merged.push({
          label: x.matrix.data[i],
          color: "rgba(" + [r,g,b,a/255].join(",") + ")"
        })
      }
      x.matrix.merged = merged;
      
      var hm = heatmap(el, x, x.options);
      if (window.Shiny) {
        var id = self.getId(el);
        hm.on('hover', function(e) {
          Shiny.onInputChange(id + '_hover', !e.data ? e.data : {
            label: e.data.label,
            row: x.matrix.rows[e.data.row],
            col: x.matrix.cols[e.data.col]
          });
        });
        /* heatmap doesn't currently send click, since it means zoom-out
        hm.on('click', function(e) {
          Shiny.onInputChange(id + '_click', !e.data ? e.data : {
            label: e.data.label,
            row: e.data.row + 1,
            col: e.data.col + 1
          });
        });
        */
  	  }
    
    };
    img.src = x.image;

  },

  resize: function(el, width, height, instance) {
    if (instance.lastValue) {
      this.doRenderValue(el, instance.lastValue, instance);
    }
  }

});
