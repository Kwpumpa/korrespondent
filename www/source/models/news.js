RAD.model('OneNews', Backbone.Model.extend({
    idAttribute: "guid",
    initialize: function(data){
        this.unset('buffer');
    }
}), false);
RAD.model('OneBufferNews', Backbone.Model.extend({
    initialize: function(data){
        this.set('buffer', 1);
    }
}), false);
RAD.model('BufferNews', Backbone.Collection.extend({
    model: RAD.models.OneBufferNews
}), true);
RAD.model('News', Backbone.Collection.extend({
    model: RAD.models.OneNews,
    comparator: function(item){
        return -(+new Date(item.get('pubDate')));
    },
    initialize: function(){},
    getLastNews: function(data){
        var news = RAD.models.BufferNews.length ? RAD.models.BufferNews : this,
            maxDate = _.max(news.toJSON(), function(item){
                return +new Date(item.pubDate)
            });
        return _.filter(data, function(item){
            return +new Date(item.pubDate) > +new Date(maxDate.pubDate);
        });
    },
    getNews: function(opt, callback){
        var self = this,
            settings = RAD.models.Settings,
            val = settings.get('selectedSubCategory'),
            lang = settings.get('lang');
        var options = {
            url: 'http://k.img.com.ua/rss/' + RAD.newsUrls[lang] + '/' + RAD.newsUrls[val] + '.xml',
            type: 'GET',
            timeout: 10000,
            dataType: 'xml',
            success: function(data){
                data = self.parseXml(data);
                callback(data)
            }
        };
        $.extend(options, opt);
        $.ajax(options);
    },
    setBufferNews: function(opt){
        function callback(data){
            var newNews = RAD.models.News.getLastNews(data);
            _.each(newNews, function(item){
                item.buffer = 1;
            });
            RAD.models.BufferNews.add(newNews, {silent: true});
            RAD.utils.sql.insertRows(RAD.models.BufferNews.toJSON(), 'news').then(function(){
                RAD.models.BufferNews.trigger('add');
            });
        }
        this.getNews(opt, callback);
    },
    parseXml: function(xml){
        var newsArr = [];
        $(xml).find("item").each(function() {
            var $this = $(this),
                item = {
                    title: $this.find("title").text(),
                    link: $this.find("link").text(),
                    description: $this.find("description").text(),
                    fullText: $this.find("fulltext").text(),
                    author: $this.find("author").text(),
                    image:  RAD.utils.getImageLink($this.find("image").text()),
                    pubDate: $this.find("pubDate").text(),
                    guid: $this.find("guid").text(),
                    category: $this.find("category").text(),
                    comments: $this.find("comments").text(),
                    source: $this.find("source").text()
                };
            newsArr.push(item);
        });
        return newsArr;
    }
}), true);