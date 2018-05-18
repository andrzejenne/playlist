import {ChangeDetectorRef, Injectable} from "@angular/core";
import {Medium} from "../models/medium";
import {Storage} from "@ionic/storage";
import {MediaManagerService} from "./MediaManagerService";
import {Content} from "ionic-angular";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class PlayerService {

  status: {
    shuffle: boolean;
    repeat: boolean;
    playing: boolean;
    video: boolean;
    audio: boolean;
  } = {
    shuffle: false,
    repeat: false,
    playing: false,
    video: false,
    audio: true
  };

  video: {
    width: number;
    height: number;
  } = {
    width: 0,
    height: 0
  };

  media: Medium[] = [];

  mediaList: Medium[] = [];

  playedList: Medium[] = [];

  medium: Medium;

  ready: boolean;

  mediaType: string = 'audio';

  playIcon: string = 'play';

  totalTime: number = 0;

  mediumTime: number = 0;

  medium$: BehaviorSubject<Medium> = new BehaviorSubject<Medium>(null);

  get videoElement() {
    return this.videoEl;
  }

  private videoEl: HTMLVideoElement;

  private contentContainer: Content;

  private refs: ChangeDetectorRef[] = [];

  private interval: number;

  private resolvers: any[] = [];

  constructor(
    private storage: Storage,
    private mediaManager: MediaManagerService
  ) {
  }

  setVideoElement(el: HTMLVideoElement) {
    this.videoEl = el;
    this.initPlayer();

    this.resolveReady();

    return this;
  }

  setContent(content: Content) {
    this.contentContainer = content;

    return this;
  }

  setMedia(media?: Medium[]) {
    this.media = media || [];
    this.preparePlaylist();

    return this;
  }

  addChangeDetector(ref: ChangeDetectorRef) {
    this.refs.push(ref);

    return this;
  }

  onReady() {
    return new Promise((resolve, reject) => {
      if (this.videoEl) {
        resolve(this.media);
      }
      else {
        this.resolvers.push(resolve);
      }
    });
  }

  isCurrent(medium: Medium) {
    return this.medium === medium;
  }

  wasPlayed(medium: Medium) {
    return this.playedList.indexOf(medium) > -1;
  }

  playVideo(toggle = true) {
    if (this.status.video && toggle) {
      this.requestFullscreen();
    }
    this.status.video = true;
    this.status.audio = false;

    // this.setContentMarginIfVideo();
  }

  playAudio() {
    this.status.video = false;
    this.status.audio = true;

    // this.removeContentMargin();
  }

  playFirst(item: Medium, seek = 0) {
    let index = this.mediaList.indexOf(item);
    if (index > -1) {
      this.mediaList.splice(index, 1);
      this.mediaList.unshift(item);
    }

    this.setMedium(item);

    let player = this.getPlayer();
    player.src = this.mediaManager.getUrl(this.medium, this.mediaType);

    player.currentTime = seek;

    this.play();

    this.detectChanges();
  }

  removeMedium(medium: Medium) {
    PlayerService.removeItemFrom(medium, this.media);
    PlayerService.removeItemFrom(medium, this.playedList);
    PlayerService.removeItemFrom(medium, this.mediaList);
  }

  playVideoItem(item: Medium, seek = 0) {
    this.playVideo(false);
    this.playItem(item, seek);
  }

  playAudioItem(item: Medium, seek = 0) {
    this.playAudio();
    this.playItem(item, seek);
  }

  playItem(item: Medium, seek = 0) {
    let index = this.mediaList.indexOf(item);
    if (index > -1) {
      this.playedList = this.mediaList.slice(0, index);
    }

    this.setMedium(item);

    let player = this.getPlayer();
    player.src = this.mediaManager.getUrl(this.medium, this.mediaType);

    player.currentTime = seek;

    this.play();
  }

  togglePlay() {
    this.status.playing = !this.status.playing;

    let player = this.getPlayer();

    if (!player.src || !this.medium) {
      player.src = this.getNextSrc();
    }

    if (this.status.playing) {
      this.play();
    }
    else {
      this.pause();
    }

    this.detectChanges();
  }

  toggleRepeat() {
    this.status.repeat = !this.status.repeat;
  }

  forceShuffle() {
    this.status.shuffle = false;
    this.toggleShuffle();
  }

  toggleShuffle() {
    this.status.shuffle = !this.status.shuffle;
    if (this.status.shuffle) {
      this.shuffle(this.mediaList);
    }
    else {
      let playlist = [].concat(this.media);
      if (this.playedList.length) {
        playlist = playlist.filter(PlayerService.filterPlayed(this.playedList, this.medium));
      }
      if (this.medium) {
        playlist.splice(playlist.indexOf(this.medium), 1);
      }
      this.mediaList = playlist;
    }
  }

  requestFullscreen() {
    let elem = <any>this.videoEl;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
    // @todo - disable fullscreen
  }

  playNext() {
    if (this.medium) {
      this.playedList.push(this.medium);
    }

    let nextSrc = this.getNextSrc();

    if (nextSrc) {
      let player = this.getPlayer();

      player.src = nextSrc;

      this.play();
    }
    else {
      this.setMedium();
      this.storage.remove('currentMedium');
      this.storage.remove('currentTime');
    }
  }

  playPrev() {
    let prevSrc = this.getPrevSrc();

    if (prevSrc) {
      let player = this.getPlayer();

      player.src = prevSrc;

      this.play();
    }
    else {
      this.setMedium();
    }
  }

  setMedium(medium: Medium = null) {
    this.medium = medium;
    this.medium$.next(medium);

    return this;
  }

  preparePlaylist() {
    this.mediaList = [].concat(this.media || []);
    this.playedList = [];
    if (this.status.shuffle) {
      this.shuffle(this.mediaList);
    }

    this.ready = true;
  }

  static reorderArray(array: any[], indexes: { from: number, to: number }): any[] {
    const element = array[indexes.from];
    array.splice(indexes.from, 1);
    array.splice(indexes.to, 0, element);
    return array;
  }

  reorderData(indexes: any) {
    this.media = PlayerService.reorderArray(this.media, indexes);
  }

  updatePlaylist() {
    let remove = [];
    let exists = [];
    if (this.playedList) {
      this.playedList.forEach(item => {
        let index = this.media.indexOf(item);
        if (index == -1) {
          remove.push(item);
        }
        else {
          exists.push(item);
        }
      });
      remove.forEach(item => PlayerService.removeItemFrom(item, this.playedList));
      remove = [];
    }

    if (this.mediaList) {
      this.mediaList.forEach(item => {
        let index = this.media.indexOf(item);
        if (index == -1) {
          remove.push(item);
        }
        else {
          exists.push(item);
        }
      });
      remove.forEach(item => PlayerService.removeItemFrom(item, this.mediaList));
      remove = [];

      let toAdd = [].concat(this.media).filter(
        item => exists.indexOf(item) == -1
      );

      this.mediaList = this.mediaList.concat(toAdd);
    }
  }

  pause() {
    clearInterval(this.interval);

    this.status.playing = false;
    this.getPlayer().pause();

    this.playStatus();
  }

  stop() {
    this.pause();

    this.setMedium();

    this.playStatus();

    this.preparePlaylist();
  }

  getPlayer() {
    return this.videoEl;
  }

  private preparePlaylistDiff() {
    this.mediaList.splice(0, this.mediaList.length);
    this.mediaList.push(...this.media);
    this.playedList = [];
  }

  private playStatus() {
    this.playIcon = this.status.playing ? 'pause' : 'play';
  }

  private play() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.status.playing = true;

    let player = this.getPlayer();

    if (this.medium && this.status.video && !this.mediaManager.hasVideo(this.medium)) {
      this.playAudio();
    }

    player.play();

    this.interval = setInterval(this.onPlayerProgress, 100);

    this.playStatus();

    this.storage.set('currentMedium', this.medium.id);
  }

  private shuffle(arr: any[]) {
    arr.sort(PlayerService.shuffleCallback);
  }

  private initPlayer() {
    let player = this.getPlayer();
    player.onended = this.onPlayerPlayEnded;
    player.onloadedmetadata = this.onPlayerMetadata;
    // this.audioPlayer.nativeElement.onended = this.onPlayerPlayEnded;
  }

  /**
   * @deprecated
   */
  private setContentMarginIfVideo() {
    if (this.status.video && this.video.height) {
      this.contentContainer.getScrollElement().style.marginTop = (this.video.height + this.contentContainer._hdrHeight) + 'px';
    }
  }

  /**
   * @deprecated
   */
  private removeContentMargin() {
    // this.contentContainer.resize();
    this.contentContainer.getScrollElement().style.marginTop = (this.contentContainer._hdrHeight) + 'px';
  }

  private onPlayerPlayEnded = (ev: MediaStreamErrorEvent) => {
    this.playNext();
  };

  private onPlayerMetadata = (ev: MediaStreamErrorEvent) => {
    let player = this.getPlayer();
    let aspect = player.videoWidth / player.videoHeight;
    this.video.width = Math.min(player.videoWidth, this.contentContainer.contentWidth);
    this.video.height = this.video.width / aspect;

    let contentHeight = this.contentContainer.contentHeight;
    let halfHeight = contentHeight / 2;
    if (this.video.height > halfHeight) {
      this.video.height = halfHeight;
      this.video.width = aspect * this.video.height;
    }

    // this.video.containerStyle = {width: '100%', height: this.video.height + "px"};

    // this.setContentMarginIfVideo();

    this.detectChanges();

    console.info('PlayerService@onPlayerMetadata', ev);
  };

  private onPlayerProgress = () => {
    let player = this.getPlayer();

    this.mediumTime = player.currentTime;
    this.totalTime = player.duration;
    this.storage.set('currentTime', this.mediumTime);
    // this.progress.nativeElement.style.left = ((this.mediumTime / this.totalTime) * 100) + '%';

    // this.ref.detectChanges();
    this.detectChanges();
  };

  private getNextSrc() {
    if (this.mediaList.length) {
      let index = this.mediaList.indexOf(this.medium);
      if (this.mediaList[index + 1]) {
        this.setMedium(this.mediaList[index + 1]);
        return this.mediaManager.getUrl(this.medium, this.mediaType);
      }
    }

    return null;
  }

  private getPrevSrc() {
    if (this.playedList.length) {
      this.setMedium(this.playedList.pop());
      return this.mediaManager.getUrl(this.medium, this.mediaType);
    }

    return null;
  }

  private static removeItemFrom(item: Medium, arr: Medium[]) {
    let index = arr.indexOf(item);
    if (index > -1) {
      arr.splice(index, 1);
    }
  }

  private static shuffleCallback = (a: any, b: any) => {
    return Math.round(Math.random() * 2) - 1;
  };

  private static filterPlayed(played: Medium[], current: Medium) {
    return (item: Medium) => {
      return current !== item && played.indexOf(item) === -1;
    };
  }

  private detectChanges() {
    this.refs.forEach(r => r.detectChanges());
  }

  private resolveReady() {
    this.resolvers.forEach(r => r(this.media));
    this.resolvers = [];
  }
}
