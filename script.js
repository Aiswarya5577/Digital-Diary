document.addEventListener('DOMContentLoaded', function() {
    // Set default user if none exists
    if (!localStorage.getItem('diaryUser')) {
        localStorage.setItem('diaryUser', JSON.stringify({
            username: 'test',
            password: 'test123'
        }));
    }

    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        const storedUser = JSON.parse(localStorage.getItem('diaryUser'));
        if (storedUser) {
            updateNavbarForLoggedInUser(storedUser.username);
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('diaryContainer').style.display = 'block';
            displayEntries();
        }
    }

    // Set default theme
    const savedTheme = localStorage.getItem('preferred-theme') || 'blue';
    changeTheme(savedTheme);
});

function showSection(section) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    document.querySelectorAll('.container').forEach(container => {
        container.style.display = 'none';
    });

    // Remove active class from all nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });

    switch(section) {
        case 'home':
            if (isLoggedIn) {
                document.getElementById('diaryContainer').style.display = 'block';
                document.querySelector('a[onclick="showSection(\'home\')"]').classList.add('active');
            } else {
                document.getElementById('themeContainer').style.display = 'block';
                document.getElementById('loginContainer').style.display = 'block';
            }
            break;
        case 'about':
            createOrShowContainer('aboutContainer', `
                <h2>About Digital Diary</h2>
                <p>Welcome to Digital Diary, your personal space for capturing life's moments. 
                Our platform provides a secure and beautiful environment for you to document 
                your thoughts, memories, and experiences.</p>
            `);
            document.querySelector('a[onclick="showSection(\'about\')"]').classList.add('active');
            break;
        case 'contact':
            createOrShowContainer('contactContainer', `
                <h2>Contact Us</h2>
                <p>Email: support@digitaldiary.com</p>
                <p>Phone: (555) 123-4567</p>
                <p>Address: 123 Diary Street, Web City, Internet 12345</p>
            `);
            document.querySelector('a[onclick="showSection(\'contact\')"]').classList.add('active');
            break;
        case 'signup':
            if (!isLoggedIn) {
                document.getElementById('loginContainer').style.display = 'block';
            }
            break;
    }
}

function createOrShowContainer(id, content) {
    let container = document.getElementById(id);
    if (!container) {
        container = document.createElement('div');
        container.id = id;
        container.className = 'container';
        container.innerHTML = content;
        document.body.appendChild(container);
    }
    container.style.display = 'block';
}

function register(event) {
    if (event) event.preventDefault();
    
    let username = prompt("Create a username:");
    if (!username) return;

    let password = prompt("Create a password:");
    if (!password) return;

    localStorage.setItem('diaryUser', JSON.stringify({ username, password }));
    alert("Account created successfully! Please login with your credentials.");
}

function login(event) {
    if (event) event.preventDefault();
    
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let storedUser = JSON.parse(localStorage.getItem('diaryUser'));
    
    if (storedUser && storedUser.username === username && storedUser.password === password) {
        localStorage.setItem('isLoggedIn', 'true');
        
        // Hide all containers first
        document.querySelectorAll('.container').forEach(container => {
            container.style.display = 'none';
        });

        // Show only the diary container
        document.getElementById('diaryContainer').style.display = 'block';
        
        // Update navbar to show logged-in state
        updateNavbarForLoggedInUser(username);
        
        displayEntries();
        remindOldEntry();
        showMessage('Successfully logged in!', 'success');
    } else {
        showMessage('Invalid credentials! Please try again.', 'error');
    }
}

function logout() {
    localStorage.setItem('isLoggedIn', 'false');
    
    // Reset navbar to original state
    const navLinks = document.querySelector('.nav-links');
    navLinks.innerHTML = `
        <li><a href="#" onclick="showSection('home')">Home</a></li>
        <li><a href="#" onclick="showSection('about')">About</a></li>
        <li><a href="#" onclick="showSection('contact')">Contact</a></li>
        <li><a href="#" onclick="showSection('signup')" class="signup-btn">Sign Up</a></li>
    `;

    // Show login container and hide diary container
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('diaryContainer').style.display = 'none';
    document.getElementById('themeContainer').style.display = 'block';
    
    // Clear form fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    showMessage('Successfully logged out!', 'success');
}

function showLoading(element) {
    element.classList.add('loading');
    element.disabled = true;
}

function hideLoading(element) {
    element.classList.remove('loading');
    element.disabled = false;
}

function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => messageDiv.remove(), 3000);
}

function searchEntries(query) {
    const entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
    return entries.filter(entry => 
        entry.text.toLowerCase().includes(query.toLowerCase()) ||
        entry.date.includes(query)
    );
}

function exportDiary() {
    const entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
    const dataStr = JSON.stringify(entries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'my_diary_entries.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importDiary(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const entries = JSON.parse(e.target.result);
            localStorage.setItem('diaryEntries', JSON.stringify(entries));
            displayEntries();
            showMessage('Diary entries imported successfully!');
        } catch (error) {
            showMessage('Error importing diary entries!', 'error');
        }
    };
    reader.readAsText(file);
}

function addMood(mood) {
    const entry = {
        text: `Feeling ${mood} today!`,
        date: new Date().toLocaleDateString(),
        mood: mood,
        timestamp: new Date().getTime()
    };
    
    let entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
    entries.push(entry);
    localStorage.setItem('diaryEntries', JSON.stringify(entries));
    displayEntries();
}

function getMoodStats() {
    const entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
    const moodCounts = entries.reduce((acc, entry) => {
        if (entry.mood) {
            acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        }
        return acc;
    }, {});
    return moodCounts;
}

function addTags(entryId, tags) {
    let entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
    const entryIndex = entries.findIndex(e => e.timestamp === entryId);
    if (entryIndex !== -1) {
        entries[entryIndex].tags = tags;
        localStorage.setItem('diaryEntries', JSON.stringify(entries));
        displayEntries();
    }
}

function filterByTag(tag) {
    const entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
    return entries.filter(entry => entry.tags && entry.tags.includes(tag));
}

function getWordCount(text) {
    return text.trim().split(/\s+/).length;
}

function saveEntry(event) {
    if (event) event.preventDefault();
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    showLoading(submitButton);
    
    setTimeout(() => {
        try {
            const text = document.getElementById('entryText').value;
            const date = document.getElementById('entryDate').value || new Date().toLocaleDateString();
            const media = document.getElementById('mediaUpload').files[0];
            const wordCount = getWordCount(text);
            
            if (text.trim() === '' && !media) {
                throw new Error("Please write something or upload media before saving!");
            }

            const newEntry = { 
                text, 
                date, 
                media: media ? URL.createObjectURL(media) : null,
                timestamp: new Date().getTime(),
                wordCount
            };
            
            let entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
            entries.push(newEntry);
            localStorage.setItem('diaryEntries', JSON.stringify(entries));
            
            document.getElementById('entryForm').reset();
            displayEntries();
            showMessage('Entry saved successfully!');
        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            hideLoading(submitButton);
        }
    }, 1000); // Simulate loading for demo purposes
}

function changeTheme(themeName) {
    const theme = themeName || document.getElementById('theme').value;
    document.body.className = `theme-${theme}`;
    localStorage.setItem('preferred-theme', theme);
}

function displayEntries() {
    let entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
    let entriesDiv = document.getElementById('entries');
    entriesDiv.innerHTML = '';
    
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));

    entries.forEach((entry, index) => {
        let div = document.createElement('div');
        div.className = 'entry';
        div.innerHTML = `
            <div class="entry-header">
                <strong>${entry.date}</strong>
                <div class="entry-actions">
                    <button class="delete-btn" onclick="deleteEntry(${index})">
                        <span class="delete-icon">×</span>
                    </button>
                </div>
            </div>
            <p>${entry.text}</p>
        `;
        
        if (entry.media) {
            let mediaElement = document.createElement(entry.media.endsWith(".mp4") ? 'video' : 'img');
            mediaElement.src = entry.media;
            mediaElement.controls = true;
            mediaElement.style.maxWidth = '100%';
            div.appendChild(mediaElement);
        }
        
        entriesDiv.appendChild(div);
    });
}

function remindOldEntry() {
    let entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
    if (entries.length > 0) {
        let oldEntry = entries[Math.floor(Math.random() * entries.length)];
        let reminder = document.getElementById('reminder');
        reminder.innerHTML = `Remember this? On ${oldEntry.date} you wrote: "${oldEntry.text.substring(0, 50)}..."`;
    }
}

function updateNavbarForLoggedInUser(username) {
    const navLinks = document.querySelector('.nav-links');
    navLinks.innerHTML = `
        <li><a href="#" onclick="showSection('home')" class="active">Home</a></li>
        <li><a href="#" onclick="showSection('about')">About</a></li>
        <li><a href="#" onclick="showSection('contact')">Contact</a></li>
        <li><a href="#" class="user-profile">Welcome, ${username}</a></li>
        <li><a href="#" onclick="logout()" class="logout-link">Logout</a></li>
    `;
}

// Add this new function for deleting entries
function deleteEntry(index) {
    if (confirm('Are you sure you want to delete this entry?')) {
        let entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
        entries.splice(index, 1);
        localStorage.setItem('diaryEntries', JSON.stringify(entries));
        displayEntries();
        showMessage('Entry deleted successfully!', 'success');
    }
} 