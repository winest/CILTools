function ClassInfo( aClassName )
{
    this.strName = aClassName;

    this.mapClass = {};
    this.mapMethod = {};
    this.mapField = {};
}

function RootTree()
{
    var pCurrClass = this;
    var pCurrMethod = null;
    
    var mapClass = {};
    var mapMethod = {};
    var mapField = {};

    this.AddClass( aClassStr )
    {
        var pNewClass = new ClassInfo( aClassStr );
        if ( pCurrClass != null )
        {
            pCurrClass.mapClass[aClassStr] = pNewClass;
        }
        pCurrClass = pNewClass;
    }
}

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


    //https://msdn.microsoft.com/en-us/library/x53a06bb.aspx
    var aryKeywords = [ "nested" , "abstract" , "add" , "alias" , "as" , "ascending" , "async" , "await" , "base" , "bool" , "break" , "byte" , "case" , "catch" , "char" , "checked" , "class" , "const" , "continue" , "decimal" , "default" , "delegate" , "descending" , "do" , "double" , "dynamic" , "else" , "enum" , "event" , "explicit" , "extern" , "false" , "finally" , "fixed" , "float" , "for" , "foreach" , "from" , "get" , "global" , "goto" , "group" , "if" , "implicit" , "in" , "in (generic modifier)" , "int" , "interface" , "internal" , "into" , "is" , "join" , "let" , "lock" , "long" , "namespace" , "new" , "null" , "object" , "operator" , "orderby" , "out" , "out (generic modifier)" , "override" , "params" , "partial" , "private" , "protected" , "public" , "readonly" , "ref" , "remove" , "return" , "sbyte" , "sealed" , "select" , "set" , "short" , "sizeof" , "stackalloc" , "static" , "string" , "struct" , "switch" , "this" , "throw" , "true" , "try" , "typeof" , "uint" , "ulong" , "unchecked" , "unsafe" , "ushort" , "using" , "value" , "var" , "virtual" , "void" , "volatile" , "where" , "while" , "yield" ];
    var pTree = new RootTree();
    var PARSER_STATE = { "NONE" : 0 , 
                         "BLOCK_START" : 1 , "BLOCK_END" : 2 ,
                         "COMMENT_SINGLE" : 3 , "COMMENT_START" : 4 , "COMMENT_END" : 5 ,
                         "CLASS" : 6 , "FIELD" : 7 , "METHOD" : 8 , "UNKNOWN" : 9 };
    var nPrevParserState = PARSER_STATE.NONE;
    var nParserState = PARSER_STATE.NONE;

    var aryPtns;
    aryPtns[PARSER_STATE.NONE] = /^\s*$/;
    aryPtns[PARSER_STATE.BLOCK_START] = /^\s*\{$/;
    aryPtns[PARSER_STATE.BLOCK_END] = /^\s*\}$/;
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
            if ( null != aryLine && nPrevParserState != nParserState )
            {
                nPrevParserState = nParserState;
                nParserState = state;
                break;
            }
        }

        //Skip block comment
        if ( ( nParserState == PARSER_STATE.COMMENT_SINGLE ) ||
             ( nPrevParserState == PARSER_STATE.COMMENT_START && nParserState != PARSER_STATE.COMMENT_END ) )
        {
            continue;
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
                break;
            }
            case PARSER_STATE.CLASS :
            {
                var strClass = aryLine[1].split( " " ).pop();
                pTree.AddClass( strClass );
                break;
            }
            case PARSER_STATE.METHOD :
            {
                var strClass = aryLine[1].split( " " ).pop();
                pTree.AddClass( strClass );
                break;
            }
        }
        
        
        
        
    }
    fileSrc.Close();
    fileDst.Close();
}
