@set @_PackJsInBatByWinest=0 /*
@ECHO OFF
CD /D "%~dp0"
CSCRIPT "%~0" //D //Nologo //E:JScript %1 %2 %3 %4 %5 %6 %7 %8 %9
IF %ERRORLEVEL% LSS 0 ( ECHO Failed. Error code is %ERRORLEVEL% )
PAUSE
EXIT /B
*/

var WshFileSystem = new ActiveXObject( "Scripting.FileSystemObject" );
var WshShell = WScript.CreateObject( "WScript.Shell" );
function LoadJs( aJsPath )
{
    var file = WshFileSystem.OpenTextFile( aJsPath , 1 );
    var strContent = file.ReadAll();
    file.Close();
    return strContent;
}
eval( LoadJs( "..\\..\\..\\_Include\\CWUtils\\JScript\\Windows\\CWGeneralUtils.js" ) );
eval( LoadJs( "..\\..\\..\\_Include\\CWUtils\\JScript\\Windows\\CWFile.js" ) );
eval( LoadJs( "..\\..\\..\\_Include\\CWUtils\\JScript\\Windows\\CWStd.js" ) );
eval( LoadJs( "..\\..\\..\\_Include\\CWUtils\\JScript\\Windows\\CWShell.js" ) );
eval( LoadJs( "FixOffset.js" ) );
eval( LoadJs( "Diff.js" ) );
eval( LoadJs( "AutoUpgrade.js" ) );


var strLogFolder = WshShell.CurrentDirectory + "\\Log";
CleanLogFolder();

for ( ;; )
{
    WScript.Echo( "\n\n\n========== Common Intermediate Language Tools by winest ==========\n" );
    WScript.Echo( "What would you like to do?\n" +
                  "1. Convert *.dll to *.il\n" +
                  "2. Convert *.il to *.dll\n" +
                  "3. Add/Subtract an address offset between specified lines\n" +
                  "4. Show the difference of two *.il files\n" +
                  "5. Auto-merge *.il files if there is no difference between the same method. This is useful to merge your modification after the original il files updated\n" +
                  "6. Leave" );
    var strChoice = WScript.StdIn.ReadLine();
    switch ( strChoice )
    {
        case "1" :
        {
            var strDllPath = CWUtils.SelectFile( "Please enter the dll file path:" );
            var strILPath = WshFileSystem.GetParentFolderName( strDllPath ) + "\\" + WshFileSystem.GetBaseName( strDllPath ) + ".il";
            var execObj = CWUtils.Exec( "\"" + WshShell.CurrentDirectory + "\\_Tools\\4.0\\ildasm.exe\" \"" + strDllPath + "\" /OUT=\"" + strILPath + "\" /UTF8" , true );
            WScript.Echo( "\"" + WshShell.CurrentDirectory + "\\_Tools\\4.0\\ildasm.exe\" \"" + strDllPath + "\" /OUT=\"" + strILPath + "\" /UTF8" );
            if ( 0 == execObj.ExitCode )
            {
                WScript.Echo( "Conversion succeed" );
            }
            else
            {
                WScript.Echo( "Conversion failed with code " + execObj.ExitCode );
            }
            break;
        }
        case "2" :
        {
            var strILPath = CWUtils.SelectFile( "Please enter the il file path:" );
            var strDllPath = WshFileSystem.GetParentFolderName( strILPath ) + "\\" + WshFileSystem.GetBaseName( strILPath ) + ".dll";
            var strResPath = WshFileSystem.GetParentFolderName( strILPath ) + "\\" + WshFileSystem.GetBaseName( strILPath ) + ".res";
            var execObj = CWUtils.Exec( "\"" + WshShell.CurrentDirectory + "\\_Tools\\4.0\\ilasm.exe\" /DLL /OUTPUT=\"" + strDllPath + "\" /RESOURCE=\"" + strResPath + "\" \"" + strILPath + "\"" , true );
            WScript.Echo( "\"" + WshShell.CurrentDirectory + "\\_Tools\\4.0\\ilasm.exe\" /DLL /OUTPUT=\"" + strDllPath + "\" /RESOURCE=\"" + strResPath + "\" \"" + strILPath + "\"" );
            if ( 0 == execObj.ExitCode )
            {
                WScript.Echo( "Conversion succeed" );
            }
            else
            {
                WScript.Echo( "Conversion failed with code " + execObj.ExitCode );
            }
            break;
        }
        case "3" :
        {            
            var strSrcPath = CWUtils.SelectFile( "Please select file" );
            WScript.Echo( "Please enter the start line number" );
            var nStartLine = parseInt( WScript.StdIn.ReadLine() );
            WScript.Echo( "Please enter the stop line number" );
            var nStopLine = parseInt( WScript.StdIn.ReadLine() );
            WScript.Echo( "Please enter the size need to add" );
            var nSize = parseInt( WScript.StdIn.ReadLine() );

            if ( true == CWUtils.SelectYesNo( "Are this ok? (y/n)\n" + 
                                              "File=" + strSrcPath + "\n" +
                                              "Start Line=" + nStartLine + "\n" +
                                              "Stop Line=" + nStopLine + "\n" +
                                              "Size=" + nSize + "\n" ) )
            {
                var strDstPath = WshFileSystem.GetParentFolderName(strSrcPath) + "\\" + WshFileSystem.GetBaseName(strSrcPath) + "_new." + WshFileSystem.GetExtensionName(strSrcPath);
                if ( true == FixOffset( strSrcPath , strDstPath , nStartLine , nStopLine , nSize , strLogFolder ) )
                {
                    WScript.Echo( "FixOffset() succeed" );
                }
                else
                {
                    WScript.Echo( "FixOffset() failed" );
                }
            }
            break;
        }
        case "4" :
        {
            WScript.Echo( "Not implemented yet");
            //var strSrcPath = CWUtils.SelectFile( "Please select source file" );
            //var strDstPath = CWUtils.SelectFile( "Please select destination file" );
            
            //Diff( strSrcPath , strDstPath , strLogFolder );
            break;
        }
        case "5" :
        {
            WScript.Echo( "Not implemented yet" );
            break;
        }
        case "6" :
        {
            if ( true == CWUtils.SelectYesNo( "Are you going to leave? (y/n)" ) )
            {
                WScript.Echo( "Successfully End" );
                WScript.Quit( 0 );
            }
            break;
        }
        default :
        {
            WScript.Echo( "Unknown choice: " + strChoice );
            break;
        }
    }
}


function CleanLogFolder()
{
    if ( WshFileSystem.FolderExists(strLogFolder) )
    {
        var folder = WshFileSystem.GetFolder( strLogFolder );

        var enumFolder = new Enumerator( folder.SubFolders );
        for ( ; ! enumFolder.atEnd() ; enumFolder.moveNext() )
        {
            WshFileSystem.DeleteFolder( enumFolder.item().Path , true );
        }
        var enumFile = new Enumerator( folder.Files );
        for ( ; ! enumFile.atEnd() ; enumFile.moveNext() )
        {
            WshFileSystem.DeleteFile( enumFile.item().Path , true );
        }
    }
}
