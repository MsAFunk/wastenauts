<script>
	export let name;
</script>

<style>
	main {width:100%; height:100vh; margin:0; padding:0;}
	.main-nav {width:calc(100% - 22px); min-height:100px; position:fixed; top:0; left:50%; transform: translateX(-50%); z-index:110; background: #464445;border-bottom:3px #000 solid;}
		.main-nav:before {content:" "; width:calc(100% + 22px); min-height:100px; position:fixed; left:-12px; top:0; background: #464445; }
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
		main:after {
			content: " ";
			width:calc(100% - 20px); height:10px;
			position: fixed; bottom:0; left:10px; z-index: 110;
			background: #464445; border-top: 3px solid #000;}
	

		.comic-panel {width:100%; height:100vh; margin:0; padding:0; position:relative;}
			.divider {
				width:calc(100% - 20px); height:10px; position:relative; margin:0 auto; z-index:106; 
				background-color:#464445; border-top:3px #000 solid;border-bottom:3px #000 solid;
			}

			.screenshots {width:30%; position:absolute; bottom:50%; right:3%; transform: translateY(50%); }
				.screenshots ul { width:100%; list-style:none; margin:0; padding:0; text-align:right; vertical-align: middle;}
				.screenshots li { margin:30px;}
				.screenshots img {width:90%; max-width:350px; border:5px #464445 solid; outline:2px #000 solid;transition: all 0.2s ease;}
				.screenshots img:hover {width:100%; max-width:400px; cursor:pointer;}
			
			.jack {background:url(/images/main-menu.jpg) no-repeat center center fixed; background-size:cover;}			
				.jack .talk-bubble{width:60%; max-width:1250px; position:absolute; top:17%; left:1%;}
				.jack .talk-bubble:before { /*Jack Portrait*/
					content:" "; display:inline-block;
					width:50%; min-width:500px; max-width:690px; height:860px;
					position:absolute; left:0; top:0;
					background: url(/images/JACK.png) center no-repeat; background-size:contain;
				}
				.jack .talktext {width:50%; max-width: 720px; height: auto; position:absolute; left:40%; background-color: #7D2222;}
				.jack .tri-right.border.btm-left-in:before {border-color: #000 transparent transparent #000;}
				.jack .tri-right.btm-left-in:after{	border-color:#7D2222 transparent transparent #7D2222;}
			
			.buster {background:url(/images/wastes-day.jpg) no-repeat center center fixed; background-size:cover; overflow:hidden;}			
				.buster .talk-bubble{width:60%; max-width:1200px; position:absolute; top:17%; left:0;}
				.buster .talk-bubble:before { /*Portrait*/
					content:" "; display:inline-block;
					width:50%; min-width:500px; max-width:690px; height:700px;
					position:absolute; left:0; top:100px;
					background: url(/images/BUSTER.png) center no-repeat; background-size:contain;
				}
				.buster .talktext {width:50%; max-width: 720px; height: auto; position:absolute; left:36%; background-color: #CB9F19;}
				.buster .tri-right.border.btm-left-in:before {border-color: #000 transparent transparent #000;}
				.buster .tri-right.btm-left-in:after{	border-color:#CB9F19 transparent transparent #CB9F19;}

			.andrea {background:url(/images/wastes-night.jpg) no-repeat center center fixed; background-size:cover; overflow:hidden;}			
				.andrea .talk-bubble{width:60%; max-width:1250px; position:absolute; top:18%; left:0;}
				.andrea .talk-bubble:before { /*Portrait*/
					content:" "; display:inline-block;
					width:50%; min-width:500px; max-width:690px; height:700px;
					position:absolute; left:0; top:20px;
					background: url(/images/ANDREA.png) center no-repeat; background-size:contain;
				}
				.andrea .talktext {width:50%; max-width: 720px; height: auto; position:absolute; left:41%; background-color: #215FB0;}
				.andrea .tri-right.border.left-in:before {border-color:transparent #000 #000 transparent;}
				.andrea .tri-right.left-in:after{border-color:transparent  #215FB0   #215FB0 transparent;}

			.lena {background:url(/images/sewers.jpg) no-repeat center center fixed; background-size:cover; overflow:hidden;}			
			.lena .talk-bubble{width:60%; max-width:1260px; position:absolute; top:18%; left:2%;}
				.lena .talk-bubble:before { /*Portrait*/
					content:" "; display:inline-block;
					width:50%; height:800px;
					position:absolute; left:40px; top:50px;
					background: url(/images/LENA.png) center no-repeat; background-size:contain;
				}
				.lena .talktext {width:50%; max-width: 720px; height: auto; position:absolute; left:30%; background-color: #369136;}
				.lena .tri-right.border.btm-left-in:before {border-color: #000 transparent transparent #000;}
				.lena .tri-right.btm-left-in:after{border-color:#369136 transparent transparent #369136;}

			.trailer {background: url(/images/main-menu.jpg) no-repeat center center fixed #000; background-size:cover;}
				.background-filter {width:100%; height:100%; position:absolute; backdrop-filter: blur(100px) brightness(0.8);}
				.video-embed {
					width:80vw; height:80vh; max-width:1280px; max-height:720px; 
					position: absolute; left:50%; top:50%; transform: translate(-50%, -50%); 
					background: #000; border:2px #000 solid; outline:10px #464445 solid; box-shadow: 0 0 0 12px rgba(0,0,0,1)
				}

			

</style>

<main>
	<header class="main-nav">
		<h1 class="logo"><img src="/images/logo.png" alt="Wastenauts"></h1>
		<ul>
			<li><a href="https://store.steampowered.com/app/1357590/" target="_blank"><img src="/images/logo-steam.png" alt="Download on Steam"></a></li>
			<li><a href="https://gamejolt.com/games/fromrust/470569" target="_blank"><img src="/images/logo-gamejolt.png" alt="Download on Game Jolt"></a></li>
			<li><a href="https://wastenauts.fandom.com" target="_blank">Wiki</a></li>
			<li><a href="https://www.tumblr.com/blog/wastenauts" target="_blank">Dev Blog</a></li>
			<li><a href="https://razburygames.threadless.com" target="_blank">Merch</a></li>
			<li><a href="https://discord.gg/uCUeWKG"><img src="images/icon-discord.svg" alt="Discord" width="20"></a></li>
			<li><a href="https://twitter.com/WastenautsGame" target="_blank"><img src="images/icon-twitter.svg" alt="Twitter" width="22"></a></li>
		</ul>
	</header>
	<div class="comic-borders"></div>
	<div class="comic-panel jack">

		<div class="talk-bubble">
			<div class="talktext tri-right border round btm-left-in">
				<h2>So you wanna be a diver, huh?</h2>
				<p>Grab your friends and explore what’s left of the surface of Earth. Fight some machines. Blow ‘em up for parts. Put the parts back together to make cool toys. Or sell ‘em. You do you, Diver.</p>
			</div>
			
		</div>

		<a class="CTA-btn" href="https://www.kickstarter.com/projects/razburygames/wastenauts" target="_blank">Now on Kickstarter!</a>
	</div>
	
	<div class="divider"></div>
	
	<div class="comic-panel trailer">
		<div class="background-filter"></div>
		
		<div class="video-embed">
			<iframe style="width:100%; height:100%;" src="https://www.youtube.com/embed/JEBM7ErIPJs" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

		</div>	
	</div>

	<div class="divider"></div>
	
	<div class="comic-panel buster">
		<div class="talk-bubble">
			<div class="talktext tri-right border round btm-left-in">
				<h2>An Ever-Changing Wasteland</h2>
				<p>No two game sessions will ever be quite the same. You’re exploring - and fighting against - a location deck, and what goes into that deck, well, who knows?</p>
			</div>
		</div>
		<div class="screenshots">
			<ul>
				<li><img src="images/1-thumb.jpg" alt=""></li>
				<li><img src="images/2-thumb.jpg" alt=""></li>
				<li><img src="images/3-thumb.jpg" alt=""></li>
			</ul>
		</div>
	</div>

	<div class="divider"></div>
	
	<div class="comic-panel andrea">
		<div class="talk-bubble">
			<div class="talktext tri-right border round left-in">
				<h2>Drop in Solo, or With Friends</h2>
				<p>As long-time board and card game fans, we built this game to play with each other. That doesn’t mean you can't go it solo - the party’s four characters can be controlled by one to four players.</p>
			</div>
		</div>

		<div class="screenshots">
			<ul>
				<li><img src="images/4-thumb.jpg" alt=""></li>
				<li><img src="images/5-thumb.jpg" alt=""></li>
				<li><img src="images/6-thumb.jpg" alt=""></li>
			</ul>
		</div>

	</div>

	<div class="divider"></div>
	
	<div class="comic-panel lena">
		<div class="talk-bubble">
			<div class="talktext tri-right border round btm-left-in">
				<h2>Bring-Your-Own-Game</h2>
				<p>In Adventure Mode, you craft the location deck. Stuff it full of monsters, or just put in a bunch of loot. Easy, hard, brutal - build the experience you want to play and then grab a few friends to share it with.</p>
			</div>
		</div>

		<div class="screenshots">
			<ul>
				<li><img src="images/7-thumb.jpg" alt=""></li>
				<li><img src="images/8-thumb.jpg" alt=""></li>
				<li><img src="images/9-thumb.jpg" alt=""></li>
			</ul>
		</div>

	</div>

	


</main>