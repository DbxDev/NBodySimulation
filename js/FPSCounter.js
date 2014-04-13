/**
 * Created by Dorian on 13/04/14.
 */
function FPS(){};
FPS.frames_displayed = 0;
FPS.current_fps = 0;
FPS.displayFPS = function(delay) {
    setInterval( function(){
        FPS.frames_displayed = 0 ;
        var start = new Date();
        setTimeout( function() {
            var result =  1000 * FPS.frames_displayed / ((new Date()) - start);
            FPS.current_fps = Math.floor(result);
            // displayFPS(result);
        } , delay ||200);
    }  , 1.1*delay || 500);
};
function displayFPS(value) {
    $('span#fps').replaceWith('<span id="fps">'+value + ' fps</span>');
}