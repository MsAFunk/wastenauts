<style>
.main-nav {width:calc(100% - 22px); min-height:100px; position:fixed; top:0; left:50%; transform: translateX(-50%); z-index:110; background: #464445;border-bottom:3px #000 solid;}
    .main-nav:before {content:" "; width:calc(100% + 23px); min-height:100px; position:fixed; left:-12px; top:0; background: #464445; }
    .logo {position:absolute; top:-35px; left:5px;}
    .main-nav ul {
        width:calc(100% - 200px); margin:0; padding:40px; position:absolute; top: 0; right:0;
        list-style:none; text-align: right;}
    .main-nav li {width:auto; height:34px; display:inline-block; vertical-align: middle; margin-left:55px; font: 20px/32px 'Permanent Marker', cursive; letter-spacing:.05em; }
    .main-nav a {color:#fff;}

    .comic-borders:before {
        content: " ";
        width:10px; height:calc(100vh - 100px); 
        position: fixed;	top: 100px; left: 0; z-index: 100;
        background: #464445; border-right: 3px solid #000;
    }
    .comic-borders:after {
        content: " ";
        width:10px; height:calc(100vh - 100px);
        position: fixed;	top: 100px; right: 0; z-index: 100;
        background: #464445; border-left: 3px solid #000;
    }

@media screen and (max-width:1155px) {
    .logo {position:absolute; top:-10px; left:-10px;}
	.logo img{width:120px; height:120px; }
    .main-nav ul {width:calc(100% - 100px);padding:20px;}
}

@media all and (max-width:800px) {
	.main-nav li.social {display:none;}
	.main-nav li {margin:0 10px;}
}

@media all and (max-width:400px) {
    .main-nav li.info {display:none;}
}

</style>

<header class="main-nav">
    <h1 class="logo"><img src="/images/logo.png" alt="Wastenauts"></h1>
    <ul>
        <li><a href="https://store.steampowered.com/app/1357590/" target="_blank"><img src="/images/logo-steam.png" alt="Download on Steam"></a></li>
        <li><a href="https://gamejolt.com/games/fromrust/470569" target="_blank"><img src="/images/logo-gamejolt.png" alt="Download on Game Jolt"></a></li>
        <li class="info"><a href="https://wastenauts.gamepedia.com/Wastenauts_Wiki" target="_blank">Wiki</a></li>
        <li class="info"><a href="https://wastenauts.tumblr.com/" target="_blank">Dev Blog</a></li>
        <li class="info"><a href="https://razburygames.threadless.com" target="_blank">Merch</a></li>
        <li class="social"><a href="https://discord.gg/uCUeWKG"><img src="images/icon-discord.svg" alt="Discord" width="20"></a></li>
        <li class="social"><a href="https://twitter.com/WastenautsGame" target="_blank"><img src="images/icon-twitter.svg" alt="Twitter" width="22"></a></li>
    </ul>
</header>
<div class="comic-borders"></div>