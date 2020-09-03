# POSTERLENS  
===     

Wrapper plugin over Panolens (which works over three.js).  
Allows you to create a panorama with interactive posters.  
Can be extended to create more complex objects and behaviours.  

## Install
===
npm install

## Dependencies:
===
`        <script src="node_modules/three/build/three.min.js"></script>`  
`       <script src="node_modules/panolens/build/panolens.min.js"></script>`  


## Usage:  
```
        <div id="posterlens-container" style="width:100%; height:100%"></div>
        <script>

            const pl = document.querySelector('#posterlens-container').posterlens({ 
                scenes: [
                    {
                        panorama: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/2294472375_24a3b8ef46_o.jpg',
                        name: 'Hall',
                        hotspots: [
                            {
                                image: 'https://images-na.ssl-images-amazon.com/images/I/91nELBuo3kL._RI_SX200_.jpg',
                                pos: [-5000.00, 311.34, -3086.92],
                                scale: 1500,
                                name: 'link-to-scene-1',
                                link: 'Scene_1'
                            }
                        ]
                    },
                    {
                        panorama: 'https://pchen66.github.io/Panolens/examples/asset/textures/equirectangular/field.jpg',
                        hotspots: [
                            {
                              //  image: 'https://images-na.ssl-images-amazon.com/images/I/91nELBuo3kL._RI_SX200_.jpg',
                                name: 'link-to-hall',
                                pos: [-4000.00, 311.34, -3086.92],
                                link: 'Hall'
                            }
                        ]
                    }
                ]
            });
            setTimeout(() => {
                window.scene = pl.viewer.getScene();
            }, 500);
        </script> ```
