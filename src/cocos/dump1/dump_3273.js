function sendScroll(){
   var totalH = document.body.scrollHeight || document.documentElement.scrollHeight;
   var clientH = window.innerHeight || document.documentElement.clientHeight;
   var scrollH = document.body.scrollTop || document.documentElement.scrollTop;
   var validH = scrollH + clientH;
   var result = (validH/totalH*100).toFixed(2);
   console.log('LandingPageLogscroll status: (' + scrollH + '+' + clientH + ')/' + totalH + '=' + result);
   window.JS_LANDING_PAGE_LOG_OBJ.readPercent(result);
}
sendScroll();
window.addEventListener('scroll', function(e){
    sendScroll();
});