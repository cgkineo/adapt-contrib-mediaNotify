#adapt-contrib-mediaNotify


An extension to the notify api allowing a notify to include a video, audio or img tag.


```
"_feedback": {
      "correct": "This feedback will appear if you answered the question correctly. <img src='course/en/images/origami-menu-one.jpg' alt='this is image 1'>",
      "_incorrect": {
        "notFinal": "",
        "final": "This feedback will appear if you answered the question incorrectly. <video poster='course/en/images/origami-menu-one.jpg' ><source src='course/en/video/big_buck_bunny.mp4' type='video/mp4'></video>"
      },
      "_partlyCorrect": {
        "notFinal": "",
        "final": "This feedback will appear if you answered part of the question correctly. <video poster='course/en/images/origami-menu-one.jpg'><source src='course/en/video/big_buck_bunny.mp4' type='video/mp4'></video>"
      }
    },
```
