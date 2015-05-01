(function(scope, win){
    var columns = {
        ident: "VARCHAR(50) UNIQUE",
        favorite: "INTEGER",
        guid: "INTEGER",
        author: "VARCHAR(100)",
        category: "TEXT",
        comments: "TEXT",
        description: "TEXT",
        fullText: "TEXT",
        image: "VARCHAR(100)",
        bigImage: "VARCHAR(100)",
        link: "TEXT",
        pubDate: "VARCHAR(50)",
        source: "TEXT",
        title: "TEXT",
        buffer: "BOOLEAN",
        newsId: "INTEGER",
        lang: "VARCHAR(5)"
    };
        //Create the database the parameters are 1. the database name 2.version number 3. a description 4. the size of the database (in bytes) 1024 x 1024 = 1MB
        var korDB = openDatabase("korrespondent_db", "0.1", "A Database of news", 1024 * 1024);
        korDB.transaction(function(t) {
            var query = '',
                keys = Object.keys(columns);

            for(var i=0; i<keys.length; i++){
                query += keys[i];
                query += ' ';
                query += columns[keys[i]];
                if(i !== keys.length-1){
                    query += ', ';
                }
            }
            t.executeSql("CREATE TABLE IF NOT EXISTS news (" + query + ")");
        }, function(e){
            console.log(e)
        });
    scope.insertRows = function(data, table){
        var keys = Object.keys(columns).sort(),
            columnsStr = keys.join(', '),
            promisesArr = [],
            valStr = '';

        for(var i=0; i<keys.length; i++){
            valStr += '?';
            if(i !== keys.length-1){
                valStr += ', '
            }
        }
        for(var j=0; j<data.length; j++)(function(j){
            data[j].lang = RAD.models.Settings.get('lang');
            data[j].newsId = data[j].newsId || +RAD.models.Settings.get('selectedSubCategory');
            data[j].ident = data[j].guid + '_' + data[j].newsId + '_' + data[j].lang;
            promisesArr.push(
                new Promise(function(resolve, reject){
                korDB.transaction(function(t) {
                    var dataArr = [];
                    for(var k=0; k<keys.length; k++){
                        dataArr.push(data[j][keys[k]] || '')
                    }
                    var queryStr = "INSERT OR REPLACE INTO " + table + " (" + columnsStr + ") VALUES (" + valStr + ")";
                    t.executeSql(queryStr, dataArr, function(e, rs){
                        resolve(e, rs)
                    });
                }, function(e){
                    reject(e)
                });
            }))
        })(j)
       return Promise.all(promisesArr);
    };
    scope.getRows = function(query){
        console.log(query)
        var result = [];
        return new Promise(function(resolve, reject){
            korDB.transaction(function(t) {
                t.executeSql(query, [], function(e, rs){
                    for(var i=0; i<rs.rows.length; i++) {
                        var row = rs.rows.item(i);
                        result.push(row);
                    }
                    resolve(result, e)
                });
            }, function(e){
                reject(e)
            });
        });

    };
})(RAD.namespace('RAD.utils.sql', {}), this);