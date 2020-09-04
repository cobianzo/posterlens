<html>
    <head>
        <script src="node_modules/three/build/three.min.js"></script>
        <!-- <script src="node_modules/panolens/build/panolens.js"></script> -->
        <script src="panolens/panolens.js"></script>
        <!-- <script src="node_modules/three-css2drender/CSS2DRenderer.js"></script> -->
        <!-- TODO: CSS2 is a module, and it shouldnt. I had to modify it by hand -->
        <!-- <script src="panolens/css3drenderer.js"></script> -->
        <!-- <script src="panolens/dragcontrols.js"></script> -->
        <script src="posterlens.js"></script>
        <script src="tesim.js"></script>

        <script type="text/javascript" src="posterlens-config.js"></script> 
        <link rel='stylesheet' id='posterlens-css'  href='posterlens.css?ver=5.5' type='text/css' media='all' />
    </head>

    <body>
        <div class='wrapper' style="max-width:1200px">

            <div id="posterlens-container" style="width:100%; height:100%"></div>
            <div class="modal" >
                <iframe src="assets/pdf.pdf"></iframe>
            </div>
        </div>
        <script>
            
            let pl = null;
            const config_file = 'posterlens-config.json';
           
                // pl: extesion of PANOLENS 
            pl = document.querySelector('#posterlens-container').posterlens(data);
            // DEBUG
            setTimeout(() => {
                window.scene = pl.viewer.getScene();
            }, 500);
            
        </script>

        <?php  require_once('edit-mode.html');  ?>

        <script>
            applyEditMode(pl);
        </script>

    </body>

</html>