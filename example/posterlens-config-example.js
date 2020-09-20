var data = {
    "cameraFov": 80,
    "worlds": [
      {
        "panorama": "assets/360pano.jpg",
        "name": "Hall",
        "innerPanorama": {
          "offset": [
            100,
            0,
            0
          ]
        },
        "hotspots": [
          {
            "type": "text-3d",
            "text": "BECAUSE NEIGHBOURS MATTER",
            "pos": [
              "5.49",
              "117.42",
              "-246.92"
            ],
            "scale": "0.12",
            "size": 200,
            "animated": "always",
            "name": "bigtext",
            "fontFamily": "assets/fonts/Century_Gothic_Regular.js",
            "rot": [
              "0.00",
              "6.26",
              "0.00"
            ],
            "alwaysLookatCamera": true,
            "emissive": 10030990,
            "transparent": true,
            "popupWhenVisible": true
          },
          {
            "name": "mujer",
            "type": "poster3d",
            "pos": [
              "-6.45",
              "-19.16",
              "-41.26"
            ],
            "image": "assets/mujer-animada.png",
            "hoverText": "Text in config",
            "modal": "Just text, but it could be a file loaded in an iframe",
            "rot": [
              "0.00",
              "0.15",
              "0.00"
            ],
            "scale": "11.28",
            "alwaysLookatCamera": true,
            "animatedMap": "3",
            "animatedMapSpeed": 1,
            "sprite": true
          },
          {
            "name": "jinjang",
            "link": "room-2-panorama",
            "type": "poster3d",
            "hoverText": "Click to change pano",
            "pos": [
              "200.31",
              "-81.32",
              "-444.27"
            ],
            "image": "assets/png.png",
            "rot": [
              "0.00",
              "5.86",
              "0.00"
            ],
            "scale": "176.96",
            "sprite": true
          },
        ]
    },
    {
      "panorama": "assets/hall360.jpg",
      "name": "room-2-panorama",
      "innerPanorama": {
        "offset": [
          100,
          0,
          0
        ]
      },
      "hotspots": [
        {
          "name": "jinjang",
          "link": "Hall",
          "type": "poster3d",
          "hoverText": "Back",
          "pos": [
            "200.31",
            "-81.32",
            "-444.27"
          ],
          "image": "assets/png.png",
          "rot": [
            "0.00",
            "5.86",
            "0.00"
          ],
          "scale": "176.96",
          "sprite": true
        },
      ]
    }
  ]
}
  