import {Injectable} from "@angular/core";
import {RequestOptions, Response, Http, ResponseContentType} from '@angular/http';
import {Observable} from "rxjs";

@Injectable()
export class AudioService {
  context: AudioContext;
  source: AudioBufferSourceNode;
  gain: GainNode;
  el: HTMLElement;
  isStopped: boolean = false;

  constructor(private http: Http) {
    this.context = new AudioContext();
    this.gain = this.context.createGain();
  }

  private getAudio(url): Observable<ArrayBuffer> {
    let options = new RequestOptions({responseType: ResponseContentType.ArrayBuffer});
    return this.http.get(url, options)
      .map((res: Response) => res.arrayBuffer());
  }

  public play(url, el): void {
    this.setElement(el);
    if (!this.source) {
      this.getAudio(url)
        .subscribe((res) => {
          this.decodeAudio(res).then(() => {
            this.source.start(this.context.currentTime);
            this.setIcon(this.el);
            this.createAnalyzer();
          });
        });
    } else {
      this.checkContextState(this.context.state);
    }
  }

  private decodeAudio(buf): PromiseLike<void> {
    return this.context.decodeAudioData(buf).then(buffer => {
      this.source = this.context.createBufferSource();
      this.source.buffer = buffer;
      this.source.connect(this.gain);
      this.gain.connect(this.context.destination);
      this.source.onended = this.playEnded.bind(this);
    });
  }

  private playAgain(buffer): void {
    this.source = this.context.createBufferSource();
    this.source.buffer = buffer;
    this.source.connect(this.gain);
    this.gain.connect(this.context.destination);
  }

  private checkContextState(state: string) {
    if (this.isStopped) {
      this.playAgain(this.source.buffer);
      this.source.start(this.context.currentTime);
      this.setIcon(this.el);
      this.isStopped = false;
    } else {
      switch (state) {
        case 'running': {
          this.context.suspend();
          this.setIcon(this.el);
        }
          break;
        case 'suspended': {
          this.context.resume();
          this.setIcon(this.el);
        }
          break;
      }
    }
  }

  public stop(): void {
    this.source.stop(0);
    this.isStopped = true;
    this.setIcon(this.el);
  }

  private createAnalyzer() {
    let analyser = this.context.createAnalyser();
    analyser.fftSize = 2048;
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);
    console.log(dataArray);
    console.log(analyser);
  }

  // public pause(): void {
  //   if(this.context.state === 'running') {
  //     this.context.suspend().then(function() {
  //       console.log('Resume context');
  //     });
  //   } else if(this.context.state === 'suspended') {
  //     this.context.resume().then(function() {
  //       console.log('Suspend context');
  //     });
  //   }
  // }

  public changeVolume(vol: number, max: number) {
    let fraction = vol / max;
    this.gain.gain.value = fraction * fraction;
  }

  private setElement(el): void {
    if (el.tagName !== 'I') {
      this.el = el.firstElementChild;
    } else {
      this.el = el;
    }
  }

  private setIcon(el) {
    el.classList.toggle('fa-play');
    el.classList.toggle('fa-pause');
  }

  private playEnded(): any {
    this.setIcon(this.el);
    this.isStopped = true;
  }

}
