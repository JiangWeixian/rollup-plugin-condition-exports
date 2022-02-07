'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var functionalMd = require('functional-md');

var Table = function () {
    return functionalMd.table({
        columns: [
            {
                dataIndex: 'id',
                title: 'ID',
            },
            {
                dataIndex: '',
                title: 'NAME',
                render: function (v) { return v.name; },
            },
        ],
        dataSource: [
            {
                id: 1,
                name: 'jw',
            },
            {
                id: 2,
                name: 'jiangweixian',
            },
        ],
    });
};

exports.Table = Table;
