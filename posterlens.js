/*
 * Posterlens
 * Version 1.0
 * https://www.cobianzo.com/
 * 
 * Depends on: THREE.js, PANOLENS.js
 * 
 * TODO:
 *      Check options of panolens, like showing an object on hover, and apply here
 *      Remove the 'link' type: it can be created by poster-sprite.
 *      Create the edit mode with buttons, with option to create any object.
 */
;(function(quindow) {
    
    "use strict";

    var Posterlens = function(el) {

        // to access to the plugin instance when inside methods.
        var self = this; 		
        const OFFSET_Y_PARENT_PIVOT = -9999;
        // 1.0 - setup, init and public methods and properties.
        console.log('Posterlens init', el);
        self.o = {
            // default ones @TODO
        };
        
        // construct init
        self.el = el;
        
        // <instance>.viewer.getScene() : access to the scene. Parent of all worlds (also can be seen as rooms, techincally called panorama);
        // <instance>.viewer.getScene().children : access to all panorama in the plugin
        // <instance>.viewer.panorama : get the current panorama (it has attribute 'active' = true)

        self.init = function(options) {
            
            self.o = Object.assign(self.o, options);
            
            let viewerOptions = { container: el, output: 'console', autoHideInfospot: false };
            // viewerOptions = Object.assign( viewerOptions, self.o ); 
            if (self.o.initialLookAt) 
                viewerOptions.initialLookAt = new THREE.Vector3( ...self.o.initialLookAt );
                            
            // PANOLENS call! (this creates the 'wooorld')
            self.viewer = new PANOLENS.Viewer( viewerOptions );

            // updates that must come after panolens creation
            if (self.o.minAzimuthAngle) 
                self.viewer.OrbitControls.minAzimuthAngle = self.o.minAzimuthAngle;
            if (self.o.maxAzimuthAngle) 
                self.viewer.OrbitControls.maxAzimuthAngle = self.o.maxAzimuthAngle;


            // init creation of every panorama in the scene. (at least 1)
            self.o.worlds.forEach( (scParams, i) => {
                const pano = new PANOLENS.ImagePanorama( scParams.panorama );
                pano.name = scParams.name? scParams.name : 'World_' + i;
                self.viewer.add( pano );
                createInvisibleWorld(pano, scParams.innerPanorama )
            });
            
            // Now, for every panorama created, set up and hotposts. This loop is the same than the one above.
            self.viewer.getScene().children.forEach( (pano, i) => {   
                // posters
                const sc = self.o.worlds[i];
                if (sc.hotspots && sc.hotspots.length ) 
                    sc.hotspots.forEach( (ht,i) => {
                            self.createNewObjectFromParams(pano, ht);
                    });

            });
            
            


            // for debuggins. Use chrome extension three.js inspector.
            setTimeout( () => window.scene = self.viewer.getScene(), 500 );

            // Now we return the instance. 
            // We can assign it to a var an access to public methods.
            return self;
        }; // end init

        // @params is the hotspots object called when panolens is called with ``new panolens.init( params )``
        self.createNewObjectFromParams = function(pano = null, params) {
            if (!pano) pano = self.viewer.panorama;
            switch (params.type) {
                case 'link': // uses PANOLENS.link
                    self.createLink( pano, params.image, params.pos, ( params.link ? params.link : null ), params );
                break;
                case 'poster3d': //  uses THREE.PlaneGeometry plane mesh
                    self.createPoster3D( pano, params.image, params.pos, params );
                break;
                case 'text-3d': // uses THREE.TextGeometry and THREE.Mesh
                    self.createText3D( pano, params.text, params.pos, params );
                break;
                case 'text-2d': // uses Canvas, THREE.PlaneGeometry and THREE.Mesh
                    self.createText2D( pano, params.text, params.pos, params );
                break;
                default:  // 'poster-sprite' uses PANOLENS.infospot
                    self.createPosterSprite( pano, params.image, params.pos, ( params.link ? params.link : null ), params );
                break;
            }
        }

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
                updateObjectParams(infoSpot, params);
                // arrowInfospot.name = attrs.name? attrs.name : '';
                if (params.hoverText) { // doesnt work in a link
                    infoSpot.addHoverText(params.hoverText);
                }
            }
        }
        self.createPosterSprite = function(pan, image = null, position, link = null, attrs = {} ) {
            const params = Object.assign( {
                scale: 100
            }, attrs );
            var posterInfospot = new PANOLENS.Infospot(params.scale, image);
            posterInfospot.name = image? image.substring(image.lastIndexOf('/')+1) : 'no_name';
            posterInfospot.link = link;
            if (params.hoverText) {
                posterInfospot.addHoverText(params.hoverText);
            }
            if (posterInfospot.link) {
                params.onClick = (event, postIS) => {
                    const thePanorama = self.getPanoramaByName(postIS.link);
                    if (thePanorama)
                        self.viewer.setPanorama(thePanorama);
                }
            }
            //set name, onclick listener
            updateObjectParams(posterInfospot, params);
            self.setObjectPos(posterInfospot, position);

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
        
        self.createPoster3D = function(panorama, image, position, attrs = {} ) {
            const params = Object.assign( {
                scale: 10
            }, attrs );

            const loader = new THREE.TextureLoader();
            
            // we use the texture image to create the dimentions of the poster.
		    const texture1 = loader.load( image , function(im) { 
                const ratio = im.image.height/im.image.width;
                const geometry = new THREE.PlaneBufferGeometry( 10, 10 * ratio, 3 );
                const alphaMap = params.alpha? loader.load( params.alpha ) : null;
                const materialAttrs = {color: 0xffffff, side: THREE.DoubleSide, map: texture1, 
                    alphaMap: alphaMap,
                    transparent: alphaMap? true : false,
                    depthTest: alphaMap? false : true,
                    // as the alpha map for the material
                    //alphaMap: texture1,
                    // I also need to make sure the transparent
                    // property is true
                    //transparent: true,
                };
                const material2 = new THREE.MeshBasicMaterial( materialAttrs );
                const mesh = new THREE.Mesh( geometry, material2 );
                
                if (params.alpha) {
                    const textureAlpha = loader.load( params.alpha , function(im) { 
                    } );
                }

                mesh.name = 'poster_' + self.viewer.panorama.children.length;
                

                // this works
                if (params.hoverText)  {
                    // create the tooltip.
                    var tooltip = new Tooltip( params.hoverText, mesh, {});
                    mesh.tooltip = tooltip; // to access to the methods.
                    params.onHoverEnter = e => tooltip.show() ;
                    params.onHoverLeave = e => tooltip.hide() ;
                }
                // add onclick, hover
                updateObjectParams(mesh, params); // set click and other events
                self.viewer.panorama.add(mesh);
                mesh.alwaysLookatCamera = true;
                self.setObjectPos(mesh, position);
                // updateParentParams(panorama, mesh, position);

                mesh.scale.set(params.scale,params.scale,params.scale);

                
                
                

                    
            }); // end texture onload
        }
        self.createText3D = function(panorama, text, position, attrs = {} ) {
            const params = Object.assign( {
                scale: 0.3,
                size: 200,
                textColor: 0xfffbcb,
                specular: 0xfff000,
                emissive: 0xffffff,
                options: {},
                fontFamily: 'assets/fonts/Century_Gothic_Regular.js' 
            }, attrs );

            var loader = new THREE.FontLoader();
            
            loader.load( params.fontFamily, function ( font ) {
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
                //updateParentParams(panorama, textMesh, position);
                self.viewer.panorama.add(textMesh);
                textMesh.alwaysLookatCamera = true;
                self.setObjectPos(textMesh, position);
                textMesh.scale.set(params.scale,params.scale,params.scale);
            } );
    
        }

        self.createText2D = function(panorama, text, position, attrs = {} ) {
            
            const params = Object.assign( {
                scale: 0.15,
                size: 100,
                width: 800,
                color: 'white',
                background: 'black'
            }, attrs );

            const attachedObject = ('string' === typeof(position));
            // create a canvas element

            var canvas = new CanvasForTexture(text, params );
            
            // canvas contents will be used for a texture
            var texture1 = new THREE.Texture(canvas);
            texture1.needsUpdate = true;
            
            var material1 = new THREE.MeshBasicMaterial( { color:0xffffff, side: THREE.DoubleSide, map: texture1 } );
            material1.needsUpdate = true;
            if (params.background === 'transparent')
                material1.transparent = true;

            var textPlane = new THREE.Mesh(
                new THREE.PlaneGeometry(canvas.width, canvas.height),
                material1
            );
            
            updateObjectParams(textPlane, params);
            if (attachedObject) { // never used, needs testing
                const parent = self.getObjectByName(position);
                if (parent) {
                    textPlane.position.set( 0, 0, 0 );
                    parent.add( textPlane );
                    // add onclick, hover                        
                    
                } else console.warn('could not create text 2d ', text);
            } else {
                self.viewer.panorama.add(textPlane);
                textPlane.alwaysLookatCamera = true;
                self.setObjectPos(textPlane, position);
                
                // updateParentParams(panorama, textPlane, position);
            }
            
            textPlane.scale.set( params.scale, params.scale, params.scale);
            
        }


        // called with var modal = new self.Modal('the title', 'https://the/pdf.pdf');
        self.Modal = function(titleText = 'TITLE', domEl = 'test', ops = {}){
            const options = Object.assign({
                onClose : () => { console.log('modal closed');}
            }, ops);
            //this.pdf = pdf;
            if (typeof domEl === 'string') {
                var domElement = document.createElement('div');
                domElement.innerHTML = domEl;
            } else domElement = domEl;  
            var wrapper = document.createElement('div');
            wrapper.classList.add('pl_modal-wrapper');
            var modal = document.createElement('div');
            modal.classList.add('pl_modal-inner');
            var title = document.createElement('div');
            title.classList.add('pl_modal-title');
            var body = document.createElement('div');
            body.classList.add('pl_modal-body');
            var close = document.createElement('button');
            close.textContent = 'Close';
            close.classList.add('pl_modal-close');
            wrapper.appendChild(modal);
            title.innerHTML = `<h1>${titleText}</h1>`;
            title.appendChild(close);
            modal.appendChild(title);
            modal.appendChild(body);
            body.appendChild(domElement);
            if (document.querySelector('.pl_modal-wrapper')) 
                document.querySelector('.pl_modal-wrapper').remove();
            pl.el.after(wrapper);
            const closeHandler = (e) => (e.keyCode === 27 ? this.modal.closeModalFn(e) : false );
            document.addEventListener('keydown', closeHandler, 'closeModal' ); // clicking ESC 
            
            this.modal = {}; // <instance Posterlens>.modal
            this.modal.el = modal; // `this` is the instance of Panolens
            this.modal.closeModalFn = (e) => {
                e.stopPropagation();
                e.preventDefault();
                const closeTween = new TWEEN.Tween( wrapper.style ).to( { opacity: 0 }, 200 ).onComplete(()=>{ // the animation doesnt work. Its css transition what works
                    wrapper.style.display = 'none';
                    options.onClose();
                    document.removeEventListener('keydown', closeHandler, 'closeModal' );
                }).start();
            }
            close.addEventListener('click', this.modal.closeModalFn );
            wrapper.addEventListener('click', this.modal.closeModalFn );
            modal.addEventListener('click', e => e.stopPropagation() );
            
            
            
            return this.modal;

        }


        // helper to common create object/poster
        const updateObjectParams = function(object, params) {
            object.type = 'pl_' + params.type;
            object.name = params.name?? 'poster_'+Math.floor(Math.random() * (10000)); ;
            
            if (params.type === 'link') return; // this type is native from PANOLENs so if we want to add events we should use its methods.

            if (params.onClick) {
                object._click = (event) => { if (self.viewer.editMode) return; params.onClick(event, object); }; // so i can access to it, unbind it and rebind it. NOTE:it didnt work!
                object.addEventListener( 'click', object._click, 'posterlens-handler', false );
            }
            if (params.onHoverEnter) 
                object.addEventListener( 'hoverenter', (event) => params.onHoverEnter(event, object) );
            if (params.onHoverLeave)
                object.addEventListener( 'hoverleave', (event) => params.onHoverLeave(event, object) );
            if (params.callback)
                params.callback(object);
            
                
        }
        // not in use anymore
        const updateParentParams = function(panorama, object, position) {
                // we create a parent to orbit it
                object.positionByParentRotation = true; // flag used in setObjPos
                
                var pivotParent = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( { color: 0xffff00 , visible: false} ) );
                pivotParent.parentPivot = true;
                pivotParent.position.y = OFFSET_Y_PARENT_PIVOT;
                panorama.add( pivotParent );
                pivotParent.add( object );
                self.setObjectPos(object, position);
        }
        self.setObjectPos = function(object, position) { // public fn
            if (object.positionByParentRotation) {
                object.position.set(0, -1*OFFSET_Y_PARENT_PIVOT + position[1], Math.hypot(position[0], position[2])) // instead of moving it, we rotate the parent
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
            } else {
                if (object.alwaysLookatCamera) {
                    var theta = Math.atan2(position[0], position[2] );
                    object.rotation.y = theta + Math.PI;
                } 
                object.position.set( ...position );
            }
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
        self.getObjectByName = (name, pano) => (pano?? self.viewer.panorama).getObjectByName(name) ;
        self.getObjects = () =>  self.viewer.panorama.children.filter( obj => obj.type && obj.type.startsWith('pl_') ) ;
        self.getMouse3DPosition = () => {                                        
                                        const intersects = self.viewer.raycaster.intersectObject( self.viewer.panorama, true );
                                        if ( intersects.length <= 0 ) return;
                                        let i = 0;
                                        while ( i++ < intersects.length )
                                            if (intersects[i].object.name === 'invisibleWorld') {
                                                const point = intersects[i].point.clone();
                                                const world = self.viewer.panorama.getWorldPosition( THREE.Vector3() );
                                                point.sub( world );
                                                const currentMP = [ point.x.toFixed(2)/2, point.y.toFixed(2)/2, point.z.toFixed(2)/2 ];
                                                return currentMP;
                                            }
                                    }

        // create transparent world. When we use the helper to grab coordenates on click, this will give us the depth
        const createInvisibleWorld = function(pano, attrs = {}) {
            var geometry = new THREE.SphereGeometry( 500, 32, 32 );
            var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.BackSide, visible: false } );
            var sphere = new THREE.Mesh( geometry, material );          
            sphere.name = 'invisibleWorld';
            pano.addEventListener( 'click', (event) => { if ( event.mouseEvent.altKey && event.intersects.length > 0 ) {  // only if DEBUG (TODO). ClickAlt nd click to get position
                const point = event.intersects[ 0 ].point.clone();
                point.sub( self.viewer.panorama.getWorldPosition( new THREE.Vector3() ) );
                window.obj = event.intersects[ 0 ].object;
                console.info( `${point.x.toFixed(2)/2}, ${point.y.toFixed(2)/2}, ${point.z.toFixed(2)/2}`, window.obj.name );     // mouse click 3d pos
            } });
            pano.add( sphere );
            
            if (attrs.image) {
                const loader = new THREE.TextureLoader();
                const texture = loader.load( attrs.image );
                material.map = texture;
                material.visible = true;
                if (attrs.alpha) {
                    material.alphaMap = loader.load( attrs.alpha );
                    material.transparent = true;
                }
            }
        }

        // encapsulated fn to handle tooltip creation show and hide, positioning it over the object inthe viewer.
        const Tooltip = function( text = '', object, attrs = {} ) {
            const toolt   = document.createElement('div'); toolt.classList.add('pl_tooltip'); toolt.id = 'pl_tooltip-'+object.name;
            const inner     = document.createElement('div'); inner.classList.add('pl_tooltip__inner'); toolt.append(inner);
            inner.textContent = text;
            self.el.append(toolt);
            this.el = toolt;
            this.object = object;
            this.el.style.position = 'absolute';
            this.el.style.display = 'none';
            this.el.style.opacity = 0;
            const thisTooltip = this;
            this.show = function() {
                this.positionElementOverObject();                
                self.viewer.addUpdateCallback(this.positionElementOverObject);
                this.el.style.display = 'block';
                this.el.style.opacity = 0.9;
            }
            
            this.hide = function() {
                this.el.style.display = 'none';
                this.el.style.opacity = 0;
                self.viewer.removeUpdateCallback(this.positionElementOverObject);
            }

            // helper. Transform the position of te object into screen coordinates x,y, and assings them to an element, which must hae positino absolte.
            this.positionElementOverObject = function() {
                const container = self.el;
                const element = thisTooltip.el;
                const object = thisTooltip.object;
                var width = container.offsetWidth, height = container.offsetHeight;
                var widthHalf = width / 2, heightHalf = height / 2;
                const posMouse = self.getMouse3DPosition();
                var pos = new THREE.Vector3(...posMouse);
                // var pos = object.position.clone();
                pos.project(self.viewer.camera);
                element.style.left = ( pos.x * widthHalf ) + widthHalf + 'px';
                element.style.top = - ( pos.y * heightHalf ) + heightHalf + 'px'; 
            }

            return this;
        }        

        // called on init and resize window event TODELETE
        self.resizeWindow = function() {
            self.renderer.setPixelRatio( window.devicePixelRatio );
            self.renderer.setSize( window.innerWidth, window.innerHeight );
        }

    }

    Element.prototype.posterlens = function(options) {
        console.log('DATA:', options);
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
        canvas1.style.display = 'none';
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
        var words = text.toString().split(" ");
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

// Animations plugin
function glowAnimation( object, duration = 200 ) { 
    if (object.glowAnimationOriginalScale) {} // object.scale.set( new THREE.Vector3( Object.values( object.glowAnimationOriginalScale )) );
        else object.glowAnimationOriginalScale = { ...object.scale };
    object.glowAnimation = new TWEEN.Tween( object.scale ).to( { x: object.glowAnimationOriginalScale.x * 1.05, y: object.glowAnimationOriginalScale.y * 1.05, x: object.glowAnimationOriginalScale.x * 1.05   }, duration );
    object.glowAnimationBack = new TWEEN.Tween( object.scale ).to( { x: object.glowAnimationOriginalScale.x / 1.05, y: object.glowAnimationOriginalScale.y / 1.05, x: object.glowAnimationOriginalScale.x / 1.05   }, duration );
    object.glowAnimation.chain(object.glowAnimationBack);
    object.glowAnimationBack.chain(object.glowAnimation);
    object.glowAnimation.start();
    return object.glowAnimation;
}
function stopGlowAnimation( object ) {
    if (!object.glowAnimationBack) return;
    object.glowAnimationBack.chain(); // this unchains the loop and it will stop after the next glow back.
    object.glowAnimationBack.onComplete(()=>{

        delete[object.glowAnimation]; // clearup
        delete[object.glowAnimationBack];
    })
}
const stopAllAnimations = (viewer) => viewer.panorama.children.forEach( obj => {
            stopGlowAnimation( obj );
            if (obj.scaleUpAnimation) obj.scaleUpAnimation = { start: ()=>{}, stop: ()=>{}}
            if (obj.scaleDownAnimation) obj.scaleDownAnimation = { start: ()=>{}, stop: ()=>{}}
    });




// HTML as texture plugin

////////////
	// CUSTOM //
	////////////
function createPlaneIframe(scene, renderer, camera, pano, src) {
	var planeMaterial   = new THREE.MeshBasicMaterial({color: 0x000000, opacity: 0.1, side: THREE.DoubleSide });
	var planeWidth = 360;
    var planeHeight = 120;
	var planeGeometry = new THREE.PlaneGeometry( planeWidth, planeHeight );
	var planeMesh= new THREE.Mesh( planeGeometry, planeMaterial );
	planeMesh.position.y += planeHeight/2;
    // add it to the standard (WebGL) scene
    planeMesh.position.set( 0.2, 50, -100);
    planeMesh.scale.set( 0.2, 0.2, 0.2);
	pano.add(planeMesh);
	
	// create a new scene to hold CSS
	var cssScene = new THREE.Scene();
	// create the iframe to contain webpage
	var element	= document.createElement('iframe')
	// webpage to be loaded into iframe
	element.src	= src;
	// width of iframe in pixels
	var elementWidth = 1024;
	// force iframe to have same relative dimensions as planeGeometry
	var aspectRatio = planeHeight / planeWidth;
	var elementHeight = elementWidth * aspectRatio;
	element.style.width  = elementWidth + "px";
	element.style.height = elementHeight + "px";
	
	// create a CSS3DObject to display element
	var cssObject = new THREE.CSS3DObject( element );
	// synchronize cssObject position/rotation with planeMesh position/rotation 
	cssObject.position = planeMesh.position;
	cssObject.rotation = planeMesh.rotation;
	// resize cssObject to same size as planeMesh (plus a border)
	var percentBorder = 0.05;
	cssObject.scale.x /= (1 + percentBorder) * (elementWidth / planeWidth);
	cssObject.scale.y /= (1 + percentBorder) * (elementWidth / planeWidth);
	cssScene.add(cssObject);
	
	// create a renderer for CSS
	rendererCSS	= new THREE.CSS3DRenderer();
	rendererCSS.setSize( window.innerWidth, window.innerHeight );
	rendererCSS.domElement.style.position = 'absolute';
	rendererCSS.domElement.style.top	  = 0;
	rendererCSS.domElement.style.margin	  = 0;
	rendererCSS.domElement.style.padding  = 0;
	document.body.appendChild( rendererCSS.domElement );
	// when window resizes, also resize this renderer
	// THREEx.WindowResize(rendererCSS, camera);

    
	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top      = 0;
	// make sure original renderer appears on top of CSS renderer
	renderer.domElement.style.zIndex   = 1;
    rendererCSS.domElement.appendChild( renderer.domElement );
    
    rendererCSS.render( cssScene, camera );
    renderer.render( scene, camera );
}
