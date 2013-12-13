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
pen.define([
  '../util'
], function(vizUtil) {

    return vizUtil.registerVisualization('zoom', {
        type:    'time',      // generic type id
        source:  'Protovis',  // id of the source library
        needsColorGradient: false,
        customType: '',
        maxValues: [50000,50000,50000,50000],
        getDropZoneLabel: function(type){
          var label = type;
          return label;
        },
        args: {
        },
        propMap: [
        ],
        helper: {
            canRefreshReport: function(report) {
              var ok = true;
              if ((report.findGemsByGembarId("date").length == 0
                && report.findGemsByGembarId("year").length == 0
                && report.findGemsByGembarId("month").length == 0
                && report.findGemsByGembarId("day").length == 0 ) ||
                report.findGemsByGembarId("measures").length == 0)
                ok = false;
              return ok;
            }
        },
        dataReqs: [ // dataReqs describes the data requirements of this visualization
            {
                name: 'Default',
                reqs:
                    [
                      {   id: 'date',
                        dataType: 'string',
                        dataStructure: 'column',
                        caption: 'date',
                        required: false,
                        allowMultiple: false
                      },
                      {   id: 'year',
                        dataType: 'string',
                        dataStructure: 'column',
                        caption: 'year',
                        required: false,
                        allowMultiple: false
                      },
                      {   id: 'month',
                        dataType: 'string',
                        dataStructure: 'column',
                        caption: 'month',
                        required: false,
                        allowMultiple: false
                      },
                      {   id: 'day',
                        dataType: 'string',
                        dataStructure: 'column',
                        caption: 'day',
                        required: false,
                        allowMultiple: false
                      },
                        {   id: 'measures',
                            dataType: 'number',
                            dataStructure: 'column',
                            caption: 'measures',
                            required: true,
                            allowMultiple: true         // true or false
                        },
                  {
                    id: 'fixedyaxis',
                    dataType: 'string',
                    values: ["fixed", "dynamic"],
                    ui: {
                      labels: ["Fixed", "Dynamic"],
                      group: "options",
                      type: 'combo',
                      caption: "Y Axis"
                    }
                  },
                  {
                    id: 'contextChartType',
                    dataType: 'string',
                    values: ["line", "area"],
                    ui: {
                      labels: ["Line", "Area"],
                      group: "options",
                      type: 'combo',
                      caption: "Chart Type"
                    }
                  },
                  {
                    id: "optionsBtn",
                    dataType: 'none',
                    ui: {
                        group: "options",
                        type: "button",
                        label: "chartoptions"
                    }
                  }
              ]
            }
        ]
    });
});
