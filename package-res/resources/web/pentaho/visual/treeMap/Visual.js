/*
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License, version 2.1 as published by the Free Software
 * Foundation.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this
 * program; if not, you can obtain a copy at http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * or from the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * Copyright (c) 2012 Pentaho Corporation..  All rights reserved.
 */

define([
    "../visualUtils",
    "pentaho/visual/color/paletteRegistry",
    "pentaho/visual/events",
    "cdf/lib/CCC/protovis",
    "jquery",
    "dojo/_base/lang",
    "cdf/lib/CCC/tipsy"
], function(utils, paletteRegistry, visualEvents, pv, $, lang) {
    /*global cv:true*/
    return TreeMap;

    function TreeMap(div) {

        this.debug = false;

        if(this.debug) console.log('TreeMap.create');

        this.element = div;

        this.labelColor = "#ffffff";
        this.labelSize = 12;
        this.lineColor = "#ffffff";
        this.w = 200;
        this.h = 200;
        this.rootPanel = null;
        this.allStr = "All";
        this.searchStr = "";
        this.colorMode = 'top';
        this.colors = paletteRegistry.get("twelveDaysViz").colors;
        this.highlights = [];
        this.highLightsSet = false;

        this.clearHighlights = function() {
            if(this.debug) console.log('TreeMap.clearHighlights()');
            var n = this.dataTable ? this.dataTable.getNumberOfRows() : this.highlights.length;
            for(var idx=0; idx<n; idx++) {
                this.highlights[idx] = false;
            }
            this.highLightsSet = false;
        };

        this.setHighlights = function(lights) {
            if(this.debug) console.log('TreeMap.setHighlights()');
            if(!lights || lights.length == 0) {
                this.clearHighlights();
                this.highlight();
            }
        };

        this.highlight = function() {
            this.highLightsSet = false;
            for(var idx=0; idx<this.highlights.length; idx++) {
                if(this.highlights[idx]) {
                    this.highLightsSet = true;
                    break;
                }
            }
            this.rootPanel.render();
        };

        this.draw = function(dataTable, drawSpec) {
            if(this.debug) console.log('TreeMap.draw()');
            this.dataTable = dataTable;
            this.drawSpec = drawSpec;
            this.highlights = [];
            this.clearHighlights();
            $(".tipsy").remove();

            utils.handleLabelOptions(this, drawSpec);
            utils.handleBackgroundOptions(this, drawSpec);

            var searchStr = drawSpec.searchstr;
            if(searchStr) {
                this.searchStr = searchStr;
                this.searchExp = new RegExp(searchStr, "i");
            } else {
                this.searchStr = null;
                this.searchExp = null;
            }

            utils.applyBackground(this.element, drawSpec);

            this.processData();

            this.resize();
        };

        this.getColor = function(d) {
            var color = pv.color("#cccccc");
            if(d.meta && d.meta.color) {
                color = pv.color(d.meta.color);
            }

            if(this.highLightsSet && !this.highlights[d.meta.rowIdx]) {
                color = color.alpha(0.2);
            }

            if(this.searchStr) {
                color = color.alpha(d.nodeName.match(this.searchExp) ? 1 : .2);
            }

            var scale = (d.nodeValue - this.minValue) / (this.maxValue-this.minValue);
            // make it a +/- 20%
            scale = scale * 0.6 + 0.7;

            // adjust the colors based on value
            var rgb = color.rgb();
            var r = Math.floor(Math.min(255, rgb.r * scale));
            var g = Math.floor(Math.min(255, rgb.g * scale));
            var b = Math.floor(Math.min(255, rgb.b * scale));
            var a = color.opacity;
            color = new pv.Color.Rgb(r, g, b, a);

            return color;
        };

        this.resize = function() {

            if(this.debug) console.log('TreeMap.resize()');

            /* Size parameters. */
            var w = this.getClientWidth();
            var h = this.getClientHeight();

            var tipOptions = {
              delayIn: 200,
              delayOut:80,
              offset:  2,
              html:    true,
              gravity: "nw",
              fade:    false,
              followMouse: true,
              corners: true,
              arrowVisible: false,
              opacity: 1
            };

            if(this.debug) console.log('creating main panel');
            /* Root panel. */
            this.rootPanel = new pv.Panel()
                .width(w)
                .height(h)
                .left(0)
                .top(0)
                .canvas(this.svgDiv);

            this.rootPanel.vis = this;

            if(this.debug) console.log('adding tree layout');

            this.tree = this.rootPanel.add(pv.Layout.Treemap)
                .nodes(this.nodes)
                .round(true);

            this.tree.vis = this;

            this.tree.leaf.add(pv.Panel)
                .fillStyle(function(d) { return this.parent.vis.getColor(d); })
                .strokeStyle(function() { return this.parent.vis.lineColor; })
                .lineWidth(1.5)
                .antialias(false)
                .text(function(d) { return d.meta.tooltip; })
                .textStyle(this.labelColor)
                .title("")
                .font(this.labelFontStr)
                ;

            this.tree.label.add(pv.Label)
                .text(function(d) {
                    var chars = (Math.max(d.dx,d.dy) / (this.parent.vis.labelSize/1.5));
                    if(chars > 6) {
                        return d.nodeName.substring(0, chars);
                    } else {
                        return "";
                    }
                })
                .textStyle(this.labelColor)
                .font(this.labelFontStr)
                ;

            this.tree.leaf.add(pv.Panel)
                .fillStyle("rgba(0,0,0,0.01)")
                .antialias(false)
                .text(function(d) { return d.meta.tooltip; })
                .textStyle(this.labelColor)
                .title("")
                .cursor('pointer')
                .font(this.labelFontStr)
                .events("all")
                .event('mouseover', function() {
                    this.parent.vis.mouseMove();
                })
                .event('mousemove', pv.Behavior.tipsy(tipOptions))
                .event('click', function() {
                    this.parent.vis.mouseClick();
                })
                ;
    /*
            this.rootPanel.add(pv.Panel)
                .events("all")
                .fillStyle("rgba(127,127,127,0.00001)") // (almost) invisible
                .cursor('pointer')
                .text(function(d) {console.log(d); return "dfsfd"; })
                .event('mouseover', function() {
                    this.parent.vis.mouseMove();
                })
                .event('mousemove', pv.Behavior.tipsy(tipOptions))
                .event('click', function() {
                    this.parent.vis.mouseClick();
                });
    */
            if(this.debug) console.log('rendering');
            this.rootPanel.render();

        };

        this.mouseMove = function(d, t) {
            // console.log('x='+this.rootPanel.mouse().x);
        };

        this.mouseClick = function(d, t) {
            var x = this.rootPanel.mouse().x;
            var y = this.rootPanel.mouse().y;
            var targetNode = null;
            for(var idx=1; idx<this.nodes.length; idx++) {
                var node = this.nodes[idx];
                if(node.x <= x && node.y <= y && (node.x + node.dx) >= x && (node.y + node.dy) >= y) {
                    targetNode = node;
                }
            }
            if(!targetNode) {
                return;
            }

            if(this.pendingSelection && this.pendingSelection.selections[0].rowIdx == targetNode.meta.rowIdx) {
                clearTimeout(this.doubleClickTimer);

                if(this.debug) console.log('Treemap double click');
                clearTimeout(this.doubleClickTimer);
                this.pendingSelection.selections[0].rowId = targetNode.meta.rowId;
                this.pendingSelection.selections[0].rowItem = targetNode.meta.rowItem;

                visualEvents.trigger(this, "doubleclick", this.pendingSelection);
                this.pendingSelection = null;
                return;
            }

            // create a selection object
            this.highlights[targetNode.meta.rowIdx] = !this.highlights[targetNode.meta.rowIdx];
            this.highlight();

            var rowIdx = targetNode.meta.rowIdx;

            var selection = {
                rowId:   [],
                rowIdx:  rowIdx,
                rowItem: [],
                colItem: [],
                colId:   [],
                type:    'row'
            };

            for(var idx=0; idx<this.dataTable.getNumberOfColumns()-1; idx++) {
                selection.rowId.push(this.dataTable.getColumnId(idx));
                selection.rowItem.push(this.dataTable.getValue(rowIdx,idx));
            }

            var args = {
                mode: "TOGGLE",
                type: 'row',
                source: this,
                selections: [selection]
            };

            this.pendingSelection = args;
            // start a double click timer

            this.doubleClickTimer = setTimeout(lang.hitch(this, this.toggleGroup), 300);

        };

        this.toggleGroup = function(n) {

            // create a selection object
            this.highlight();

            // the timer expired, so this is a click, not a double-click
            visualEvents.trigger(this, "select", this.pendingSelection);
            // null out the pending selection

            if(!this.highLightsSet) {
                if(this.debug) console.log("TreeMap clearing selections");
                utils.clearSelections();
                // null out the pending selection
            }

            this.pendingSelection = null;
        };

        /* Compute new index values, rescale if needed, and render. */
        this.update = function() {
            if(this.debug) console.log('TreeMap.update()');
        };

        this.init = function() {
            this.svgDiv = document.createElement('DIV');
            this.element.appendChild(this.svgDiv);
            this.svgDiv.id = "svgDiv";
            this.svgDiv.style.position="absolute";
            this.svgDiv.style.top="0px";
            this.svgDiv.style.left="0px";
            this.svgDiv.style.width="100%";
            this.svgDiv.style.height="100%";
            this.svgDiv.style.overflow="hidden";
            this.svgDiv.style.textAlign="center";
        };

        this.processData = function() {
            this.hierarchy = this.buildHierarchy();
        };

        this.getClientWidth = function() {
          return this.element.offsetWidth;
        };

        this.getClientHeight = function() {
          return this.element.offsetHeight;
        };

        this.init();

        this.getRoleFirstColumnIndex = function(name) {
            return this.drawSpec[name] ? this.dataTable.getColumnIndexByAttribute(this.drawSpec[name][0]) : -1;
        };

        this.getRoleColumnIndexes = function(roleName) {
            var attrNames = this.drawSpec[roleName];
            return attrNames
                ? attrNames.map(this.dataTable.getColumnIndexByAttribute, this.dataTable)
                : [];
        };

        this.buildHierarchy = function() {
            var dataTable = this.dataTable;

            this.rowsCols = this.getRoleColumnIndexes("cols");
            this.measureCol = this.getRoleFirstColumnIndex("measure");
            this.minValue = null;
            this.maxValue = null;

            var hierarchy = {};
            var itemKey;
            this.itemMetas = {};
            var topLevelCount=0;
            for(var rowNo=0; rowNo<this.dataTable.getNumberOfRows(); rowNo++) {
                var branch = hierarchy;
                var tooltip = "";
    //            var metaBranch = this.dataObj;
                itemKey = this.allStr;
                var color;
                for(var colNo=0; colNo<this.dataTable.getNumberOfColumns()-1; colNo++) {
                    var rowId = dataTable.getColumnId(colNo);
                    var item = this.dataTable.getFormattedValue(rowNo, colNo);
                    var itemId = this.dataTable.getValue(rowNo, colNo);
                    if(colNo > 0) {
                        tooltip += "<br/>";
                    }
                    itemKey += '~';
                    itemKey += item;
                    if(colNo < this.rowsCols.length-1) {
                        tooltip += this.dataTable.getColumnLabel(colNo)+": "+item;
                        if(!branch[item]) {
                            branch[item] = {};
                            this.itemMetas[itemKey] = {
                                // stuff for selections
                                rowIdx: rowNo,
                                rowId: [rowId],
                                rowItem: [itemId],
                                colItem: [],
                                colId:   [],
                                type:    'row',
                                tooltip: tooltip
                            };
                            if(this.colorMode == 'top' && colNo == 0) {
                                color = this.colors[topLevelCount % this.colors.length];
                                this.itemMetas[itemKey].color = color;
                                topLevelCount++;
                            }
                        }
                        branch = branch[item];

                    } else if(colNo == this.rowsCols.length-1) {
                        tooltip += this.dataTable.getColumnLabel(colNo)+": "+item;
                        tooltip += "<br/>";
                        var value = this.dataTable.getValue(rowNo, this.measureCol);
                        if(value == null || typeof value == 'undefined' || value < 0) {
                            value = 0;
                        }
                        tooltip += this.dataTable.getColumnLabel(this.measureCol)+": "+this.dataTable.getFormattedValue(rowNo, this.measureCol);
                        branch[item] = value;
                        // TODO store all of the row information, or use the rowIdx to create it later?
                        this.itemMetas[itemKey] = {
                            // stuff for selections
                            rowIdx: rowNo,
                            rowId: [rowId],
                            rowItem: [itemId],
                            colItem: [],
                            colId:   [],
                            type: 'row',
                            tooltip: tooltip
                        };
                        if(this.colorMode == 'top') {
                            if(colNo == 0) {
                                color = this.colors[rowNo % this.colors.length];
                            }
                            this.itemMetas[itemKey].color = color;
                        }
                        this.itemMetas[itemKey].value = value;
                        if(this.minValue == null) {
                            this.minValue = value;
                            this.maxValue = value;
                        } else {
                            this.minValue = Math.min(this.minValue, value);
                            this.maxValue = Math.max(this.maxValue, value);;
                        }
                    }
                }
            }

            // remove empty branches
            this.pruneBranches(hierarchy);

            this.hierarchy = hierarchy;
            // convert into a PV DOM
            this.nodes = pv.dom(this.hierarchy).root(this.allStr).nodes();

            // attach the meta info to the DOM nodes
            for(var idx=0; idx<this.nodes.length; idx++) {
                var node = this.nodes[idx];
                // create a key
                itemKey = node.nodeName;
                var parent = node.parentNode;
                while(parent) {
                    itemKey = parent.nodeName + '~' + itemKey;
                    parent = parent.parentNode;
                }
                var meta = this.itemMetas[itemKey];
                node.meta = meta;
            }

            if(this.debug) console.log("hierarchy", this.hierarchy);
            if(this.debug) console.log("nodes", this.nodes);

            return hierarchy;
      };

      this.pruneBranches = function(branch) {
          var total = 0;
          var x;
          for(x in branch) {
              var item = branch[x];
              if(typeof item == "number") {
                  if(item == 0) {
                      delete branch[x];
                  }
                  total += item;
              } else {
                  var value = this.pruneBranches(item);
                  if(value == 0) {
                      delete branch[x];
                  } else {
                      total += value;
                  }
              }
          }

          return total;
      };
    }
});

/*
var position;
var size;
window.dot = null;
// Interaction state.
var s;



// Interaction: update selection.
function update(d, t) {
  s = d;
  s.px = t.px;
  s.py = t.py;
  s.x1 = position[t.px].invert(d.x);
  s.x2 = position[t.px].invert(d.x + d.dx);
  s.y1 = position[t.py].invert(size - d.y - d.dy);
  s.y2 = position[t.py].invert(size - d.y);
  dot.context(null, 0, function() { this.render() });
}
*/
