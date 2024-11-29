function buildBar(entry, startBoundary, endBoundary, totalBoundarySeconds) {
  const roomName = entry.room;
  const timeSlots = entry.info; // Array of time slots

  const barContainer = document.createElement('div');
  barContainer.classList.add('bar-container');

  const bar = document.createElement('div');
  bar.classList.add('bar');

  const roomLabel = document.createElement('a');
  const roomInfo = roomName.split(" ");
  roomLabel.href = `https://ethz.ch/de/utils/location.html?building=${roomInfo[0]}&floor=${roomInfo[1]}&room=${roomInfo[2]}`;
  roomLabel.classList.add('room-name');
  roomLabel.textContent = roomName;

  // Add occupied time slots as red segments
  timeSlots.forEach(slot => {
    const fromTime = new Date((new Date(slot.from)).getTime() + (new Date(slot.from)).getTimezoneOffset() * 60000);
    const toTime = new Date((new Date(slot.to)).getTime() + (new Date(slot.to)).getTimezoneOffset() * 60000);

    // Skip if outside the boundaries
    if (toTime <= startBoundary || fromTime >= endBoundary) return;

    // Adjust times to fit within the boundaries
    const adjustedFromTime = fromTime < startBoundary ? startBoundary : fromTime;
    const adjustedToTime = toTime > endBoundary ? endBoundary : toTime;

    const timeSlot = document.createElement('div');
    timeSlot.classList.add('time-slot');

    // Calculate position and width based on the 6:00 AM - 10:00 PM range
    const fromPercentage = ((adjustedFromTime - startBoundary) / (totalBoundarySeconds * 1000)) * 100;
    const toPercentage = ((adjustedToTime - startBoundary) / (totalBoundarySeconds * 1000)) * 100;

    console.log(adjustedFromTime);

    timeSlot.style.left = `${fromPercentage}%`;
    timeSlot.style.width = `${toPercentage - fromPercentage}%`;

    bar.appendChild(timeSlot);
  });

  bar.appendChild(roomLabel);
  barContainer.appendChild(bar);
  return barContainer;
}

async function loadSchedule() {
  const url = 'https://rooms.jlabs.ch/api'; // Replace with your API URL
  const response = await fetch(url);
  const data = await response.json();

  const scheduleContainer = document.getElementById('schedule');
  const now = new Date();

  // Define the boundaries: 6:00 AM to 10:00 PM
  const startBoundary = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
  const endBoundary = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0, 0);
  const totalBoundarySeconds = (endBoundary - startBoundary) / 1000;

  let t = new Date(startBoundary);
  t.setHours(t.getHours() + 2);
  for (; t < endBoundary; t.setHours(t.getHours() + 2)) {
    let currentTimePercentage = ((t - startBoundary) / (totalBoundarySeconds * 1000)) * 100;
    console.log(currentTimePercentage);
    // Create the vertical line
    let currentTimeLine = document.createElement('div');
    currentTimeLine.classList.add('hourly-time-line');
    currentTimeLine.style.left = `${currentTimePercentage}%`;

    scheduleContainer.appendChild(currentTimeLine);
  }


  // Add current time indicator if within boundaries
  if (now >= startBoundary && now <= endBoundary) {
    const currentTimePercentage = ((now - startBoundary) / (totalBoundarySeconds * 1000)) * 100;
    // Create the vertical line
    const currentTimeLine = document.createElement('div');
    currentTimeLine.classList.add('current-time-line');
    currentTimeLine.style.left = `${currentTimePercentage}%`;

    console.log(now);

    scheduleContainer.appendChild(currentTimeLine);
  }

  let building_batches = new Map();
  data.forEach(entry => {
    let building = entry.room.split(" ")[0];
    if (!building_batches.has(building)) {
      building_batches.set(building, []);
    }
    building_batches.get(building).push(entry);
  });

  building_batches.forEach((building_data, building_name) => {
    const toggleButton = document.createElement('button');
    toggleButton.textContent = building_name;

    const batchContainer = document.createElement('div');
    building_data.forEach(entry => {
      const barContainer = buildBar(entry, startBoundary, endBoundary, totalBoundarySeconds);
      batchContainer.appendChild(barContainer);
    });
    toggleButton.addEventListener('click', () => {
      if (batchContainer.style.display === 'none') {
        batchContainer.style.display = 'block';
      } else {
        batchContainer.style.display = 'none';
      }
    });
    scheduleContainer.appendChild(toggleButton);
    scheduleContainer.appendChild(batchContainer);
  });

}

loadSchedule();
