const API_BASE = "http://127.0.0.1:5000/api"; // Flask backend URL

// -------------------- Section Navigation --------------------
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');
    
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
    }
}

// -------------------- Journal Entries --------------------
const saveEntryDay = document.getElementById('saveEntryDay');
const newEntryDay = document.getElementById('newEntryDay');
const postListDay = document.getElementById('postListDay');

if (saveEntryDay) {
    saveEntryDay.addEventListener('click', () => {
        const entryDate = document.getElementById('deliveryDate').value;
        const entryText = newEntryDay.value.trim();

        if (entryText !== '') {
            const newPost = document.createElement('div');
            newPost.innerHTML = `<strong>${entryDate}</strong><p>${entryText}</p>`;
            postListDay.appendChild(newPost);
            
            newEntryDay.value = ''; // Clear textarea
        }
    });
}

// -------------------- Save Journal Entry to Backend --------------------
async function saveEntry() {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in first!");

    const title = document.getElementById("entryTitle").value;
    const content = document.getElementById("newEntry").value;

    if (!title || !content) {
        alert("Please enter a title and content.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/journal`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ title, content }),
        });

        const data = await response.json();
        alert(data.message || "Entry saved!");
        document.getElementById("entryTitle").value = "";
        document.getElementById("newEntry").value = "";
    } catch (error) {
        alert("Error saving entry. Please try again.");
    }
}

// -------------------- Load Journal Entries --------------------
async function loadEntries() {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in first!");

    try {
        const response = await fetch(`${API_BASE}/journal`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error("Failed to load entries. Please try again.");
        }

        const entries = await response.json();
        const postList = document.getElementById("postList");
        postList.innerHTML = "";

        if (entries.length === 0) {
            postList.innerHTML = "<p>No journal entries found.</p>";
            return;
        }

        entries.forEach(entry => {
            const postDiv = document.createElement("div");
            postDiv.className = "post";
            postDiv.innerHTML = `
                <h3>${entry.title}</h3>
                <p>${entry.content}</p>
                <p><small>${new Date(entry.date).toLocaleDateString()}</small></p>
            `;
            postList.appendChild(postDiv);
        });
    } catch (error) {
        alert(error.message);
    }
}

// -------------------- Voice Recording --------------------
let mediaRecorder;
let audioChunks = [];

document.getElementById("startRecord").addEventListener("click", async function() {
    let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };
    
    mediaRecorder.onstop = () => {
        let audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        let audioURL = URL.createObjectURL(audioBlob);
        document.getElementById("audioPlayback").src = audioURL;
    };

    mediaRecorder.start();
    audioChunks = [];
    
    document.getElementById("startRecord").disabled = true;
    document.getElementById("stopRecord").disabled = false;
});

document.getElementById("stopRecord").addEventListener("click", function() {
    mediaRecorder.stop();
    
    document.getElementById("startRecord").disabled = false;
    document.getElementById("stopRecord").disabled = true;
});

document.getElementById("deleteAudio").addEventListener("click", function() {
    document.getElementById("audioPlayback").src = "";
    audioChunks = [];
});

// -------------------- Video Recording --------------------
let videoStream;
let recordedVideoURL;

document.getElementById("startVideo").addEventListener("click", async function() {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    document.getElementById("videoPreview").srcObject = videoStream;
    
    mediaRecorder = new MediaRecorder(videoStream);
    let videoChunks = [];

    mediaRecorder.ondataavailable = event => {
        videoChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        let videoBlob = new Blob(videoChunks, { type: "video/mp4" });
        recordedVideoURL = URL.createObjectURL(videoBlob);
        document.getElementById("videoPlayback").src = recordedVideoURL;
    };

    mediaRecorder.start();
    
    document.getElementById("startVideo").disabled = true;
    document.getElementById("stopVideo").disabled = false;
});

document.getElementById("stopVideo").addEventListener("click", function() {
    mediaRecorder.stop();
    videoStream.getTracks().forEach(track => track.stop());

    document.getElementById("startVideo").disabled = false;
    document.getElementById("stopVideo").disabled = true;
});

document.getElementById("deleteVideo").addEventListener("click", function() {
    document.getElementById("videoPlayback").src = "";
    recordedVideoURL = null;
});

// -------------------- Time Capsule --------------------
const saveMessage = document.getElementById('saveMessage');
const futureMessage = document.getElementById('futureMessage');
const viewMessage = document.getElementById('viewMessage');
const messageDisplay = document.getElementById('messageDisplay');

saveMessage.addEventListener('click', () => {
    const message = futureMessage.value.trim();
    const deliveryDate = document.getElementById('futureDeliveryDate').value;

    if (!message || !deliveryDate) {
        alert("Please enter a message and select a delivery date.");
        return;
    }

    localStorage.setItem("timeCapsule", JSON.stringify({ message, deliveryDate }));
    alert('Your message has been saved for the future!');
    futureMessage.value = '';
});

viewMessage.addEventListener('click', () => {
    const savedData = JSON.parse(localStorage.getItem("timeCapsule"));

    if (!savedData) {
        messageDisplay.innerHTML = '<p>No message saved yet.</p>';
        return;
    }

    const currentDate = new Date();
    const deliveryDate = new Date(savedData.deliveryDate);

    messageDisplay.innerHTML = (currentDate >= deliveryDate)
        ? `<p><strong>Your Message:</strong> ${savedData.message}</p>`
        : `<p>Your message will be delivered on ${savedData.deliveryDate}.</p>`;
});

// -------------------- User Authentication --------------------
async function logoutUser() {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    location.reload();
}
