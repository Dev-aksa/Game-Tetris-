const API_URL = "https://6877a97ddba809d901f06597.mockapi.io/scores";
const tbody = document.getElementById("leaderboard-body");

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    // Urutkan dari skor tertinggi
    data.sort((a, b) => b.score - a.score);
    data.forEach(entry => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.name}</td>
        <td>${entry.score}</td>
        <td>${new Date(entry.createdAt).toLocaleString()}</td>
      `;
      tbody.appendChild(row);
    });
  })
  .catch(error => {
    console.error("Gagal memuat leaderboard:", error);
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="3">Gagal memuat data</td>`;
    tbody.appendChild(row);
  });

function goBack() {
  window.location.href = "index.html";
}
