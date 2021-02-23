<script>
    export let imagePath = 1;
    export let showModal = false;

</script>

<style>
    .window-shade {width:100%; height:100%; position: fixed; top: 0; left: 0; background:rgba(0,0,0,.8); z-index: 200;} 
        
        .modal {
            width:60vw; 
            position: absolute; top: 50%; left:50%; transform: translate(-50%, -50%);
            border:2px #000 solid; outline:10px #464445 solid; box-shadow: 0 0 0 14px #000;
        }
            .modal img {width:100%; display:block; margin:0; padding:0;}
            .close {
                width:40px; height:40px; border-radius: 20px;
                position:absolute; top:-30px; right:-30px;
                background:#7D2222; border:2px #000 solid;
                
            }
            .close:hover {cursor:pointer;background:#a53030;}
            .close:after {
                content:"\00D7"; 
                width:100%; height:100%; display:block; position:relative; top:-20px; 
                text-align:center; font-size:40px; color:#fff;
            }
            .close span {visibility: hidden;}
</style>

{#if showModal}
<div class="window-shade" on:click|self>
    
    <div class="modal">       
        <img src="images/{imagePath}.jpg" alt="">        
        <div class="close" on:click|self><span>Close</span></div>
    </div>
    
    
</div>
{/if}