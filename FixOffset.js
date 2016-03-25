function FixOffset( aSrcPath , aDstPath , aStartLine , aStopLine , aOffset , aLogFolder )
{
    //Open file
    var fileSrc = new CWUtils.CAdoTextFile();   //Remember to new AdoTextFile so that all constants are initialized
    if ( false == fileSrc.Open( aSrcPath , "UTF-8" ) )
    {
        CWUtils.DbgMsg( "ERRO" , "FixOffset" , "Open source file failed. aSrcPath=" + aSrcPath , aLogFolder );
        return false;
    }

    var fileDst = new CWUtils.CWshTextFile();   //Remember to new AdoTextFile so that all constants are initialized
    if ( false == fileDst.Open( aDstPath , CWUtils.CWshTextFile.Mode.ForWriting , false , true ) )
    {
        CWUtils.DbgMsg( "ERRO" , "FixOffset" , "Open destination file failed. aDstPath=" + aDstPath , aLogFolder );
        return false;
    }
    CWUtils.DbgMsg( "INFO" , "FixOffset" , "Converting: " + aSrcPath + " => " + aDstPath , aLogFolder );

    var rePtn = /^(\s*IL_)([a-fA-F0-9]+)((:[\s]+?[^\s]+[\s]*)((IL_)([a-fA-F0-9]+)|(.*))|,\s*|\)\s*)$/
    var nCurrLine = 0;
    while ( ! fileSrc.AtEndOfStream() )
    {
        var strLine = fileSrc.ReadLine();
        nCurrLine++;

        if ( nCurrLine < aStartLine || nCurrLine > aStopLine )
        {
            fileDst.WriteLine( strLine );
        }
        else
        {
            var aryLine = rePtn.exec( strLine );
            var bTranslated = false;
        
            do
            {
                if ( null == aryLine )
                {
                    break;
                }
             
                var uLineAddr = parseInt( aryLine[2] , 16 );
                if ( isNaN(uLineAddr) )
                {
                    CWUtils.DbgMsg( "ERRO" , "FixOffset" , "Address parsing error. uLineAddr=" + uLineAddr + ", strLine=" + strLine , aLogFolder );
                    break;
                }
                uLineAddr = CWUtils.Padding( (uLineAddr + aOffset).toString(16) , 4 , "0" );
            
                var strNewLine;
                if ( 9 == aryLine.length )
                {
                    if ( aryLine[6] == "IL_" )
                    {
                        var uCodeAddr = parseInt( aryLine[7] , 16 ) || -1;
                        if ( -1 == uCodeAddr )
                        {
                            CWUtils.DbgMsg( "ERRO" , "FixOffset" , "Address parsing error. uCodeAddr=" + uCodeAddr + ", strLine=" + strLine , aLogFolder );
                            break;
                        }
                        uCodeAddr = CWUtils.Padding( (uCodeAddr + aOffset).toString(16) , 4 , "0" );
                        strNewLine = aryLine[1] + uLineAddr + aryLine[4] + aryLine[6] + uCodeAddr;
                    }
                    else
                    {
                        strNewLine = aryLine[1] + uLineAddr + aryLine[3];
                    }
                }
                else
                {
                    CWUtils.DbgMsg( "ERRO" , "FixOffset" , "aryLine.length is " + aryLine.length + " when parsing " + strLine , aLogFolder );
                    for ( var i = 0 ; i < aryLine.length ; i++ )
                    {
                        CWUtils.DbgMsg( "ERRO" , "FixOffset" , i + "=" + aryLine[i] , aLogFolder );
                    }
                    break;
                }
            
                CWUtils.DbgMsg( "VERB" , "FixOffset" , strLine + " => " + strNewLine , aLogFolder );

                fileDst.WriteLine( strNewLine );
                bTranslated = true;
            } while ( 0 );
        
            if ( false == bTranslated )
            {
                fileDst.WriteLine( strLine );
            }
        }
    }
    fileSrc.Close();
    fileDst.Close();
    
    return true;
}
