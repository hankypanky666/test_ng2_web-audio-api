import {Component, OnInit} from '@angular/core';
import {RequestOptions, Response, Http, ResponseContentType} from '@angular/http';

import { AudioService } from "./services/audio.service";

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss'],
  providers: [AudioService]
})
export class AppComponent implements OnInit {
  title = 'app works!';

  constructor(public http: Http, public audio: AudioService) {

  }

  ngOnInit() {
  }

  play(e) {
    this.audio.play("http://localhost:3000/", e.target);
  }

  stop() {
    this.audio.stop();
  }

  changeVolume(e) {
    this.audio.changeVolume(e.target.value, e.target.max);
  }

  // pause() {
  //   this.audio.pause();
  // }

}
