import {ChangeDetectorRef, Component, OnDestroy, ViewChild} from '@angular/core';
import {AlertController, NavController, Select, Slide} from 'ionic-angular';
import {AuthService} from "../../services/AuthService";
import {Playlist} from "../../models/playlist";
import {PlaylistsRepository} from "../../repositories/playlists.repository";
import {SearchPage} from "../search/search";
import {Medium} from "../../models/medium";
import {ElementReference} from "../../models/ElementReference";
import {SlideElement} from "ionic-angular/components/slides/swiper/swiper-interfaces";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnDestroy {

  public playlist: Playlist;

  public playlists: Playlist[] = [];

  public media: Medium[] = [];

  public mediaPlaylist: Medium[];

  public current: Medium;

  public playerStatus = {
    shuffle: false,
    repeat: false,
    playing: false,
    video: false,
    audio: true,
  };

  public colors = {
    video: 'light',
    audio: 'primary',
    prev: 'light',
    next: 'light',
    play: 'light',
    shuffle: 'light',
    repeat: 'light'
  };

  playIcon: string = 'play';

  mediaType: string = 'audio';

  currentTime: number = 0;
  totalTime: number = 0;

  playedPlaylist: Medium[];

  private searchPage = SearchPage;

  private interval: number;

  @ViewChild('playlistSelect') select: Select;

  @ViewChild('audioPlayer') audioPlayer: ElementReference<HTMLAudioElement>;

  @ViewChild('progress') progress: ElementReference<HTMLDivElement>;

  constructor(
    public navCtrl: NavController,
    // public pages: PagesService,
    private repo: PlaylistsRepository,
    private auth: AuthService,
    private alertCtrl: AlertController,
    private ref: ChangeDetectorRef
  ) {
  }

  ionViewDidLoad() {

    this.repo.playlists$.subscribe(playlists => {
      this.playlists = playlists;
      this.ref.detectChanges();
    });
    this.repo.playlist$.subscribe(playlist => {
      if (playlist) {
        this.playlist = playlist;
        this.onPlaylistChange(playlist);
        // console.info('select playlist', playlist);
      }
      this.ref.detectChanges();
    });

    let user = this.auth.getUser();
    if (user && user.id) {
      this.repo.getPlaylists(user.id)
    }

    this.initAudioPlayer();
  }

  goToSearchPage() {
    this.navCtrl.push(this.searchPage);
  }

  onPlaylistChange(playlist) {
    // this.repo.selectPlaylist(playlist);

    this.repo.load(playlist)
      .then(data => {
        this.media = data;
        this.preparePlaylist();
        this.ref.detectChanges();
      })
      .catch(error => { // @todo - error reporting service directly to repository
        let alert = this.alertCtrl.create({
          title: 'Error!',
          subTitle: error.message || 'error occured',
          buttons: ['Ok']
        });

        alert.present();
      });
  }

  playVideo() {
    this.playerStatus.video = true;
    this.playerStatus.audio = false;

    this.colors.audio = 'light';
    this.colors.video = 'primary';
  }

  playAudio() {
    this.playerStatus.video = false;
    this.playerStatus.audio = true;

    this.colors.audio = 'primary';
    this.colors.video = 'light';
  }

  playItem(item: Medium) {
    if (!this.mediaPlaylist) {
      this.preparePlaylist();
    }

    let index = this.mediaPlaylist.indexOf(item);
    if (index > -1) {
      this.mediaPlaylist.splice(index, 1);
    }

    this.current = item;

    this.audioPlayer.nativeElement.src = Medium.getUrl(this.current, this.mediaType);

    this.play();
  }

  togglePlay() {
    if (!this.mediaPlaylist) {
      this.preparePlaylist();
    }

    this.playerStatus.playing = !this.playerStatus.playing;

    if (!this.audioPlayer.nativeElement.src) {
      this.audioPlayer.nativeElement.src = this.getNextSrc();
    }

    if (this.playerStatus.playing) {
      this.play();
    }
    else {
      this.pause();
    }
  }

  toggleRepeat() {
    this.playerStatus.repeat = !this.playerStatus.repeat;
    this.colors.repeat = this.playerStatus.repeat ? 'primary' : 'light';
  }

  toggleShuffle() {
    if (!this.mediaPlaylist) {
      this.preparePlaylist();
    }
    this.playerStatus.shuffle = !this.playerStatus.shuffle;
    this.colors.shuffle = this.playerStatus.shuffle ? 'primary' : 'light';
    if (this.playerStatus.shuffle) {
      this.shuffle(this.mediaPlaylist);
    }
    else {
      let playlist = [].concat(this.media);
      if (this.playedPlaylist.length) {
        playlist = playlist.filter(HomePage.filterPlayed(this.playedPlaylist, this.current));
      }
      if (this.current) {
        playlist.splice(playlist.indexOf(this.current), 1);
      }
      this.mediaPlaylist = playlist;
    }
  }

  onSliderChange(event) {
    // console.info('slide change', event);
  }

  onSliderFocus(event) {
    // console.info('slide focus', event);
    // this.pause();
  }

  onSliderBlur(event) {
    // console.info('slide blur', event.value);
    if (event.value != this.audioPlayer.nativeElement.currentTime) {
      // this.audioPlayer.nativeElement.currentTime = +event.value;
      console.info(this.audioPlayer.nativeElement.currentTime);
      this.audioPlayer.nativeElement.pause();
      this.audioPlayer.nativeElement.currentTime = 60;

    }
    // this.play();

    // debugger;
  }

  ngOnDestroy(): void {
  }

  isPlaying(item: Medium) {
    return this.current === item;
  }

  wasPlayed(item: Medium) {
    return this.playedPlaylist.indexOf(item) > -1;
  }

  playNext() {
    if (this.current) {
      this.playedPlaylist.push(this.current);
    }

    let nextSrc = this.getNextSrc();

    if (nextSrc) {
      this.audioPlayer.nativeElement.src = nextSrc;

      this.play();
    }
    else {
      this.current = null;
    }
  }

  playPrev() {
    if (this.current) {
      this.mediaPlaylist.unshift(this.current);
    }

    let prevSrc = this.getPrevSrc();

    if (prevSrc) {
      this.audioPlayer.nativeElement.src = prevSrc;

      this.play();
    }
    else {
      this.current = null;
    }
  }

  getThumbnailUrl(item: Medium) {
    let thumb = this.getThumbnail(item);
    if (thumb) {
      return Medium.getFileUrl(item, thumb);
    }

    return null;
  }

  private getThumbnail(item: Medium) {
    for (let i = 0; i < item.files.length; i++) {
      if ('thumbnail' === item.files[i].type.slug) {
        return item.files[i];
      }
    }

    return null;
  }

  private getNextSrc() {
    if (this.mediaPlaylist.length) {
      this.current = this.mediaPlaylist.shift();
      return Medium.getUrl(this.current, this.mediaType);
    }

    return null;
  }

  private getPrevSrc() {
    if (this.playedPlaylist.length) {
      this.current = this.playedPlaylist.pop();
      return Medium.getUrl(this.current, this.mediaType);
    }

    return null;
  }

  private preparePlaylist() {
    this.mediaPlaylist = [].concat(this.media);
    this.playedPlaylist = [];
    if (this.playerStatus.shuffle) {
      this.shuffle(this.mediaPlaylist);
    }
  }

  private playStatus() {
    this.colors.play = this.playerStatus.playing ? 'primary' : 'light';
    this.playIcon = this.playerStatus.playing ? 'pause' : 'play';
  }

  private play() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.playerStatus.playing = true;

    this.audioPlayer.nativeElement.play();
    this.interval = setInterval(this.onAudioProgress, 100);

    this.playStatus();
  }

  private pause() {
    clearInterval(this.interval);

    this.playerStatus.playing = false;
    this.audioPlayer.nativeElement.pause();

    this.playStatus();
  }

  private shuffle(arr: any[]) {
    arr.sort(HomePage.shuffleCallback);
  }

  private initAudioPlayer() {
    this.audioPlayer.nativeElement.onended = this.onAudioEnded;
  }

  private onAudioEnded = (ev: MediaStreamErrorEvent) => {
    this.playNext();
  };

  private onAudioProgress = () => {
    this.currentTime = this.audioPlayer.nativeElement.currentTime;
    this.totalTime = this.audioPlayer.nativeElement.duration;

    // this.progress.nativeElement.style.left = ((this.currentTime / this.totalTime) * 100) + '%';

    // this.ref.detectChanges();
  };

  private static shuffleCallback = (a: any, b: any) => {
    return Math.round(Math.random() * 2) - 1;
  };

  private static filterPlayed(played: Medium[], current: Medium) {
    return (item: Medium) => {
      return current !== item && played.indexOf(item) === -1;
    };
  }
}
