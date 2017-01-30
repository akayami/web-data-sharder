const mysql = require('mysql');
const async = require('async')

const conn = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	database: 'chunky'
});



conn.connect(function(err) {
	if (err) {
		console.log(err);
		return;
	}

	conn.insert = function(table, data, options, cb) {
		if (!cb) {
			cb = options;
			options = {};
		}
		var fields = Object.keys(data);
		var values = [];
		var dataArray = [table];
		for (var f = 0; f < fields.length; f++) {
			if (data[fields[f]] !== undefined) {
				dataArray.push(fields[f]);
			}
		}
		var fieldPh = [];
		var valuePh = [];
		fields.forEach(function(field) {
			//console.log(data[field]);
			if (data[field] !== undefined) {
				fieldPh.push('??');
				valuePh.push('?')
				dataArray.push(data[field]);
			}
		});
		if(options.values) {
			var updateVals = [];
			options.values.forEach(function(field) {
				updateVals.push('??=?');
				dataArray.push(field);
				dataArray.push(data[field]);
			})
			this.query('INSERT INTO ?? (' + fieldPh.join(', ') + ') values (' + valuePh.join(', ') + ') ON DUPLICATE KEY UPDATE ' + updateVals.join(', '), dataArray, cb);
		} else {
		// Big assumption - Assumes single autoincrement field named id
			this.query('INSERT INTO ?? (' + fieldPh.join(', ') + ') values (' + valuePh.join(', ') + ')', dataArray, cb);
		}
	};

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	var data = {
		bk1: function() {
			return 'bk' + getRandomInt(1, 100);
		},
		bk2: function() {
			return 'bk' + getRandomInt(1, 140);
		},
		bk3: function() {
			return 'bk' + getRandomInt(1, 1000);
		},
		value1: function() {
			return getRandomInt(0, 1000)
		},
		value2: function() {
			return getRandomInt(0, 1000)
		},
		value3: function() {
			return getRandomInt(0, 1000)
		}
	}


	var inserts = [];

	for (var x = 0; x < 1000; x++) {
		inserts.push(function(callback) {
			conn.insert('data', {
				'breakdown1': data.bk1(),
				'breakdown2': data.bk2(),
				'breakdown3': data.bk3(),
				'value1': data.value1(),
				'value2': data.value2(),
				'value3': data.value3()
			}, {
				values: ['value1', 'value2', 'value3']
			}, function(err, result) {
				callback(err);
			})
		});
	}

	async.series(inserts, function(err, result) {
		conn.end();
	});
});
