import { Component, OnInit } from '@angular/core';

declare function filterSelection(name:any): any;


@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})

export class ScheduleComponent implements OnInit{

  videoUrl: string = '';
  showVideo: boolean = false;
  showVideo1: boolean = false;
  showVideo2: boolean = false;
  showVideo3: boolean = false;
  showVideo4: boolean = false;
  // Replace 'YOUR_VIDEO_ID_HERE' with your actual YouTube video ID
  videoId: string = 'YOUR_VIDEO_ID_HERE';

  playVideo() {
    this.showVideo = true;
  }

 endVideo(){
  this.showVideo = false;
 }

 playVideo1() {
  this.showVideo1 = true;
}

endVideo1(){
this.showVideo1 = false;
}

playVideo2() {
  this.showVideo2 = true;
}

endVideo2(){
this.showVideo2 = false;
}

playVideo3() {
  this.showVideo3 = true;
}

endVideo3(){
this.showVideo3 = false;
}

playVideo4() {
  this.showVideo4 = true;
}

endVideo4(){
this.showVideo4 = false;
}


  ngOnInit(): void{

    filterSelection("all");

    var btnContainer = document.getElementById("myBtnContainer");
    if(btnContainer!=null){
    var btns = btnContainer.getElementsByClassName("btn");
    for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function(){
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
  });
}
}
  }




}













