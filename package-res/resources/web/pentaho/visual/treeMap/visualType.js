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
    '../visualTypeHelper'
], function(visualTypeHelper) {

    return visualTypeHelper.registerVisualization('treeMap', {
        type:   'hierarchy',
        source: 'Protovis',
        maxValues: [2000,2000,2000,5000],
        dataReqs: [
          {
            name: 'Default',
            reqs :
                [
                  {
                    id: 'cols',
                    dataType: 'string',
                    dataStructure: 'column',
                    caption: 'points',
                    required: true,
                    allowMultiple: true
                  },
                  {
                    id: 'measure',
                    dataType: 'number',
                    dataStructure: 'column',
                    caption: 'measure',
                    required: true,
                    allowMultiple: false
                  },
                  /*
                  {
                    id: 'searchstr',
                    dataType: 'string',
                    value: '',
                    ui: {
                        group: "options",
                        type: 'textbox',
                        caption: "search"
                    }
                  },
                  */
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
