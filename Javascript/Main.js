var Main = 
{    
  // Main object 
  pluginAPI : null,
  player : null,
  pluginw :null,
  pluginAudio : null,
  ti:null,
  originalSource:null
}
  
var widgetAPI = new Common.API.Widget(); 
var tvKey = new Common.API.TVKeyValue();

var vol;
var userMute;

 Main.onLoad = function()
{
    if (!Main.init())  widgetAPI.sendReturnEvent();
    Main.originalSource = Main.pluginAPI.GetSource();
    widgetAPI.sendReadyEvent(); 
    Main.showTV();
    Main.pluginw.SetScreenRect( 191,70,320,180);
    NNaviPlugin = document.getElementById("pluginObjectNNavi");
    NNaviPlugin.SetBannerState(1);
    
    vol = Main.pluginAudio.GetVolume();
    userMute = Main.pluginAudio.GetUserMute();
    
    
    window.onShow = Main.initKeys;
    
}
 
 
Main.initKeys = function(){
	
	pluginAPI.unregistKey(tvKey.KEY_CH_UP);
	pluginAPI.unregistKey(tvKey.KEY_CH_DOWN);
}

Main.unLoad = function()
 {
             
            var mwPlugin = document.getElementById("pluginTVMW");
            if (mwPlugin && (Main.originalSource != null) )
            {
                /* Restore original TV source before closing the widget */
                mwPlugin.SetSource(Main.originalSource);
                alert("Restore source to " + this.originalSource);
                
            }
            
 }
    
    
 Main.init = function()
{
    var success = true;
    var major;
    var minor;
    var chennelNumber;
    var currentSource;
    
    alert("Main.onLoad()"); 
     Main.pluginAPI = document.getElementById("pluginTVMW");
     Main.pluginAudio = document.getElementById("pluginAudio");
     if (!Main.pluginAPI)
    {
        success = false;
        alert("Main.pluginAPI Failed");
    }
    else
    {
		Main.player = window["flvplayer"];
       alert("Main.pluginAPI Succeed");
    
    }
    
       
    Main.pluginw = document.getElementById("pluginWindow");
    if (!Main.pluginw)  
       {
           alert("pluginWindow not created");
           success = false;
       }
    return success;
}

Main.keyDown = function()
{ 
    var keyCode = event.keyCode;
    switch (keyCode)
     { 
             case tvKey.KEY_CH_UP:
             Main.pluginw.SetScreenRect( 191,70,320,180);
           
             Main.chUp();
                break;
                
            case tvKey.KEY_CH_DOWN:
            Main.pluginw.SetScreenRect( 191,70,320,180);
                 Main.chDown();
                break;
                
           case tvKey.KEY_VOL_UP:
        case tvKey.KEY_PANEL_VOL_UP:
   //     alert("Vol UP..--------");
                 Main.volInc(); 
                    break;
            
        case tvKey.KEY_VOL_DOWN:
        case tvKey.KEY_PANEL_VOL_DOWN:
    //    alert("Vol DOWN.--------");
                 Main.volDec();
                break;     
                
           case tvKey.KEY_MUTE:
                Main.handleMute();
                break;
                
           
                
         default:
            alert("Unhandled key"+event.keyCode);
            break;
      } 
 }
  
     Main.chUp = function(){
            alert("Main.chUp"); 
            currentSource = Main.pluginAPI.GetSource();
            major = Main.pluginw.GetCurrentChannel_Major();
            alert("the value of major issssssssssssssssss: "+major);
            minor = Main.pluginw.GetCurrentChannel_Minor();
            var Channel = document.getElementById("Channel");  
            var channelNum = document.getElementById("channelNum");  
              if(currentSource == 0){ 
                  
                           major+=1;
                       
                          Main.player.show(major,minor); 
                          if(major == 136){  Main.player.show(1,minor);  major=1;}
                          alert("Major is: "+ major);
                          Channel.style.visibility = "visible";
                          channelNum.innerHTML = major;
                        
                          if(Main.ti!=null)
                          {
                             clearTimeout(Main.ti);
                             Main.ti=null;
                           }
                         Main.ti=setTimeout("Channel.style.visibility =  'hidden';",1000);
                        Main.setChl();
            }
            else{
                    alert("Not Available");
            }
                
    }

    Main.chDown = function(){
            alert("Main.chDown");  
            currentSource = Main.pluginAPI.GetSource();
            major = Main.pluginw.GetCurrentChannel_Major();
            minor = Main.pluginw.GetCurrentChannel_Minor();
            var Channel = document.getElementById("Channel");  
            var channelNum = document.getElementById("channelNum");    
              if(currentSource == 0){
                    
                      major-=1;
             
                      Main.player.show(major,minor); 
                      
                         if(major == 0){  Main.player.show(135,minor); major = 135;}
                         alert("Major is: "+ major);
                         Channel.style.visibility = "visible";
                           channelNum.innerHTML = major;
                          if(Main.ti!=null){
                            clearTimeout(Main.ti);
                            Main.ti=null;
                         }
                      
                         Main.ti=setTimeout("Channel.style.visibility =  'hidden';",1000);
                            Main.setChl();
              
            }
            else{
                    alert("Not Available");
            }
    }
    
    Main.showTV= function(){
        var left = 50;
        var top = 58;
        var width = 472;
        var height =  270;
        alert("showTV"+Main.pluginAPI.GetSource()+" "+Main.pluginw.GetScreenRect( ));   
          
       Main.pluginw.SetSource(0);
       alert("showTV"+Main.pluginAPI.GetSource()+" "+Main.pluginw.GetScreenRect( ));   
       major = Main.pluginw.GetCurrentChannel_Major();
       minor = Main.pluginw.GetCurrentChannel_Minor();
      Main.player.show(major,minor);  
      Main.setChl();
   
   }
  
  Main.volInc = function()
{   
        Main.player.js_incVol();
  
 }

Main.volDec = function()
{ 
		Main.player.js_decVol();
   
}

Main.handleMute = function()
{       
         Main.player.js_changeMute(userMute);
        userMute = Main.pluginAudio.GetUserMute();
        alert("mute: ..." + userMute);
}

  

Main.getVol = function()
{
    vol = Main.pluginAudio.GetVolume();
   alert("getvol+++++" + vol);
    Main.player.audioVol(vol);
}

Main.setChl = function()
{
 channelName=Main.pluginw.GetCurrentChannel_Name( );
  Main.player.setChName(channelName);
 alert("Current Channel:----------" + channelName);
}

 window.onload = Main.onLoad;
 window.onkeydown = Main.keyDown;
 
 
 

 
 
 
 
 
 
  