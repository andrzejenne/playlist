import {ChangeDetectorRef, Injectable} from "@angular/core";
import {Medium} from "../models/medium";
import {Storage} from "@ionic/storage";
import {MediaManagerService} from "./MediaManagerService";
import {Content} from "ionic-angular";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {MediaFile} from "../models/media-file";
import {ServerManagerService} from "./ServerManagerService";
import {OfflineManagerService} from "./OfflineManagerService";

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

  file: MediaFile;

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

  private audioEl: HTMLAudioElement;

  private contentContainer: Content;

  private refs: ChangeDetectorRef[] = [];

  private interval: number;

  private resolvers: any[] = [];

  constructor(
    private storage: Storage,
    private mediaManager: MediaManagerService,
    private serverManager: ServerManagerService,
    private offline: OfflineManagerService
  ) {
  }

  setPlayerElements(video: HTMLVideoElement, audio: HTMLAudioElement) {
    this.videoEl = video;
    this.audioEl = audio;
    this.initEvents(video);
    this.initEvents(audio);
      // this.audioPlayer.nativeElement.onended = this.onPlayerPlayEnded;
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
      if (this.videoEl && this.audioEl) {
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

  getCurrent() {
    return this.medium;
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

    this.setCurrent(item, seek);

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
    if (item === this.getCurrent()) {
      return;
    }

    this.setCurrent(item, seek);

    this.updatePlayed();

    this.play();
  }

  togglePlayItem(item: Medium = null, seek = 0) {
    if (item) {
      if (item == this.getCurrent()) {
        this.setCurrent();

        this.updatePlayed();
      }
      else {
        this.playItem(item, seek);
      }
    }
    else {
      item = this.mediaList[0] || null;

      if (item) {
        this.playItem(item, seek);
      }
      else {
        this.updatePlayed();
      }
    }

    return this.getCurrent();
  }

  togglePlay() {
    this.status.playing = !this.status.playing;

    let player = this.getPlayer();

    if (!player || !player.src || !this.medium) {
      this.getNext();
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
      this.mediaList = [].concat(this.media);
    }
    this.updatePlayed();
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

    let next = this.getNext();

    if (this.status.repeat && !next) {
      this.playItem(this.mediaList[0]);
    }

    if (next) {
      this.play();
    }
    else {
      this.setCurrent();
      this.storage.remove('currentMedium');
      this.storage.remove('currentTime');
    }
  }

  playPrev() {
    if (this.getPrev()) {
      this.play();
    }
    else {
      this.setCurrent();
    }
  }

  isPlaying(medium?: Medium) {
    if (medium) {
      return this.status.playing && this.getCurrent() === medium;
    }
    else {
      return this.status.playing;
    }
  }

  private setCurrent(medium: Medium = null, seek = 0) {
    if (this.status.playing && this.getPlayer()) {
      this.getPlayer().pause();
    }

    this.medium = medium;
    if (medium) {
      this.file = this.mediaManager.getFileOrDefault(medium, this.mediaType);

      let player = this.getPlayer();
      player.src = this.getOfflineUrlIfFound(this.medium, this.file);

      player.currentTime = seek;

    }
    else {
      this.file = null;
      this.status.playing = false;
    }
    this.medium$.next(medium);

    return this;
  }

  private getOfflineUrlIfFound(item: Medium, file: MediaFile, host = this.serverManager.host, type = 'media') {
    let offlineUrl = this.offline.getMediaFileUrl(item, file);

    if (!offlineUrl) {
      console.warn('File not offline', item, file, host, type);
      return this.mediaManager.getFileUrl(item, file, host, type);
    }

    console.info('File is offline', item, file, host, type);

    return offlineUrl;
  }

  private preparePlaylist() {
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
    this.mediaList = PlayerService.reorderArray(this.mediaList, indexes);
    this.updatePlayed();
  }

  // private updatePlaylist() {
  //   let remove = [];
  //   let exists = [];
  //   if (this.playedList) {
  //     this.playedList.forEach(item => {
  //       let index = this.media.indexOf(item);
  //       if (index == -1) {
  //         remove.push(item);
  //       }
  //       else {
  //         exists.push(item);
  //       }
  //     });
  //     remove.forEach(item => PlayerService.removeItemFrom(item, this.playedList));
  //     remove = [];
  //   }
  //
  //   if (this.mediaList) {
  //     this.mediaList.forEach(item => {
  //       let index = this.media.indexOf(item);
  //       if (index == -1) {
  //         remove.push(item);
  //       }
  //       else {
  //         exists.push(item);
  //       }
  //     });
  //     remove.forEach(item => PlayerService.removeItemFrom(item, this.mediaList));
  //     remove = [];
  //
  //     let toAdd = [].concat(this.media).filter(
  //       item => exists.indexOf(item) == -1
  //     );
  //
  //     this.mediaList = this.mediaList.concat(toAdd);
  //   }
  // }

  pause() {
    clearInterval(this.interval);

    this.status.playing = false;
    this.getPlayer().pause();

    this.playStatus();
  }

  stop() {
    this.pause();

    this.setCurrent();

    this.playStatus();

    this.preparePlaylist();
  }

  public play() {
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

  private getPlayer(file: MediaFile = this.file) {
    if (file) {
      if ('audio' === file.type.slug) {
        return this.audioEl;
      }
      else {
        return this.videoEl;
      }
    }
    return null;
  }

  // private preparePlaylistDiff() {
  //   this.mediaList.splice(0, this.mediaList.length);
  //   this.mediaList.push(...this.media);
  //   this.playedList = [];
  // }

  private playStatus() {
    this.playIcon = this.status.playing ? 'pause' : 'play';
  }

  private shuffle(arr: any[]) {
    arr.sort(PlayerService.shuffleCallback);
  }

  // /**
  //  * @deprecated
  //  */
  // private setContentMarginIfVideo() {
  //   if (this.status.video && this.video.height) {
  //     this.contentContainer.getScrollElement().style.marginTop = (this.video.height + this.contentContainer._hdrHeight) + 'px';
  //   }
  // }
  //
  // /**
  //  * @deprecated
  //  */
  // private removeContentMargin() {
  //   // this.contentContainer.resize();
  //   this.contentContainer.getScrollElement().style.marginTop = (this.contentContainer._hdrHeight) + 'px';
  // }

  private onPlayerPlayEnded = (ev: MediaStreamErrorEvent) => {
    this.playNext();
  };

  private onPlayerMetadata = (ev: MediaStreamErrorEvent) => {
    let player = this.getPlayer();
    if (player instanceof HTMLVideoElement) {
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
    }
    console.info('PlayerService@onPlayerMetadata', ev);
  };

  private onPlayerProgress = () => {
    let player = this.getPlayer();

    if (player) {
      this.mediumTime = player.currentTime;
      this.totalTime = player.duration;
      this.storage.set('currentTime', this.mediumTime);
      // this.progress.nativeElement.style.left = ((this.mediumTime / this.totalTime) * 100) + '%';

      // this.ref.detectChanges();
      this.detectChanges();
    }
    else {
      clearInterval(this.interval);
    }

  };

  private getNext() {
    if (this.mediaList.length) {
      let index = this.mediaList.indexOf(this.medium);
      if (this.mediaList[index + 1]) {
        let medium = this.mediaList[index + 1];
        this.setCurrent(medium);
        return {
          medium: medium,
          file: this.mediaManager.getFile(medium, this.mediaType)
        };
      }
    }

    return null;
  }

  private getPrev() {
    if (this.playedList.length) {
      let medium = this.playedList.pop();
      this.setCurrent(medium);
      return {
        medium: medium,
        file: this.mediaManager.getFile(medium, this.mediaType)
      };
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

  // private static filterPlayed(played: Medium[], current: Medium) {
  //   return (item: Medium) => {
  //     return current !== item && played.indexOf(item) === -1;
  //   };
  // }

  private detectChanges() {
    this.refs.forEach(r => r.detectChanges());
  }

  private resolveReady() {
    this.resolvers.forEach(r => r(this.media));
    this.resolvers = [];
  }

  private updatePlayed() {
    let index = this.mediaList.indexOf(this.getCurrent());
    if (index > -1) {
      this.playedList = this.mediaList.slice(0, index);
    }
    else {
      this.playedList = [];
    }
  }

  private initEvents(el: HTMLVideoElement | HTMLAudioElement) {
    el.onended = this.onPlayerPlayEnded;
    if (el instanceof HTMLVideoElement) {
      el.onloadedmetadata = this.onPlayerMetadata;
    }
  }
}
