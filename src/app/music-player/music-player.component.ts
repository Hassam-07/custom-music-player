import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
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
  @ViewChild('rangeSlider') rangeSliderRef!: ElementRef;
  // @ViewChild('muteButton') muteButtonRef!: ElementRef;
  // @ViewChild('volumeHighIcon') volumeHighIconRef!: ElementRef;
  // @ViewChild('volumeLowIcon') volumeLowIconRef!: ElementRef;
  // @ViewChild('volumeMutedIcon') volumeMutedIconRef!: ElementRef;
  // @ViewChild('videoContainer') videoContainer!: ElementRef;

  musicElement!: HTMLAudioElement;
  timelineIndicator!: HTMLElement;
  timelineProgress!: HTMLElement;
  timeline!: HTMLElement;
  currentTimeElem!: HTMLElement;
  totalTimeElem!: HTMLElement;
  rangeSlider!: HTMLElement;
  // muteButton!: HTMLElement;
  volumeHighIcon!: HTMLElement;
  volumeLowIcon!: HTMLElement;
  volumeMutedIcon!: HTMLElement;
  duration!: number;
  timelineWidth!: number;
  initialMusicPlayerState = {
    isPlaying: false,
    currentTime: '0:00',
    duration: '0:00',
    volumeLevel: 'high',
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
      this.timelineProgressRef &&
      this.rangeSliderRef
    ) {
      this.musicElement = this.musicElementRef.nativeElement;
      this.timeline = this.timelineRef.nativeElement;
      this.timelineIndicator = this.timelineIndicatorRef.nativeElement;
      this.timelineProgress = this.timelineProgressRef.nativeElement;
      this.currentTimeElem = this.currentTimeElemRef.nativeElement;
      this.totalTimeElem = this.totalTimeElemRef.nativeElement;
      this.rangeSlider = this.rangeSliderRef.nativeElement;
      this.onVolumeChange();
      console.log(this.musicElement);
    }
  }
  backwardSeek(): void {
    const backwardTime = 5; // seconds to seek backward
    this.musicElement.currentTime -= backwardTime;
  }

  forwardSeek(): void {
    const forwardTime = 5; // seconds to seek forward
    const newTime = this.musicElement.currentTime + forwardTime;
    if (newTime < this.musicElement.duration) {
      this.musicElement.currentTime = newTime;
    } else {
      this.musicElement.currentTime;
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
  volumeChange(): void {
    this.updateVolume();
  }

  onVolumeChange(): void {
    // const volumeSlider = document.querySelector('.volume-slider') as HTMLInputElement;
    const volumeValue = parseFloat(this.rangeSliderRef.nativeElement.value);

    const fillPercentage = (volumeValue * 100).toFixed(2);
    const backgroundGradient = `linear-gradient(to right, #fff 0%, #fff ${fillPercentage}%, #a3a3a3 ${fillPercentage}%, #a3a3a3 100%)`;

    this.rangeSlider.style.background = backgroundGradient;
  }
  toggleMute(): void {
    this.musicElement.muted = !this.musicElement.muted;

    this.toggleVolumeIcons();
  }
  private toggleVolumeIcons(): void {
    if (this.musicElement.muted) {
      this.initialMusicPlayerState.volumeLevel = 'muted';
    } else if (this.musicElement.volume >= 0.5) {
      this.initialMusicPlayerState.volumeLevel = 'high';
    } else {
      this.initialMusicPlayerState.volumeLevel = 'low';
    }
  }
  @HostListener('input', ['$event'])
  onVolumeSliderChange(event: any): void {
    const volumeValue = event.target.value;
    this.musicElement.volume = volumeValue;
    this.musicElement.muted = volumeValue === '0';

    // Update volume level and apply it to the container dataset
    this.updateVolume();
  }

  updateVolume(): void {
    const volumeLevel = this.calculateVolumeLevel();
    this.initialMusicPlayerState.volumeLevel = volumeLevel;
  }

  calculateVolumeLevel(): string {
    const volume = this.musicElement.volume;

    if (this.musicElement.muted || volume === 0) {
      // this.volumeSlider.value = '0';
      this.toggleVolumeSliderIcons('muted');
      return 'muted';
    } else if (volume >= 0.5) {
      // this.volumeSlider.nativeElement.value = '0';
      this.toggleVolumeSliderIcons('high');
      return 'high';
    } else {
      this.toggleVolumeSliderIcons('low');
      return 'low';
    }
  }

  toggleVolumeSliderIcons(level: string): void {
    const { volumeHighIcon, volumeLowIcon, volumeMutedIcon } = this;

    switch (level) {
      case 'muted':
        this.initialMusicPlayerState.volumeLevel = 'muted';
        break;
      case 'high':
        this.initialMusicPlayerState.volumeLevel = 'high';
        break;
      case 'low':
        this.initialMusicPlayerState.volumeLevel = 'low';
        break;
      default:
        break;
    }
  }
}
