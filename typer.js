/**
 * Created by ds on 2015/5/13.
 */
(function( $ ){

    var _template = {
        sentenceLine: "<span id='#sentenceid#' style=\"color:#fontcolor#\"></span>",
        prompt: "<span style=\"border-bottom:3px solid #promptcolor#;width:10px;margin-bottom: -3px;display: inline-block\" id=\"#promptid#\"></span><br/>"
    }

    var _sentenceid = null;
    var _promptid = null;
    var _timeoutHolder = null;

    var _settings = {
        typeDuration: 100, // 打字速度 毫秒
        blinkDuration: 300, // 光标闪烁速度 毫秒
        fontColor: "#777",
        promptColor: "#666",
        magicEffect: false,
        randomColor: false,
        data: []
    }

    $.fn.typer = function( options ){

        $.extend( _settings, options );
        _sentenceid = getRandStr();
        _promptid = getRandStr();

        return this.each(function(){
            $(this).append($( _template.prompt.replace("#promptid#", _promptid).replace("#promptcolor#", _settings.promptColor) ));
            togglePrompt();
            typeSentence( _settings.data, 0, 0 );
        });
    }

    function typeSentence( sentences, len, idx ){
        if( idx == sentences.length-1 && len == sentences[idx].length ){
            clearTimeout( _timeoutHolder );
            return;
        }else if( len == sentences[idx].length ){
            breakLine();
            beginNewLine( idx+1 );
            typeSentence( sentences, 0, idx+1 );
        }else{
            _timeoutHolder = setTimeout(function(){
                typeSentence( sentences, len+1, idx );
            },_settings.typeDuration);
        }

        if( len == 0 && idx == 0 ){
            beginNewLine( 0 );
        }

        var randColorStr = _settings.randomColor ? "color:#"+getRandColor()+";" : "";
        if(_settings.magicEffect){
            $("#"+_sentenceid+idx).append($("<span style='"+randColorStr+"' class='typer_singleunit'>"+sentences[idx].charAt(len)+"</span>"));
        }else{
            $("#"+_sentenceid+idx).html( sentences[idx].substr(0, len) );
        }

    }

    function togglePrompt(){
        setInterval( function(){
            var p = $("#"+_promptid);
            if(p.prop('isshow') ){
                p.hide(50,function(){
                    p.prop( 'isshow', false );
                });
            }else{
                p.show(50,function(){
                    p.prop( 'isshow', true );
                });
            }
        }, _settings.blinkDuration );
    }

    function beginNewLine( index ){
        $(_template.sentenceLine.replace("#sentenceid#",_sentenceid+index).replace("#fontcolor#",_settings.fontColor)).insertBefore($("#"+_promptid));
    }

    function breakLine( ){
        $("<br>").insertBefore($("#"+_promptid));
    }

    function getRandStr(){
        var rand = Math.ceil( Math.random()*999999999999 ) + 1000000000000;
        return rand.toString(16);
    }

    function getRandColor(){
        var cnt = 0;
        var result = "";
        while( cnt < 6 ){
            result += Math.floor((Math.random()-0.001)*16).toString(16);
            cnt ++;
        }
        return result;
    }

})(jQuery)