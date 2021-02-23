<script>
	import Header from './Header.svelte';
	import Modal from './Modal.svelte';

	let showModal = false;
	let imagePath = 1;

	const toggleModal = (slide) => {
		showModal = !showModal;
		imagePath = slide;
	}

</script>

<style>
	main {width:100%; height:100vh; margin:0; padding:0;}
	main:after {
        content: " ";
        width:calc(100% - 20px); height:10px;
        position: fixed; bottom:0; left:10px; z-index: 110;
        background: #464445; border-top: 3px solid #000;
	}
	
		.comic-panel {width:100%; height:100vh; margin:0; padding:0; position:relative;}
			.divider {
				width:calc(100% - 20px); height:10px; position:relative; margin:0 auto; z-index:106; 
				background-color:#464445; border-top:3px #000 solid;border-bottom:3px #000 solid;
			}

			.jack {background:url(/images/main-menu.jpg) no-repeat center center fixed; background-size:cover;}			
				.jack .talk-bubble:before {background: url(/images/JACK.png) center no-repeat;	background-size:contain;}
				.jack .talktext {background-color: #7D2222;}
					.jack .tri-right.btm-left-in:after{	border-color:#7D2222 transparent transparent #7D2222;}
			
			.trailer {background: url(/images/main-menu.jpg) no-repeat center center fixed #000; background-size:cover;}
				.background-filter {width:100%; height:100%; position:absolute; backdrop-filter: blur(100px) brightness(0.8);}
				.video-embed {
					width:80vw; height:80vh; max-width:1280px; max-height:720px; 
					position: absolute; left:50%; top:50%; transform: translate(-50%, -50%); 
					background: #000; border:2px #000 solid; outline:10px #464445 solid; box-shadow: 0 0 0 12px rgba(0,0,0,1)
				}

		.screenshots {width:30%; position:absolute; bottom:50%; right:3%; transform: translateY(50%); }
				.screenshots ul { width:100%; list-style:none; margin:0; padding:0; text-align:right; vertical-align: middle;}
					.screenshots li { margin:30px;}
						.screenshots img {width:90%; max-width:350px; border:5px #464445 solid; outline:2px #000 solid;transition: all 0.2s ease;}
						.screenshots img:hover {width:100%; max-width:400px; cursor:pointer;}
			
			.buster {background:url(/images/wastes-day.jpg) no-repeat center center fixed; background-size:cover; overflow:hidden;}			
				.buster .talk-bubble:before {background: url(/images/BUSTER.png) center no-repeat;  background-size:contain;}
				.buster .talktext {background-color: #CB9F19;}
					.buster .tri-right.btm-left-in:after{	border-color:#CB9F19 transparent transparent #CB9F19;}

			.andrea {background:url(/images/wastes-night.jpg) no-repeat center center fixed; background-size:cover; overflow:hidden;}			
				.andrea .talk-bubble:before {background: url(/images/ANDREA.png) center no-repeat; background-size:contain;	}
				.andrea .talktext {background-color: #215FB0;}
					.andrea .tri-right.btm-left-in:after{border-color:#215FB0 transparent transparent #215FB0}

			.lena {background:url(/images/sewers.jpg) no-repeat center center fixed; background-size:cover; overflow:hidden;}			
				.lena .talk-bubble:before {background: url(/images/LENA.png) center no-repeat; background-size:contain;}
				.lena .talktext {background-color: #369136;}
					.lena .tri-right.btm-left-in:after	{border-color:#369136 transparent transparent #369136;}
			

</style>

<main>

	<Header />
	
	<Modal {imagePath} {showModal} on:click={toggleModal} />

	<div class="comic-panel jack">
		<div class="talk-bubble">
			<div class="talktext tri-right border round btm-left-in">
				<h2>So you wanna be a diver?</h2>
				<p>Grab your friends and explore what’s left of the surface of Earth. Fight some machines. Blow ‘em up for parts. Put the parts back together to make cool toys. Or sell ‘em. You do you, Diver.</p>
			</div>
		</div>

		<a class="CTA-btn" href="https://www.kickstarter.com/projects/razburygames/wastenauts" target="_blank">Now on Kickstarter!</a>
		<div class="divider"></div>
	</div>
	
	<div class="comic-panel trailer">
		<div class="background-filter"></div>
		<div class="video-embed">
			<iframe title="Wastenauts Announcement Trailer" style="width:100%; height:100%;" src="https://www.youtube.com/embed/JEBM7ErIPJs" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
		</div>
		<div class="divider"></div>
	</div>

	<div class="comic-panel buster">
		<div class="talk-bubble">
			<div class="talktext tri-right border round btm-left-in">
				<h2>An Ever-Changing Wasteland</h2>
				<p>No two game sessions will ever be quite the same. You’re exploring - and fighting against - a location deck, and what goes into that deck, well, who knows?</p>
			</div>
		</div>
		<div class="screenshots">
			<ul>
				<li on:click={() => toggleModal(1)}><img src="images/1-thumb.jpg" alt=""></li>
				<li on:click={() => toggleModal(2)}><img src="images/2-thumb.jpg" alt=""></li>
				<li on:click={() => toggleModal(3)}><img src="images/3-thumb.jpg" alt=""></li>
			</ul>
		</div>
		<div class="divider"></div>
	</div>

	<div class="comic-panel andrea">
		<div class="talk-bubble">
			<div class="talktext tri-right border round btm-left-in">
				<h2>Drop in Solo, or With Friends</h2>
				<p>As long-time board and card game fans, we built this game to play with each other. That doesn’t mean you can't go it solo - the party’s four characters can be controlled by one to four players.</p>
			</div>
		</div>
		<div class="screenshots">
			<ul>
				<li on:click={() => toggleModal(4)}><img src="images/4-thumb.jpg" alt=""></li>
				<li on:click={() => toggleModal(5)}><img src="images/5-thumb.jpg" alt=""></li>
				<li on:click={() => toggleModal(6)}><img src="images/6-thumb.jpg" alt=""></li>
			</ul>
		</div>
		<div class="divider"></div>
	</div>
	
	<div class="comic-panel lena">
		<div class="talk-bubble">
			<div class="talktext tri-right border round btm-left-in">
				<h2>Bring-Your-Own-Game</h2>
				<p>In Adventure Mode, you craft the location deck. Stuff it full of monsters, or just put in a bunch of loot. Easy, hard, brutal - build the experience you want to play and then grab a few friends to share it with.</p>
			</div>
		</div>
		<div class="screenshots">
			<ul>
				<li on:click={() => toggleModal(7)}><img src="images/7-thumb.jpg" alt=""></li>
				<li on:click={() => toggleModal(8)}><img src="images/8-thumb.jpg" alt=""></li>
				<li on:click={() => toggleModal(9)}><img src="images/9-thumb.jpg" alt=""></li>
			</ul>
		</div>
		<div class="divider"></div>
	</div>

</main>