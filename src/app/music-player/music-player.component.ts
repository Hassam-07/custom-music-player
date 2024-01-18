import {
  AfterViewInit,
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
export class MusicPlayerComponent implements AfterViewInit {
  @ViewChild('musicElement') musicElementRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('timelineIndicator') timelineIndicatorRef!: ElementRef;
  @ViewChild('timelineProgress') timelineProgressRef!: ElementRef;
  @ViewChild('timeline', { static: true }) timelineRef!: ElementRef;
  @ViewChild('currentTimeElem') currentTimeElemRef!: ElementRef;
  @ViewChild('totalTimeElem') totalTimeElemRef!: ElementRef;

  musicElement!: HTMLAudioElement;
  timelineIndicator!: HTMLElement;
  timelineProgress!: HTMLElement;
  timeline!: HTMLElement;
  currentTimeElem!: HTMLElement;
  totalTimeElem!: HTMLElement;
  duration!: number;
  timelineWidth!: number;
  initialMusicPlayerState = {
    isPlaying: false,
    currentTime: '0:00',
    duration: '0:00',
  };
  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    // this.musicElement = this.musicElementRef.nativeElement;
    if (
      this.musicElementRef &&
      this.timelineIndicatorRef &&
      this.currentTimeElemRef &&
      this.totalTimeElemRef &&
      this.timelineRef &&
      this.timelineProgressRef
    ) {
      this.musicElement = this.musicElementRef.nativeElement;
      this.timeline = this.timelineRef.nativeElement;
      this.timelineIndicator = this.timelineIndicatorRef.nativeElement;
      this.timelineProgress = this.timelineProgressRef.nativeElement;
      this.currentTimeElem = this.currentTimeElemRef.nativeElement;
      this.totalTimeElem = this.totalTimeElemRef.nativeElement;

      console.log(this.musicElement);
    }
  }

  updateTimeDisplay(): void {
    this.initialMusicPlayerState.currentTime = this.formatDuration(
      this.musicElement.currentTime
    );
  }
  formatDuration(time: number): string {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    const formattedHours = hours > 0 ? `${hours}:` : '';
    const formattedMinutes = `${
      minutes < 10 && hours > 0 ? '0' : ''
    }${minutes}`;
    const formattedSeconds = `${seconds < 10 ? '0' : ''}${seconds}`;

    return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
  }
  skip(duration: any): void {
    this.musicElement.currentTime += duration;
  }

  statusBarClick($event: MouseEvent): void {
    const el = this.timeline;
    const clickX = $event.offsetX;
    const totalWidth = el.offsetWidth;
    const targetPosition = (clickX / totalWidth) * 100;
    this.musicElement.currentTime = (targetPosition * this.duration) / 100;
    this.updateTimeline();
  }

  updateTimeline(): void {
    const percentComplete =
      (this.musicElement.currentTime / this.musicElement.duration) * 100;

    // Move the timeline indicator
    this.renderer.setStyle(
      this.timelineIndicator,
      'left',
      percentComplete + '%'
    );
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

  loadedMetadata(): void {
    this.initialMusicPlayerState.duration = this.formatDuration(
      (this.duration = this.musicElement.duration)
    );
    console.log('Audio metadata loaded. Duration:', this.duration);
  }
  onTimeUpdate(): void {
    this.updateTimeDisplay();
    this.updateTimeline();
  }
}
