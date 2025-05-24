let room = null;

     async function joinRoom() {
       const urlParams = new URLSearchParams(window.location.search);
       const roomName = urlParams.get('room') || 'default-room';
       const identity = prompt('Enter your name (e.g., Patient_John or Doctor_Smith):');

       if (!identity) {
         alert('Name is required.');
         return;
       }

       document.getElementById('join-button').classList.add('hidden');
       document.getElementById('leave-button').classList.remove('hidden');

       try {
         const response = await fetch('https://chronicdocs-video-backend.onrender.com', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ identity: identity, roomName: roomName })
         });
         const data = await response.json();
         const token = data.token;

         room = await Twilio.Video.connect(token, {
           name: roomName,
           audio: true,
           video: { width: 640, height: 480 }
         });

         if (identity.includes('Patient')) {
           document.getElementById('waiting-room').style.display = 'block';
         }

         const localVideo = document.createElement('video');
         localVideo.autoplay = true;
         localVideo.muted = true;
         document.getElementById('video-container').appendChild(localVideo);
         room.localParticipant.videoTracks.forEach(track => {
           track.track.attach(localVideo);
         });

         room.participants.forEach(handleParticipant);
         room.on('participantConnected', handleParticipant);
         room.on('participantDisconnected', () => {
           if (identity.includes('Patient') && room.participants.size === 0) {
             document.getElementById('waiting-room').style.display = 'block';
           }
         });

         function handleParticipant(participant) {
           const participantDiv = document.createElement('div');
           document.getElementById('video-container').appendChild(participantDiv);
           participant.on('trackSubscribed', track => {
             participantDiv.appendChild(track.attach());
             if (identity.includes('Patient')) {
               document.getElementById('waiting-room').style.display = 'none';
             }
           });
         }
       } catch (error) {
         console.error('Error:', error);
         alert('Failed to join the consultation. Please try again.');
         document.getElementById('join-button').classList.remove('hidden');
         document.getElementById('leave-button').classList.add('hidden');
       }
     }

     function leaveRoom() {
       if (room) {
         room.disconnect();
         room = null;
         document.getElementById('video-container').innerHTML = '';
         document.getElementById('waiting-room').style.display = 'none';
         document.getElementById('join-button').classList.remove('hidden');
         document.getElementById('leave-button').classList.add('hidden');
       }
     }