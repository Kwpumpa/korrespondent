RAD.views.ScrollSwipeExt = RAD.Blanks.ScrollableView.extend({
    events: {
        'touchstart .scroll-view': 'onTouchStart',
        'touchmove .scroll-view': 'onTouchMove',
        'touchend .scroll-view': 'onTouchEnd',
        'touchcancel .scroll-view': 'onTouchCancel'
    },
    oninit: function(){
        var self = this;
        this.scrollOptions = {
            useTransition: true,
            hScrollbar: false,
            vScrollbar: false,
            onScrollStart: function(){
                self.onScrollStart();
            },
            onRefresh: function(){
                self.onScrollRefresh();
            },
            onScrollMove: function(e){
                //console.log(e)
                self.onScrollMove(e);
            },
            onScrollEnd: function(){
                self.onScrollEnd();
            }
        }
    },
    onStartAttach: function(){
        var viewCoord  = this.el.getBoundingClientRect();
        this.halfWidth = viewCoord.width * 0.5;
    },
    onScrollStart: function(){

    },
    onScrollRefresh: function(){

    },
    onScrollMove: function(){

    },
    onScrollEnd: function(){

    },
    coordinates: {
        x: [],
        y: []
    },
    onTouchStart: function(){
        this.coordinates.x = [];
        this.coordinates.y = [];
        this.directionDefined = false;
        this.startCoord = this.el.getBoundingClientRect();
    },
    onTouchMove: function(e){
        if(this.coordinates.x.length<5){
            this.coordinates.x.push(e.originalEvent.changedTouches[0].clientX);
            this.coordinates.y.push(e.originalEvent.changedTouches[0].clientY);
        }else if(!this.directionDefined){
            this.directionVert = this.isVertDirection(this.coordinates.x, this.coordinates.y);
            this.directionDefined = true;
        }else if(this.directionDefined && !this.directionVert){
            this.onMoveHorizontally(e)
        }
    },
    onTouchEnd: function(){
        if(!this.directionDefined || this.directionVert){
            return;
        }
        this.startCoord = {};
        var tr = this.el.style.transform,
            value = tr.split('(')[1];
        value = parseInt(value.split(')')[0]);
        this.el.style.transition  = 'all 0.3s ease-in-out';
        this.el.removeAttribute('style');
        this.finishSwipe(value, this.halfWidth);
    },
    onMoveHorizontally: function(e){
        this.el.style.transition  = 'none';
        var firstX = this.coordinates.x[this.coordinates.x.length-1],
            newX = e.originalEvent.changedTouches[0].clientX,
            diff = this.startCoord.left + (newX - firstX);

        if(diff<0){
            this.moveLeft(diff);
        }else{
            this.moveRight(diff);
        }

    },
    moveLeft: function(diff){
        var viewCoord  = this.el.getBoundingClientRect();
        if(viewCoord.left<0){
            return;
        }
        if(diff < 0){
            diff = 0
        }
        this.el.style.transform = 'translateX(' + (diff)+ 'px)';
    },
    moveRight: function(diff){
        if(this.rightLineWidth && diff > this.rightLineWidth){
            diff = this.rightLineWidth;
        }
        this.el.style.transform = 'translateX(' + (diff)+ 'px)';
    },
    isVertDirection: function(xArr, yArr){
        var xSum = 0, ySum = 0;
        for(var i=0; i<xArr.length; i++){
            xSum+=xArr[i];
        }
        for(var j=0; j<xArr.length; j++){
            ySum+=yArr[j];
        }
        return Math.abs(xArr[0] - xSum/xArr.length) <= Math.abs(yArr[0] - ySum/yArr.length)

    }
});