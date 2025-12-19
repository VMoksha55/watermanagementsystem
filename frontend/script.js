// Smart Water Dashboard JavaScript

/* ---------------- LOGIN VALIDATION ---------------- */
const user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "login.html";

// Fill user fields
document.getElementById("uName").innerText = user.name;
document.getElementById("uAddress").innerText = user.address;
document.getElementById("uBlock").innerText = user.block;
document.getElementById("uCity").innerText = user.city;

/* ---------------- LOGOUT ---------------- */
function logout() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

/* ---------------- USER CARD TOGGLE ---------------- */
document.getElementById("toggleUser").onclick = () => {
    const card = document.getElementById("userCard");
    if (card.style.display === "none") {
        card.style.display = "block";
        document.getElementById("toggleUser").innerText = "Hide User Details";
    } else {
        card.style.display = "none";
        document.getElementById("toggleUser").innerText = "Show User Details";
    }
};

/* ---------------- CHART SETUP ---------------- */
const labels = [];
const tdsData = [];
const turbidityData = [];
const tempData = [];
const flowData = [];

const tdsChart = new Chart(document.getElementById("tdsChart"), {
    type: 'line',
    data: {
        labels,
        datasets: [{
            label: 'TDS (ppm)',
            data: tdsData,
            borderColor: 'blue',
            tension: 0.3,
            fill: false
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const turbidityChart = new Chart(document.getElementById("turbidityChart"), {
    type: 'line',
    data: {
        labels,
        datasets: [{
            label: 'Turbidity (NTU)',
            data: turbidityData,
            borderColor: 'orange',
            tension: 0.3,
            fill: false
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const tempChart = new Chart(document.getElementById("tempChart"), {
    type: 'line',
    data: {
        labels,
        datasets: [{
            label: 'Temperature (°C)',
            data: tempData,
            borderColor: 'red',
            tension: 0.3,
            fill: false
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const flowChart = new Chart(document.getElementById("flowChart"), {
    type: 'line',
    data: {
        labels,
        datasets: [{
            label: 'Flow Rate (L/min)',
            data: flowData,
            borderColor: 'green',
            tension: 0.3,
            fill: false
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

/* ---------------- FETCH LIVE DATA ---------------- */
async function loadData() {
    try {
        const res = await fetch("http://localhost:5000/api/history");
        const data = await res.json();

        if (!data.length) return;

        const latest = data[data.length - 1];

        document.getElementById("latest").innerHTML = `
            <b>Device:</b> ${latest.deviceId || 'ESP32'}<br>
            <b>Time:</b> ${new Date(latest.ts).toLocaleString()}<br>
            <b>TDS:</b> ${latest.tds_ppm} ppm<br>
            <b>Turbidity:</b> ${latest.turbidity} NTU<br>
            <b>Temperature:</b> ${latest.temperature_c} °C<br>
            <b>Flow:</b> ${latest.flow_lpm} L/min
        `;

        // Update alert box
        const alertBox = document.getElementById("alertBox");
        if (latest.tds_ppm > 600 || latest.turbidity > 50) {
            alertBox.innerHTML = "<span class='alert-bad'>⚠ Poor Water Quality Detected</span>";
        } else {
            alertBox.innerHTML = "<span class='alert-good'>✓ Water Quality Normal</span>";
        }

        // Update charts
        const time = new Date(latest.ts).toLocaleTimeString();
        labels.push(time);
        tdsData.push(latest.tds_ppm);
        turbidityData.push(latest.turbidity);
        tempData.push(latest.temperature_c);
        flowData.push(latest.flow_lpm);

        // Keep max 20 points
        if (labels.length > 20) {
            labels.shift();
            tdsData.shift();
            turbidityData.shift();
            tempData.shift();
            flowData.shift();
        }

        tdsChart.update();
        turbidityChart.update();
        tempChart.update();
        flowChart.update();

        // Update history table
        let rows = "";
        data.reverse().slice(0, 20).forEach(r => {
            const status = (r.tds_ppm > 600 || r.turbidity > 50) ? "Alert" : "OK";
            rows += `
                <tr>
                    <td>${new Date(r.ts).toLocaleString()}</td>
                    <td>${r.tds_ppm}</td>
                    <td>${r.turbidity}</td>
                    <td>${r.temperature_c}</td>
                    <td>${status}</td>
                </tr>
            `;
        });

        document.getElementById("historyTable").innerHTML = rows;
    } catch (error) {
        console.error("Error loading data:", error);
        document.getElementById("latest").innerHTML = "Error loading data. Check console.";
    }
}

/* ---------------- SOCKET.IO LIVE UPDATES ---------------- */
const socket = io("http://localhost:5000");

socket.on("connect", () => {
    console.log("Connected to server for live updates");
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});

function addLiveGraphPoint(tds, turbidity, temp, flow) {
    const time = new Date().toLocaleTimeString();
    labels.push(time);
    tdsData.push(tds);
    turbidityData.push(turbidity);
    tempData.push(temp);
    flowData.push(flow);

    // Keep max 20 points
    if (labels.length > 20) {
        labels.shift();
        tdsData.shift();
        turbidityData.shift();
        tempData.shift();
        flowData.shift();
    }

    tdsChart.update();
    turbidityChart.update();
    tempChart.update();
    flowChart.update();
}

socket.on("newReading", (data) => {
    console.log("New reading received:", data);

    // Update live values
    document.getElementById("tdsValue").innerText = data.tds_ppm;
    document.getElementById("turbidityValue").innerText = data.turbidity;
    document.getElementById("tempValue").innerText = data.temperature_c;
    document.getElementById("flowValue").innerText = data.flow_lpm;

    // Update latest reading display
    document.getElementById("latest").innerHTML = `
        <b>Device:</b> ${data.deviceId || 'ESP32'}<br>
        <b>Time:</b> ${new Date(data.ts).toLocaleString()}<br>
        <b>TDS:</b> ${data.tds_ppm} ppm<br>
        <b>Turbidity:</b> ${data.turbidity} NTU<br>
        <b>Temperature:</b> ${data.temperature_c} °C<br>
        <b>Flow:</b> ${data.flow_lpm} L/min
    `;

    // Update alert box
    const alertBox = document.getElementById("alertBox");
    if (data.tds_ppm > 600 || data.turbidity > 50) {
        alertBox.innerHTML = "<span class='alert-bad'>⚠ Poor Water Quality Detected</span>";
    } else {
        alertBox.innerHTML = "<span class='alert-good'>✓ Water Quality Normal</span>";
    }

    // Update charts
    addLiveGraphPoint(data.tds_ppm, data.turbidity, data.temperature_c, data.flow_lpm);

    // Update history table (fetch latest data)
    updateHistoryTable();
});

// Load initial data once on page load
loadData();
