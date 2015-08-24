function Diff( aSrcPath , aDstPath , aLogFolder )
{
    //Open file
    var fileSrc = new CWUtils.CAdoTextFile();   //Remember to new AdoTextFile so that all constants are initialized
    if ( false == fileSrc.Open( aSrcPath , "UTF-8" ) )
    {
        WScript.Echo( "fileSrc.Open() failed. aSrcPath=" + aSrcPath );
        WScript.Quit( -1 );
    }

    var fileDst = new CWUtils.CWshTextFile();   //Remember to new AdoTextFile so that all constants are initialized
    if ( false == fileDst.Open( aDstPath , CWUtils.CWshTextFile.Mode.ForWriting , false , true ) )
    {
        WScript.Echo( "fileDst.Open() failed. aDstPath=" + aDstPath );
        WScript.Quit( -1 );
    }
    WScript.Echo( "Converting: " + aSrcPath + " => " + aDstPath );



    var PARSER_STATE = { "NONE" : 0 , 
                         "COMMENT_SINGLE" : 1 , "COMMENT_START" : 2 , "COMMENT_END" : 3 ,
                         "CLASS" : 4 , "FIELD" : 5 , "METHOD" : 6 , "UNKNOWN" : 7 };
    var nParserState = PARSER_STATE.NONE;

    var aryPtns;
    aryPtns[PARSER_STATE.NONE] = /^\s*$/;
    aryPtns[PARSER_STATE.COMMENT_SINGLE] = /^\s*\/\/(.*)/;
    aryPtns[PARSER_STATE.COMMENT_START] = /^\s*\/\*(.*)/;
    aryPtns[PARSER_STATE.COMMENT_END] = /^(.*)\*\//;
    aryPtns[PARSER_STATE.CLASS] = /^\s*\.class.*?([^ ]+)$/;
    aryPtns[PARSER_STATE.FIELD] = /^\s*\.field.*?([^ ]+)/;
    aryPtns[PARSER_STATE.METHOD] = /^\s*\.method.*\r\n.*?([^ ]+\(.*\)).*$/;
    aryPtns[PARSER_STATE.UNKNOWN] = /.*/;

    var nCurrLine = 0;
    while ( ! fileSrc.AtEndOfStream() )
    {
        var strLine = fileSrc.ReadLine();
        nCurrLine++;
        
        var aryLine = null;
        for ( var state in aryPtns )
        {
            aryLine = aryPtns[state].exec( strLine );
            if ( null != aryLine )
            {
                nParserState = state;
                break;
            }
        }
    
        switch ( nParserState )
        {
            case PARSER_STATE.NONE :
            {
                break;
            }
            case PARSER_STATE.COMMENT_SINGLE :
            {
                var strComment = aryLine[1];
            }
        }
        
        
        
        
    }
    fileSrc.Close();
    fileDst.Close();
}
