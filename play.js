const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE = "MUSIC_PLAYLIST"

const player = $(".player");
const heading = $("header h2");
const cdThumd = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playlist = $(".playlist");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem("PLAYER_STORAGE")) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem("PLAYER_STORAGE", JSON.stringify(this.config));
    },
    songs: [{
        name: 'CoHenVoiThanhXuan',
        singer: 'DAB',
        path: './assets/music/s1.mp3',
        image: './assets/img/a1.jpg'
    }, {
        name: 'Huong',
        singer: 'Van Mai Huong',
        path: './assets/music/s2.mp3',
        image: './assets/img/a2.jpg'
    }, {
        name: 'Lonely',
        singer: 'NaNa',
        path: './assets/music/s3.mp3',
        image: './assets/img/a3.jpg'
    }, {
        name: 'MuonRoiMaSaoCon',
        singer: 'MTP',
        path: './assets/music/s4.mp3',
        image: './assets/img/a4.jpg'
    }, {
        name: 'Something like this',
        singer: 'Closer',
        path: './assets/music/s5.mp3',
        image: './assets/img/a5.jpg'
    }],
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return ` <div class="song ${index===this.currentIndex ? "active" : " "}" data-index = "${index}">
        <div class="thumb" style="background-image: url('${song.image}')">
        </div>
        <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
        </div>
        <div class="option">
            <i class="fas fa-ellipsis-h"></i>
        </div>
    </div>`
        })
        playlist.innerHTML = htmls.join("");
    },
    handleEvents: function() {
        const cdWidth = cd.offsetWidth;
        // xử lí CD xoay tròn
        const cdThumdAnimate = cdThumd.animate([{
            transform: 'rotate(360deg)'
        }], {
            duration: 10000,
            iterations: Infinity // quay vô hạn
        })
        cdThumdAnimate.pause();
        // xử lí phóng to / thu nhỏ CD
        document.onscroll = function() {
                // const scrollTop = window.scrollY;
                const scrollTop = document.documentElement.scrollTop;
                const newCdWidth = cdWidth - scrollTop;
                cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
                cd.style.opacity = newCdWidth / cdWidth;
            }
            // xử lí khi click nút play
        playBtn.onclick = function() {
                if (app.isPlaying) {
                    audio.pause();
                } else {
                    audio.play();
                }
            }
            // khi bài hát được play
        audio.onplay = function() {
                app.isPlaying = true;
                player.classList.add('playing');
                cdThumdAnimate.play();
            }
            // khi bài hát pause
        audio.onpause = function() {
                app.isPlaying = false;
                player.classList.remove('playing');
                cdThumdAnimate.pause();
            }
            // khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
                if (audio.duration) {
                    const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                    progress.value = progressPercent;
                }
            }
            // xử lí khi tua bài hát
        progress.onchange = function(e) {
                const seekTime = audio.duration / 100 * e.target.value;
                audio.currentTime = seekTime;
            }
            // khi next song
        nextBtn.onclick = function() {
                if (app.isRandom) {
                    app.randomSong();
                } else {
                    app.nextSong();
                }
                audio.play();
                app.render();
                app.scrollActiveSong();
            }
            // khi prev song
        prevBtn.onclick = function() {
                if (app.isRandom) {
                    app.randomSong();
                } else {
                    app.prevSong();
                }
                audio.play();
                app.render();
            }
            // khi bật/tắt random song
        randomBtn.onclick = function(e) {
                app.isRandom = !app.isRandom;
                randomBtn.classList.toggle("active", app.isRandom);
                app.setConfig(".isRandom", app.isRandom);
            }
            // xử lí next song khi kết thúc bài hát
        audio.onended = function() {
                if (app.isRepeat) {
                    audio.play();
                } else {
                    nextBtn.click();
                }
                audio.play();
            }
            // khi muốn  phát lại 1 song
        repeatBtn.onclick = function() {
                app.isRepeat = !app.isRepeat;
                repeatBtn.classList.toggle("active", app.isRepeat);
                app.setConfig(".isRepeat", app.isRepeat);
            }
            // khi click song bạn muốn phát
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option')) {
                // xử lí khi click vào song bạn muốn phát
                if (songNode) {
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong();
                    audio.play();
                    app.render();
                    app.scrollActiveSong();
                }
            }

        }
    },
    defineProperty: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumd.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path;
    },
    // xử lí kéo thả tới vị trí bài hát đang bật
    scrollActiveSong: function() {
        setTimeout(function() {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            })
        }, 300)
    },
    // khi next song
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    // khi prev song
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    // khi random song
    randomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        }
        while (newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function() {
        // cấu hình từ config vào ứng dụng
        this.loadConfig();
        // định nghĩa các thuộc tính cho object
        this.defineProperty()
            // render ra bài hát
        this.render()
            // lắng nghe xử lý các sự kiện DOM events
        this.handleEvents()
            // tải thông tin bài hát đầu tiên
        this.loadCurrentSong()
            // hiển thị trạng thái ban đầu của button repeat và random
        randomBtn.classList.toggle("active", app.isRandom);
        repeatBtn.classList.toggle("active", app.isRepeat);
    }

}
app.start()