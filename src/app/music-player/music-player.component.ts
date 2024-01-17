import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.scss'],
})
export class MusicPlayerComponent implements OnInit {
  @ViewChild('musicElement') musicElementRef!: ElementRef;
  @ViewChild('playButton') playButtonRef!: ElementRef<HTMLElement>;
  @ViewChild('pauseButton') pauseButtonRef!: ElementRef<HTMLElement>;
  @ViewChild('playhead') playheadRef!: ElementRef<HTMLElement>;
  @ViewChild('timeline') timelineRef!: ElementRef<HTMLElement>;
  @ViewChild('timer') timerRef!: ElementRef<HTMLElement>;

  musicElement!: HTMLAudioElement;
  playButton!: HTMLElement;
  pauseButton!: HTMLElement;
  playhead!: HTMLElement;
  timeline!: HTMLElement;
  timer!: HTMLElement;

  duration!: number;
  timelineWidth!: number;
  initialMusicPlayerState = {
    isVideoError: false,
    isOnline: navigator.onLine,
    isPlaying: false,
    currentTime: '0:00',
    duration: '0:00',
  };

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    if (
      this.musicElementRef &&
      this.playButtonRef &&
      this.pauseButtonRef &&
      this.playheadRef &&
      this.timelineRef &&
      this.timerRef
    ) {
      this.musicElement = this.musicElementRef.nativeElement;
      this.playButton = this.playButtonRef.nativeElement;
      this.pauseButton = this.pauseButtonRef.nativeElement;
      this.playhead = this.playheadRef.nativeElement;
      this.timeline = this.timelineRef.nativeElement;
      this.timer = this.timerRef.nativeElement;

      this.timelineWidth =
        this.timeline.offsetWidth - this.playhead.offsetWidth;

      this.musicElement.addEventListener(
        'timeupdate',
        this.timeUpdate.bind(this),
        false
      );
      this.musicElement.addEventListener(
        'canplaythrough',
        this.canPlayThrough.bind(this),
        false
      );
      this.musicElement.addEventListener(
        'loadedmetadata',
        this.loadedMetadata.bind(this),
        false
      );
      this.pauseButton.style.display = 'none';
    }
  }

  timeUpdate(): void {
    const playPercent =
      (this.timelineWidth * this.musicElement.currentTime) / this.duration;
    this.renderer.setStyle(this.playhead, 'width', playPercent + 'px');

    const secondsIn = Math.floor(
      (this.musicElement.currentTime / this.duration / 3.5) * 100
    );
    this.timer.innerHTML =
      secondsIn <= 9 ? `0:0${secondsIn}` : `0:${secondsIn}`;
  }

  togglePlayPause(): void {
    this.initialMusicPlayerState.isPlaying =
      !this.initialMusicPlayerState.isPlaying;
    if (this.initialMusicPlayerState.isPlaying) {
      this.musicElement.play();
      !this.initialMusicPlayerState.isPlaying;
    } else {
      this.musicElement.pause();
    }
  }

  play(): void {
    if (this.musicElement && this.musicElement.paused) {
      this.musicElement.play().then(() => {
        this.renderer.setStyle(this.playButton, 'display', 'none');
        this.renderer.setStyle(this.pauseButton, 'display', 'block');
      });
    }
  }

  pause(): void {
    if (this.musicElement && !this.musicElement.paused) {
      this.musicElement.pause();
      this.renderer.setStyle(this.playButton, 'display', 'block');
      this.renderer.setStyle(this.pauseButton, 'display', 'none');
    }
  }

  canPlayThrough(): void {
    this.duration = this.musicElement.duration;
  }

  loadedMetadata(): void {
    // Handle any additional logic after metadata is loaded.
    console.log('Audio metadata loaded. Duration:', this.duration);
  }
}
