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
- three.js, using `import {THREE} from 'panolens-three';`
- panolens.js using `import * as PANOLENS from 'panolens-three';`
- posterlens/posterlens.css';

- It uses TWEEN for animations. It's included in panolens and exposed to window (window.TWEEN)

## Usage:  
```
        import `posterlens/posterlens.css` in head or in you scss file. 
            
        <div id="posterlens-container" style="width:100%; height:100%"></div>  
        <script>  

            const pl = document.querySelector('#posterlens-container').posterlens({

            });
            // This is just for debugging, to use the extension Three.js inspector.  
            setTimeout(() => {
                window.scene = pl.viewer.getScene();
            }, 500);
        </script> ```

