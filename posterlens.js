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
        self.viewer = new PANOLENS.Viewer( { container: el, output: 'console', autoHideInfospot: false } );        
        // <instance>.viewer.getScene() : access to current scene;
        // <instance>.viewer.scene.children : access to all scenes in the plugin
        

        self.init = function(options) {
            self.o = Object.assign(self.o, options);
          
            // creation of every scene. (at least 1)
            self.o.scenes.forEach( (scParams, i) => {
                const pano = new PANOLENS.ImagePanorama( scParams.panorama );
                pano.name = scParams.name? scParams.name : 'Scene_' + i;
                self.viewer.add( pano );
            });
            
            // Now, for every scene created, set up and hotposts
            self.viewer.scene.children.forEach( (pano, i) => {   
                // posters
                const sc = self.o.scenes[i];
                if (sc.hotspots && sc.hotspots.length ) 
                    sc.hotspots.forEach( (ht,i) => {
                        //if (ht.image)
                        console.log('como vanmos: ', ht);
                            self.createPanoLink( pano, ht.image, ht.pos, ( ht.link ? ht.link : null ), ht );
                        //else
                          //  self.createPanoLink( pano, ht.pos, ht.link, ht );
                    });

                // click events for this scene
                pano.addEventListener( 'click', function( event ){
                    if ( event.intersects.length > 0 ) {
                        const intersect = event.intersects[0];
                        console.log('clickedd! interset', intersect.object);
                        if ( intersect.object.constructor.name === 'Infospot') {
                            const infoSpot = intersect.object;
                            console.log('clicked infospot', infoSpot.name);
                            if (infoSpot.link) {
                                // get Scene by name:
                                const sceneLinked = self.getSceneByName(infoSpot.link)
                                if (sceneLinked)
                                    self.viewer.setPanorama(sceneLinked);
                                else  console.warn('pano with name '+infoSpot.link+' not found');
                            }

                        }
                    }
        
                } );
            });
            
            // for debuggins. Use chrome extension three.js inspector.
            setTimeout( () => window.scene = self.viewer.getScene(), 500 );

            // Now we return the instance. 
            // We can assign it to a var an access to public methods.
            return self;
        };

        // public functions.
        self.createPanoLink = function(pano, image, position, linkendPanName, attrs = {} ) {
            const linkedPan = self.getSceneByName(linkendPanName);
            if (linkedPan) {
                console.log('creating link: ', arguments)
                pano.link(linkedPan , new THREE.Vector3( ...position ), attrs.scale? attrs.scale : 300, (image ? image : PANOLENS.DataImage.Arrow) );
                // arrowInfospot.name = attrs.name? attrs.name : '';
            }
        }
        self.createPoster = function(pan, image = null, position, link = null, attrs = {} ) {
            const params = Object.assign( {
                size: 2000
            }, attrs );
            var posterInfospot = new PANOLENS.Infospot(params.size, image);
            var name = attrs.name? attrs.name : image.substring(image.lastIndexOf('/')+1);
            posterInfospot.name = name;
            posterInfospot.link = link;
            posterInfospot.position.set( ...position );
            pan.add(posterInfospot);

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

        // helpers
        self.getSceneByName = (name) => self.viewer.scene.children.find( sc => sc.name === name );
        

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
