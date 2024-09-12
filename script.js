let currentsong = new Audio();
let currentPlayButton = null; // Reference to the current play button
let songs = []; // Array to store songs
let currentSongIndex = 0; // Index of the current song
let currentfolder ;

// Function to fetch the list of music files
async function getmusic(folder) {
    currentfolder = folder; // Set the current folder before fetching songs
    songs = []; // Clear the songs array
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    
    populateSongList(); // Call function to update UI with new songs

    return songs;
}

// Function to populate the song list in the UI
function populateSongList() {
    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = ''; // Clear existing songs

    for (const song of songs) {
        songul.innerHTML += `
            <li data-song="${song}">
                <i class="fa fa-music"></i>
                <div class="info">
                    <div>${song.replaceAll("-", " ").replaceAll("%20", " ")}</div>
                    <div>Zunair Khan</div>
                </div>
                <div class="playnow">
                    <i class="fa fa-play"></i>
                </div>
            </li>`;
    }

    // Add click event listeners to each song item
    Array.from(document.querySelectorAll(".songlist li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            currentSongIndex = index; // Update the current song index
            const track = e.getAttribute("data-song"); // Get the song file name
            const playButton = e.querySelector(".playnow i"); // Get the play button for this item
            playmusic(track, playButton); // Play or pause the selected track
            console.log(track); // Log the track name for debugging
        });
    });
}

// Function to format time as hh:mm:ss or mm:ss
const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Function to play the selected track
const playmusic = (track, playButton) => {
    if (currentsong.src.includes(track) && !currentsong.paused) {
        currentsong.pause();
        playButton.className = "fa fa-play"; // Update icon to play
        document.getElementById('play').className = "fa fa-play"; // Sync the main play button
        currentPlayButton = null; // Clear the reference to the current play button
    } else {
        currentsong.src = `/${currentfolder}/` + track;
        currentsong.play();
        if (currentPlayButton) {
            currentPlayButton.className = "fa fa-play"; // Reset previous play button
        }
        playButton.className = "fa fa-pause"; // Update icon to pause
        document.getElementById('play').className = "fa fa-pause"; // Sync the main play button
        currentPlayButton = playButton; // Update the current play button reference

        // Update the playbar information
        updatePlaybar(track);
    }
}

// Function to update the seek bar position
const updateSeekBar = () => {
    const seekBar = document.querySelector(".seekbar");
    const circle = document.querySelector(".circle");
    const percentage = (currentsong.currentTime / currentsong.duration) * 100;
    seekBar.style.backgroundSize = `${percentage}% 100%`; // Update seekbar color
    circle.style.left = `${percentage}%`;
}

// Function to update the playbar with the current song details
const updatePlaybar = (track) => {
    const songName = track.replace(/-/g, " ").replace(/%20/g, " ");
    document.getElementById('songName').textContent = songName;
    document.getElementById('artistName').textContent = "Zunair Khan"; // Assuming artist name is constant
}

// Function to update the volume icon based on current volume
const updateVolumeIcon = () => {
    const volumeIcon = document.querySelector(".vol i");
    const volume = currentsong.volume;

    if (volume === 0) {
        volumeIcon.className = "fa-solid fa-volume-xmark"; // Muted icon
    } else if (volume <= 0.5) {
        volumeIcon.className = "fa-solid fa-volume-low"; // Low volume icon
    } else {
        volumeIcon.className = "fa-solid fa-volume-high"; // High volume icon
    }
}

// Function to play the next track
const nextTrack = () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    const nextSong = songs[currentSongIndex];
    playmusic(nextSong, document.querySelector(`.songlist li[data-song="${nextSong}"] .playnow i`));
}

// Function to play the previous track
const prevTrack = () => {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    const prevSong = songs[currentSongIndex];
    playmusic(prevSong, document.querySelector(`.songlist li[data-song="${prevSong}"] .playnow i`));
}






async function displayAlbum() {
    console.log("displaying albums");
    let a = await fetch(`/music/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchor = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardcontainer");
    
    let array = Array.from(anchor);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes(`/music/`) ) {
            let folder = e.href.split("/").slice(-2)[1];
            console.log(e.href);
            
            // Fetch metadata (renamed variable from 'a' to 'metadataResponse')
            let metadataResponse = await fetch(`http://127.0.0.1:5500/music/${folder}/info.json`);
            let metadata = await metadataResponse.json();
            console.log(metadata);

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <i style="border: 2px rgb(59, 228, 119); padding: 30px; border-radius: 100%; background-color: rgb(59, 228, 119); color: black;" 
                        class="fa-duotone fa-solid fa-play"></i>
                    <img src="/music/${folder}/cover.jpg">
                    <h2>${metadata.title}</h2>
                    <p>${metadata.description}</p>
                </div>`;
        }
    }

     // Set up click event listeners for each card
     Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async item => {
            const folder = `music/${item.currentTarget.dataset.folder}`;
            console.log(`Fetching music from folder: ${folder}`);
            await getmusic(folder); // Fetch new songs based on clicked card
        });
    });
}






// Main function to populate the song list and set up event listeners
async function main() {
    songs = await getmusic("music/ncs"); // Fetch the initial list of songs
     await displayAlbum();
   



    // Event listeners for playback control
    currentsong.addEventListener('timeupdate', () => {
        const currentTime = Math.floor(currentsong.currentTime);
        const duration = Math.floor(currentsong.duration);

        document.querySelector('.songtime').innerHTML = `
            ${formatTime(currentTime)} / ${formatTime(duration)}
        `;
        updateSeekBar();
    });

    const play = document.getElementById('play'); // Define the play button using id

    play.addEventListener('click', () => {
        if (currentsong.paused || currentsong.currentTime <= 0) {
            currentsong.play();
            play.classList.remove('fa-play');
            play.classList.add('fa-pause');
            if (currentPlayButton) {
                currentPlayButton.className = "fa fa-pause"; // Sync the current play button
            }
        } else {
            currentsong.pause();
            play.classList.add('fa-play');
            play.classList.remove('fa-pause');
            if (currentPlayButton) {
                currentPlayButton.className = "fa fa-play"; // Sync the current play button
            }
        }
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const seekBar = e.target;
        const rect = seekBar.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const newTime = (offsetX / seekBar.clientWidth) * currentsong.duration;
        currentsong.currentTime = newTime;
    });

    // Add event listener to volume control
    const volumeInput = document.querySelector(".vol input");
    volumeInput.addEventListener("input", (e) => {
        currentsong.volume = parseFloat(e.target.value) / 100;
        updateVolumeIcon(); // Call the function to update the volume icon
    });

    // Initialize volume slider value
    volumeInput.value = currentsong.volume * 100;

    // Initialize volume icon
    updateVolumeIcon();

    // Add event listeners to previous and next buttons
    document.getElementById('previous').addEventListener('click', prevTrack);
    document.getElementById('next').addEventListener('click', nextTrack);
}

// Execute the main function
main();
