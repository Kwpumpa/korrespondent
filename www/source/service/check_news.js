RAD.service("service.check_news", RAD.Blanks.Service.extend({
    requestTime: 60 * 1000,
    onInitialize: function(){
        this.settings = RAD.models.Settings;
        this.settings.on('change:selectedSubCategory', this.resetTracking, this);
        this.settings.on('change:lang', this.resetTracking, this);
        this.resetTracking();
    },
    onReceiveMsg: function (channel, data) {
        var method = channel.split('.')[2],
            fn = this[method];
        if (typeof fn === 'function') {
            fn.call(this, data);
        } else {
            console.log('RAD.services.Track can`t find method ' + method);
        }
    },
    resetTracking: function(){
        this.stopTracking();
        this.startTracking();
    },
    startTracking: function(){
        var self = this;
        this.trackId = window.setTimeout(function(){
            self.startTracking();
            RAD.models.News.setNews({});
        }, this.requestTime);
        RAD.models.News.setNews({});
    },

    stopTracking: function(){
        clearTimeout(this.trackId);
    }
}));