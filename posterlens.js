/*
 * Posterlens
 * Version 1.0
 * https://www.cobianzo.com/
 */
;(function(quindow) {
    
    "use strict";

    var Posterlens = function(el) {

        // to access to the plugin instance when inside methods.
        var self = this; 		
        // 1.0 - setup, init and public methods and properties.
        console.log('Posterlens init', el);
        self.o = {
            
            callbackMouseOver: null,
            callbackMouseOut: null,
            callbackClick: null
        };
        
        // construct init
        self.el = el;
        
        // <instance>.viewer.getScene() : access to the scene. Parent of all worlds (also can be seen as rooms, techincally called panorama);
        // <instance>.viewer.getScene().children : access to all panorama in the plugin
        // <instance>.viewer.panorama : get the current panorama (it has attribute 'active' = true)

        self.init = function(options) {
            self.o = Object.assign(self.o, options);
            
            // PANOLENS call!
            const viewerOptions = { container: el, output: 'console', autoHideInfospot: false };
            if (self.o.initialLookAt) {
                viewerOptions.initialLookAt = new THREE.Vector3( ...self.o.initialLookAt );}
            
            self.viewer = new PANOLENS.Viewer( viewerOptions );

            // creation of every panorama in the scene. (at least 1)
            self.o.worlds.forEach( (scParams, i) => {
                const pano = new PANOLENS.ImagePanorama( scParams.panorama );
                pano.name = scParams.name? scParams.name : 'World_' + i;
                self.viewer.add( pano );
                createInvisibleWorld(pano)
            });
            
            // Now, for every scene created, set up and hotposts. This loop is the same than the one above.
            self.viewer.getScene().children.forEach( (pano, i) => {   
                // posters
                const sc = self.o.worlds[i];
                if (sc.hotspots && sc.hotspots.length ) 
                    sc.hotspots.forEach( (ht,i) => {
                       
                            // get Scene by name:
                            switch (ht.type) {
                                case 'link': // uses PANOLENS.link
                                    self.createLink( pano, ht.image, ht.pos, ( ht.link ? ht.link : null ), ht );
                                break;
                                case 'poster3d': // uses PANOLENS.infospot
                                    self.createPoster3D( pano, ht.image, ht.pos, ht );
                                break;
                                case 'text': // uses PANOLENS.infospot
                                    self.createText( pano, ht.text, ht.pos, ht );
                                break;
                                case 'text-2d': // uses PANOLENS.infospot
                                    self.createText2D( pano, ht.text, ht.pos, ht );
                                break;
                                default:  // 'poster-sprite' uses THREE. plane mesh
                                    self.createPosterSprite( pano, ht.image, ht.pos, ( ht.link ? ht.link : null ), ht );
                                break;
                            }
                        //else
                          //  self.createPanoLink( pano, ht.pos, ht.link, ht );
                    });

                // click events for this panorama (world)
                
                // pano.addEventListener( 'click', function( event ){
                //     if ( event.intersects.length > 0 ) {
                //         const intersect = event.intersects[0];
                //         console.log('clickedd! interset ' + intersect.object.constructor.name, intersect.object);

                //         if ( self.viewer.panorama.clickableObjects[intersect.object.name]  ) {
                //             console.log('HAS a click action');
                //             self.viewer.panorama.clickableObjects[intersect.object.name](event, intersect.object);
                //         }

                //         if ( intersect.object.constructor.name === 'Infospot') {
                //             const infoSpot = intersect.object;
                //             console.log('clicked infospot', infoSpot.name);

                            
                //             if (infoSpot.link) {
                                
                //                 switch (infoSpot.type) {
                //                     case 'open-world':
                //                         // nothing to do in this case, it will open scene as panolens works
                //                         break;
                //                     default:

                //                         break;
                //                 }
                //             }

                //         }
                //     }
        
                // } );
            });
            
            


            // for debuggins. Use chrome extension three.js inspector.
            setTimeout( () => window.scene = self.viewer.getScene(), 500 );

            // Now we return the instance. 
            // We can assign it to a var an access to public methods.
            return self;
        }; // end init

        // public functions.
        self.createLink = function(pano, image, position, linkendPanName, attrs = {} ) {
            const params = Object.assign( {
                scale: 300
            }, attrs );
            const linkedPan = self.getPanoramaByName(linkendPanName);
            if (linkedPan) {
                //console.log('creating link: ', arguments)
                pano.link(linkedPan , new THREE.Vector3( ...position ), params.scale, (image ? image : PANOLENS.DataImage.Arrow) );
                const infoSpot = pano.children[pano.children.length-1];
                // arrowInfospot.name = attrs.name? attrs.name : '';
                infoSpot.name = params.name? params.name : image.substring(image.lastIndexOf('/')+1); // i dont know how to set a name to it!
                if (params.hoverText) { // doesnt work in a link
                    infoSpot.addHoverText(params.hoverText);
                }
            }
        }
        self.createPosterSprite = function(pan, image = null, position, link = null, attrs = {} ) {
            const params = Object.assign( {
                scale: 2000
            }, attrs );
            var posterInfospot = new PANOLENS.Infospot(params.scale, image);
            posterInfospot.name = image? image.substring(image.lastIndexOf('/')+1) : 'no_name';
            posterInfospot.link = link;
            posterInfospot.position.set( ...position );
            if (params.hoverText) {
                posterInfospot.addHoverText(params.hoverText);
            }
            //set name, onclick listener
            updateObjectParams(posterInfospot, params, params);
            

            if (posterInfospot.link) {
                posterInfospot.addEventListener( 'click', (event) => {
                    const thePanorama = self.getPanoramaByName(posterInfospot.link);
                    if (thePanorama)
                        self.viewer.setPanorama(thePanorama);
                } );
                
            }
            pan.add(posterInfospot);

            // more attrs

            // const materialAttrs = {color: 0xffff00, side: THREE.DoubleSide};
            // if (image) materialAttrs.map = new THREE.TextureLoader().load( image );
            // const plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 10, 20, 3 ), new THREE.MeshBasicMaterial( materialAttrs ) );
            // plane.position.z = 50;
            // // we useew  a partent gizmo inn the centerof the scene to rotate respect the scene
            // var planeGizmo = new THREE.Mesh( new THREE.Geometry() ); 
            // planeGizmo.name = 'poster_'+self.getScene().posters.length+'_pivot';
            // self.getScene().posters.push(planeGizmo);
            // planeGizmo.add(plane);
            // self.getScene().sphereMesh.add( planeGizmo );
        }
        // still not working
        self.createPoster3D = function(panorama, image, position, attrs = {} ) {
            const params = Object.assign( {
                scale: 50
            }, attrs );

            const loader = new THREE.TextureLoader();
            const img = new Image();
            
            // we use the texture image to create the dimentions of the poster.
		    const texture1 = loader.load( image , function(im) { 
                const ratio = im.image.height/im.image.width;
                const geometry = new THREE.PlaneBufferGeometry( 10, 10 * ratio, 3 );
                const materialAttrs = {color: 0xffffff, side: THREE.DoubleSide, map: texture1, 
                    // as the alpha map for the material
                    //alphaMap: texture1,
                    // I also need to make sure the transparent
                    // property is true
                    //transparent: true,
                };
                const material2 = new THREE.MeshBasicMaterial( materialAttrs );
                const mesh = new THREE.Mesh( geometry, material2 );
                mesh.name = 'poster_' + self.viewer.panorama.children.length;
                
                // add onclick, hover
                updateObjectParams(mesh, params);
                updateParentParams(panorama, mesh, position, params.scale);
                

                // this works
                if (params.onHover || params.hoverText)  {
                    mesh.addEventListener( 'hoverenter', function(e) { 
                        // TODO:
                        console.log('hovering '+mesh.name)
                    } );
                    mesh.addEventListener( 'hoverleave', function(e) { 
                        // TODO:
                        console.log('hovering left from '+mesh.name)
                    } );
                }
                
            });
        }
        self.createText = function(panorama, text, position, attrs = {} ) {
            const params = Object.assign( {
                scale: 200,
                textColor: 0xfffbcb,
                specular: 0xfff000,
                emissive: 0xffffff,
                size: 1,
                options: {}
            }, attrs );

            // var textDiv = document.createElement( 'div' );
            // textDiv.className = 'label';
            // textDiv.textContent = 'text';
            // textDiv.style.marginTop = '-1em';
            // var textLabel = new THREE.CSS2DObject( textDiv );
            // textLabel.position.set( 0, 300, 0 ); 
            // //textLabel.scale.set( new THREE.Vector3(params.scale,params.scale,params.scale) ); 
            // updateObjectParams(textLabel, params);            
            // var front = self.getPosterByName('grid');
            // front.add(textLabel);
            // // panorama.add(textLabel);

            // var labelRenderer = new THREE.CSS2DRenderer();
            // labelRenderer.setSize( window.innerWidth, window.innerHeight );
            // labelRenderer.domElement.style.position = 'absolute';
            // labelRenderer.domElement.style.top = '0px';
            // labelRenderer.render( self, self.camera );
            // document.body.appendChild( labelRenderer.domElement );
            var loader = new THREE.FontLoader();

            loader.load( 'assets/fonts/Century_Gothic_Regular.js', function ( font ) {
                var mat = new THREE.MeshPhongMaterial({
                    color: params.textColor,
                    specular: params.specular,
                    shininess: 100,
                    emissive: params.emissive,
                    depthTest: 0, // with this 2 we show it always in front of the sphere world
                    transparent: true
                });
                var textMesh = createTextMesh(text, font, params.size, mat);

                textMesh.scale.set(params.scale, params.scale, params.scale ); 
                // obj.scale.set( new THREE.Vector3(params.scale,params.scale,params.scale) ); 
                updateObjectParams(textMesh, params);                
                updateParentParams(panorama, textMesh, position, params.scale);
            } );
    
        }

        self.createText2D = function(panorama, text, position, attrs = {} ) {
            // create a div html element 
            const params = Object.assign( {
                scale: 1,
                size: 100,
                width: 1000,
                color: 'white',
                background: 'black'
            }, attrs );

            const attachedObject = ('string' === typeof(position));
            // create a canvas element

            var canvas = new CanvasForTexture(text, params );
            
            // canvas contents will be used for a texture
            var texture1 = new THREE.Texture(canvas);
            texture1.needsUpdate = true;
            
            var material1 = new THREE.MeshBasicMaterial( { color:0xffffff, side:THREE.DoubleSide, map: texture1 } );
            if (params.background === 'transparent')
                material1.transparent = true;

            var textLabel = new THREE.Mesh(
                new THREE.PlaneGeometry(canvas.width, canvas.height),
                material1
            );
            textLabel.scale.set( params.scale, params.scale, params.scale);

            updateObjectParams(textLabel, params);
            if (attachedObject) {
                const parent = self.getPosterByName(position);
                if (parent) {
                    textLabel.position.set( 0, 0, 0 );
                    parent.add( textLabel );
                    // add onclick, hover                        
                    
                } else console.warn('could not create text 2d ', text);
            } else {
                updateParentParams(panorama, textLabel, position, params.scale);
            }

            
        }


        // called with var modal = new self.Modal('the title', 'https://the/pdf.pdf');
        self.Modal = function(title, pdf){

            this.title = title;
            this.pdf = pdf;

            return this;

        }


        // helper to common create object/poster
        const updateObjectParams = function(object, params) {
            
            if (params.name) {
                object.name = params.name;
            }
            if (params.onClick) {
                object.addEventListener( 'click', (event) => params.onClick(event, object) );
                // panorama.clickableObjects[mesh.name] = params.onClick;
            }
            if (params.onHoverEnter) 
                object.addEventListener( 'hoverenter', (event) => params.onHoverEnter(event, object) );
            if (params.onHoverLeave)
                object.addEventListener( 'hoverleave', (event) => params.onHoverLeave(event, object) );
            if (params.callback)
                params.callback(object);
            
        }
        const updateParentParams = function(panorama, object, position, scale) {
                // we create a parent to orbit it
                const OFFSET_Y = -19999;
                var pivotParent = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( { color: 0xffff00 , visible: false} ) );
                pivotParent.position.y = OFFSET_Y;
                panorama.add( pivotParent );
                pivotParent.add( object );

                object.position.set(0, -1*OFFSET_Y + position[1], Math.hypot(position[0], position[2])) // instead of moving it, we rotate the parent
                object.rotation.y = Math.PI;
                // calculate angle of rotation: 
                /*
                __x__
                |
                z
                |
                */
               var theta = Math.atan2(position[0], position[2] ) ;// + Math.PI ; // range (-PI, PI] [-180deg, 180deg]
               console.log(`${object.name} should rotate rads (x ${position[0]} z ${position[2]}): ${theta} PI` );
               object.parent.rotation.y = theta;
               object.parent.scale.x = object.parent.scale.y = object.parent.scale.z = 1;
               object.parent.name = object.name + '_pivot';
               object.scale.x = object.scale.y = object.scale.z = scale;
        }

        // private methods

        // to create a text object
        const createTextMesh =  function (text, font, size, mat) {
            var geo = new THREE.TextGeometry(text, {
                 font: font,
                 size: size,
                 height: 1,
                 width: 1000,
                 curveSegments: 2,
                 bevelEnabled: true,
                 material: 1,
                 extrudeMaterial: 0
             });
     
             geo.center();
             geo.computeBoundingBox();
     
             return new THREE.Mesh(geo, mat);
         }

        // helpers
        self.getPanoramaByName = (name) => self.viewer.getScene().children.find( sc => sc.name === name );
        self.getPosterByName = (name) => self.viewer.panorama.children.find( poster => poster.name === name );
        

        // create transparent world. When we use the helper to grab coordenates on click, this will give us the depth
        const createInvisibleWorld = function(pano) {
            var geometry = new THREE.SphereGeometry( 500, 32, 32 );
            var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.BackSide, visible: false } );
            var sphere = new THREE.Mesh( geometry, material );          
            sphere.name = 'invisibleWorld';
            pano.addEventListener( 'click', (event) => { if ( event.intersects.length > 0 ) {  // only if DEBUG (TODO)
                const point = event.intersects[ 0 ].point.clone();
                point.sub( self.viewer.panorama.getWorldPosition( new THREE.Vector3() ) );
                console.info( `${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)}` );    
            } });
            pano.add( sphere );
        }

        // called on init and resize window event TODELETE
        self.resizeWindow = function() {
            self.renderer.setPixelRatio( window.devicePixelRatio );
            self.renderer.setSize( window.innerWidth, window.innerHeight );
        }

    }

    Element.prototype.posterlens = function(options) {
        const instance = new Posterlens(this).init(options);
        return instance;
    };
    
    

})(window); 
/* 	****************************************************************************************** */


/* 
    Usage
    document.querySelector('#pan-container').posterlens({ ..options object })
*/


/*
* End of this 💩
*/





const CanvasForTexture = function(text = '', attrs = {}) {
    
    const params = Object.assign( {
                    size: 15,
                    width: '',
                    font: 'Arial',
                    fontWeight: 'normal',
                    color: 'red',
                    border: '1px solid white',
                    // padding: '10',
                    background: 'transparent'
                }, attrs );

    if (!params.width)
        params.width = params.size * 20; // 1 line, 20 chars
    
    

    const init = function(text, params) {

        
        const contextParams = {
            font: params.fontWeight+' '+params.size+"px "+params.font,
            fillStyle: params.color,
        }
        // create a canvas element, just to calculate the lines and therefore the height.
        var canvas1 = document.createElement('canvas');
        canvas1.width = params.width;
        var context1 = canvas1.getContext('2d');
        context1 = Object.assign(context1, contextParams);
        var lines = getLines(context1, text, params.width);
        params.height = (lines.length + 1) * params.size ;
        
        // recreate it again so we can asign the lines 1 by one and the height from scratch
        canvas1 = document.createElement('canvas');
        canvas1.width = params.width;
        canvas1.height = params.height;
        canvas1.style.background = params.background;
        canvas1.style.border = params.border;
        // canvas1.style.padding = (params.size/4)+"px "+(params.size/4)+"px "+(params.size/2)+"px "+(params.size/4)+"px";
        context1 = canvas1.getContext('2d');
        context1 = Object.assign(context1, contextParams);

        // write line by line
        for (var i = 0; i<lines.length; i++) {
            
            context1.fillText(lines[i], 
                (canvas1.width/2 - (params.size - 1) *lines[i].length/4),  // pos in left
                params.size/2 + ((i+1)*params.size) ); // pos top
        }

        // debug
        document.body.appendChild(canvas1);
        return canvas1;
    }

    function getLines(ctx, text, maxWidth) {
        var words = text.split(" ");
        var lines = [];
        var currentLine = words[0];

        for (var i = 1; i < words.length; i++) {
            var word = words[i];
            var width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth && word !== '\n') {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }


    // when called new CanvasForTexture('text', {});
    return init(text, params);

}

// my custom animation
function glowAnimation( object, duration = 200 ) { 
    if (object.glowAnimationOriginalScale) {} // object.scale.set( new THREE.Vector3( Object.values( object.glowAnimationOriginalScale )) );
        else object.glowAnimationOriginalScale = { ... object.scale };
    object.glowAnimation = new TWEEN.Tween( object.scale ).to( { x: object.glowAnimationOriginalScale.x * 1.05, y: object.glowAnimationOriginalScale.y * 1.05, x: object.glowAnimationOriginalScale.x * 1.05   }, duration );
    object.glowAnimationBack = new TWEEN.Tween( object.scale ).to( { x: object.glowAnimationOriginalScale.x / 1.05, y: object.glowAnimationOriginalScale.y / 1.05, x: object.glowAnimationOriginalScale.x / 1.05   }, duration );
    object.glowAnimation.chain(object.glowAnimationBack);
    object.glowAnimationBack.chain(object.glowAnimation);
    object.glowAnimation.start();
    return object.glowAnimation;
}
function stopGlowAnimation( object ) {
    console.log('onmouse Leave', object.name);
    object.glowAnimationBack.chain(); // this unchains the loop and it will stop after the next glow back.
    object.glowAnimationBack.onComplete(()=>{

        delete[object.glowAnimation]; // clearup
        delete[object.glowAnimationBack];
    })
}